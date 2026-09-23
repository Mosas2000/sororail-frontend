/**
 * Helpers shared by the examples.
 *
 * The examples double as integration tests: they run against a real network,
 * so a wrong encoding or decoding fails here. That only works if they *fail* —
 * a script that prints and exits 0 passes even when the contract did the wrong
 * thing. `check` and `checkEqual` turn what each example demonstrates into an
 * assertion, so the scheduled integration job goes red on a regression.
 */
import { BaseClient, type PreparedCall } from "../src/clients/base.js";
import { addr, asBigInt, asVoid, i128, u32 } from "../src/utils/scval.js";

/** Fails the run when `condition` is false. */
export function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Check failed: ${message}`);
}

/** Fails the run unless `actual === expected`. Works for bigint amounts. */
export function checkEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `Check failed: ${label} — expected ${String(expected)}, got ${String(actual)}`,
    );
  }
}

/** Polls `predicate` until it is true, or fails after `timeoutMs`. */
export async function waitUntil(
  what: string,
  predicate: () => Promise<boolean>,
  { timeoutMs = 120_000, intervalMs = 3_000 } = {},
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!(await predicate())) {
    if (Date.now() > deadline) {
      throw new Error(`Timed out after ${timeoutMs / 1000}s waiting for ${what}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/**
 * The two SEP-41 token calls the examples need: reading a balance to check
 * where money went, and `approve`, which the recurring contract requires
 * before a payee can charge.
 */
export class TokenClient extends BaseClient {
  balance(id: string): Promise<bigint> {
    return this.read("balance", [addr(id)], (value) => asBigInt(value, "balance"));
  }

  /** Lets `spender` pull up to `amount` from `from`. Requires `from`'s signature. */
  async approve(args: {
    from: string;
    spender: string;
    amount: bigint;
  }): Promise<PreparedCall<void>> {
    // The allowance expires at a ledger sequence, not a timestamp. Roughly
    // 5,000 ledgers is several hours, comfortably longer than an example run.
    const { sequence } = await this.server.getLatestLedger();
    return this.prepare(
      "approve",
      [addr(args.from), addr(args.spender), i128(args.amount), u32(sequence + 5_000)],
      asVoid,
    );
  }
}
