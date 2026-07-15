import { createPublicClient, http } from "viem";
import { monadTestnet } from "./chains";

export const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
});