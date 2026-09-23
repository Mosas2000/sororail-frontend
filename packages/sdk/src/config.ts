import { Networks } from "@stellar/stellar-sdk";

/** Shared defaults for the testnet-only examples and reference app. */
export const TESTNET_DEFAULTS = {
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: Networks.TESTNET,
  nativeToken:
    "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
} as const;
