import { expect, test } from "@playwright/test";

import { resolveExplorerBase } from "../src/lib/network";

/** Explorer links follow the configured RPC instead of assuming testnet. */
test.describe("explorer base", () => {
  test("uses the testnet explorer for a testnet RPC", () => {
    expect(resolveExplorerBase("https://soroban-testnet.stellar.org")).toBe(
      "https://stellar.expert/explorer/testnet",
    );
  });

  test("has no explorer for a local node or futurenet", () => {
    expect(resolveExplorerBase("http://localhost:8000/rpc")).toBeNull();
    expect(resolveExplorerBase("https://rpc-futurenet.stellar.org")).toBeNull();
  });

  test("has no explorer for an unparseable RPC URL", () => {
    expect(resolveExplorerBase("not a url")).toBeNull();
  });

  test("an explicit override wins, without a trailing slash", () => {
    expect(
      resolveExplorerBase("http://localhost:8000/rpc", "https://explorer.example/"),
    ).toBe("https://explorer.example");
    expect(
      resolveExplorerBase("https://soroban-testnet.stellar.org", "https://explorer.example"),
    ).toBe("https://explorer.example");
  });

  test("a blank override falls back to the RPC", () => {
    expect(resolveExplorerBase("https://soroban-testnet.stellar.org", "  ")).toBe(
      "https://stellar.expert/explorer/testnet",
    );
  });
});
