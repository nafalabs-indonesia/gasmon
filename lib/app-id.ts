import { keccak256, toBytes } from "viem";

/**
 * appId in the contract is bytes32 — we derive it from the app domain/name so that
 * it is deterministic & unique without needing an extra mapping in the contract.
 * Normalize to lowercase + trim first so "Ruaang.xyz" and "ruaang.xyz"
 * produce the same appId.
 */
export function computeAppId(domainOrName: string): `0x${string}` {
  const normalized = domainOrName.trim().toLowerCase();
  return keccak256(toBytes(normalized));
}