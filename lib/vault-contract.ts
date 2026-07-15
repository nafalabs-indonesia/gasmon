export const GAS_VAULT_ABI = [
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [{ name: "_initialRelayer", type: "address" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "isRelayer",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "apps",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "balance", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "transferOwnership",
    stateMutability: "nonpayable",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setRelayerStatus",
    stateMutability: "nonpayable",
    inputs: [
      { name: "relayerAddress", type: "address" },
      { name: "status", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "forceSetAppOwner",
    stateMutability: "nonpayable",
    inputs: [
      { name: "appId", type: "bytes32" },
      { name: "newOwner", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "registerApp",
    stateMutability: "nonpayable",
    inputs: [{ name: "appId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "transferAppOwnership",
    stateMutability: "nonpayable",
    inputs: [
      { name: "appId", type: "bytes32" },
      { name: "newOwner", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [{ name: "appId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "appId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "topUp",
    stateMutability: "nonpayable",
    inputs: [
      { name: "appId", type: "bytes32" },
      { name: "user", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getAppBalance",
    stateMutability: "view",
    inputs: [{ name: "appId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "AppRegistered",
    inputs: [
      { indexed: true, name: "appId", type: "bytes32" },
      { indexed: true, name: "owner", type: "address" },
    ],
  },
  {
    type: "event",
    name: "AppOwnerTransferred",
    inputs: [
      { indexed: true, name: "appId", type: "bytes32" },
      { indexed: true, name: "oldOwner", type: "address" },
      { indexed: true, name: "newOwner", type: "address" },
    ],
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { indexed: true, name: "appId", type: "bytes32" },
      { indexed: true, name: "from", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { indexed: true, name: "appId", type: "bytes32" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "ToppedUp",
    inputs: [
      { indexed: true, name: "appId", type: "bytes32" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "RelayerStatusUpdated",
    inputs: [
      { indexed: true, name: "relayer", type: "address" },
      { indexed: false, name: "status", type: "bool" },
    ],
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      { indexed: true, name: "oldOwner", type: "address" },
      { indexed: true, name: "newOwner", type: "address" },
    ],
  },
  // Custom Errors in ABI for automatic decoding by viem
  { type: "error", name: "NotOwner", inputs: [] },
  { type: "error", name: "NotRelayer", inputs: [] },
  { type: "error", name: "NotAppOwner", inputs: [] },
  { type: "error", name: "AppNotFound", inputs: [] },
  { type: "error", name: "AppAlreadyExists", inputs: [] },
  { type: "error", name: "ZeroAddress", inputs: [] },
  { type: "error", name: "ZeroDeposit", inputs: [] },
  { type: "error", name: "InsufficientBalance", inputs: [] },
  { type: "error", name: "TransferFailed", inputs: [] },
] as const;

export const GAS_VAULT_ADDRESS = (process.env.NEXT_PUBLIC_GAS_VAULT_ADDRESS ?? "") as `0x${string}`;

export const GAS_VAULT_CONTRACT = {
  address: GAS_VAULT_ADDRESS,
  abi: GAS_VAULT_ABI,
} as const;