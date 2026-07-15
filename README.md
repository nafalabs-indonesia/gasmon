# GasMon

Sponsor-funded gas top-ups for dApp users on Monad — no code required. dApp
owners register their app, deposit MON into a vault, embed one `<iframe>`,
and new users with zero MON balance get a small free top-up to complete
their first transaction.

## Why

Onboarding friction on any chain: a brand-new wallet has 0 native token,
can't pay gas, can't do anything. GasVault lets dApp builders sponsor that
first top-up without building any relayer/paymaster infra themselves.

## Architecture

- **`contracts/GasVault.sol`** — on-chain custody. dApp owners `registerApp`
  + `deposit` MON. Authorized relayer wallets call `topUp` to send MON to a
  user, debited from that app's vault balance.
- **Postgres DB** — stores per-app claim rules (amount, max claims per
  wallet, cooldown, daily budget) and claim history for rate-limiting.
  On-chain state is intentionally minimal (just balances) to keep gas costs
  low; all the "who can claim how much, how often" logic lives off-chain.
- **`/api/topup`** — validates a claim request against DB rules, then calls
  `topUp()` on-chain via a server-held relayer wallet.
- **`/widget/[appId]`** — the embeddable page. dApp owners paste:
  ```html
  <iframe src="https://yourapp.com/widget/0xAPPID" width="320" height="140" style="border:none;"></iframe>
  ```
- **`/dashboard`** — sponsor UI: register app, deposit, configure claim
  rules, get the embed snippet.

## Setup

1. **Deploy the contract** — open [remix.ethereum.org](https://remix.ethereum.org),
   paste `contracts/GasVault.sol`, compile with Solidity `0.8.24`, deploy via
   "Injected Provider - MetaMask" (connected to Monad Testnet). Constructor
   arg `_initialRelayer` = address of a **new wallet you create specifically
   for this** (its private key goes in `.env`, so don't reuse your main wallet).
2. **Fund the relayer wallet** with a small amount of testnet MON (it pays
   gas for `topUp` calls — separate from the vault deposits sponsors make).
   Get testnet MON from [faucet.monad.xyz](https://faucet.monad.xyz).
3. **Create a DB** — new Neon/Supabase Postgres project, run the SQL in
   `schema.sql`.
4. `npm install`
5. Copy `.env.example` → `.env.local`, fill in `DATABASE_URL`,
   `NEXT_PUBLIC_GAS_VAULT_ADDRESS`, `RELAYER_PRIVATE_KEY`.
6. `npm run dev`

## Flow

1. Sponsor connects wallet on `/dashboard`, registers an app (this calls
   `registerApp` on-chain + saves config to DB).
2. Sponsor deposits MON into their app's vault.
3. Sponsor copies the iframe embed snippet into their own dApp's site.
4. End-user visits the sponsor's dApp with an empty wallet, sees the widget,
   clicks "Get Gas" → `/api/topup` checks DB rules → calls `topUp()` on-chain
   → user receives MON directly in their wallet, no separate account needed.