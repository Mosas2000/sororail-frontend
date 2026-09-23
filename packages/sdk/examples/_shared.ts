import { TESTNET_DEFAULTS } from "../src/index.js";

export const RPC_URL = process.env["RPC_URL"] ?? TESTNET_DEFAULTS.rpcUrl;
export const NETWORK =
  process.env["NETWORK_PASSPHRASE"] ?? TESTNET_DEFAULTS.networkPassphrase;
export const TOKEN = process.env["TOKEN_ID"] ?? TESTNET_DEFAULTS.nativeToken;

export function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Set ${name} before running this example.`);
    process.exit(1);
  }
  return value;
}
