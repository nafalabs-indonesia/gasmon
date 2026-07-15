// ⚠️ SERVER-ONLY. This file holds RELAYER_PRIVATE_KEY — NEVER import it
// from "use client" components. For reading on-chain data on the client,
// use lib/public-client.ts.
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "./chains";

function getRelayerAccount() {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  if (!pk) throw new Error("RELAYER_PRIVATE_KEY is not set in environment variables");
  const formatted = pk.startsWith("0x") ? pk : `0x${pk}`;
  return privateKeyToAccount(formatted as `0x${string}`);
}

export function getRelayerWalletClient() {
  return createWalletClient({
    account: getRelayerAccount(),
    chain: monadTestnet,
    transport: http(),
  });
}