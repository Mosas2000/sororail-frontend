# Examples

Runnable scripts, one per contract. They are documentation and integration
tests at the same time: they run against a real network, so an encoding or
decoding mistake in the SDK fails here rather than passing quietly the way a
mocked unit test would. Each one asserts what it demonstrates (`support.ts`),
so a wrong result exits non-zero instead of just printing.

```bash
pnpm tsx examples/stream-lifecycle.ts
```

## Running them all

`run-integration.sh` does the setup below for you: it creates and
friendbot-funds two throwaway testnet accounts, deploys a fresh instance of
each contract, runs every example, and exits non-zero if any fails. It needs
the `stellar` CLI and the contracts built to wasm.

```bash
WASM_DIR=/path/to/sororail-contracts/target/wasm32v1-none/release \
  pnpm --filter @sororail/sdk test:integration
```

The scheduled `integration` job in `.github/workflows/ci.yml` does exactly
this. Only `stream-lifecycle.ts` has been run against live testnet by hand so
far; the other four have not been recorded as passing until that job has.

## Setup

```bash
# A funded testnet account.
stellar keys generate --network testnet --fund alice
export SOROBAN_SECRET_KEY=$(stellar keys show alice)

# A second account to receive.
stellar keys generate --network testnet --fund bob
export RECIPIENT_PUBLIC_KEY=$(stellar keys address bob)
export RECIPIENT_SECRET_KEY=$(stellar keys show bob)

# Bob also plays beneficiary and payee. The recurring example needs his secret
# to run the charge step, and the stream example for the withdrawal.
export BENEFICIARY_PUBLIC_KEY=$RECIPIENT_PUBLIC_KEY
export PAYEE_PUBLIC_KEY=$RECIPIENT_PUBLIC_KEY
export PAYEE_SECRET_KEY=$RECIPIENT_SECRET_KEY
```

Then deploy the instance the example needs — see
[DEPLOYMENTS.md](https://github.com/Sororail/sororail-contracts/blob/main/DEPLOYMENTS.md)
in the contracts repo — and set its address:

```bash
export STREAM_CONTRACT_ID=C...
```

By default the examples use the SDK's shared `TESTNET_DEFAULTS` (testnet RPC,
`Networks.TESTNET`, and native XLM's Stellar Asset Contract). Override them
with `RPC_URL`, `NETWORK_PASSPHRASE`, or `TOKEN_ID` as needed.

The web app uses the same defaults with browser-prefixed names:
`NEXT_PUBLIC_RPC_URL` maps to `RPC_URL`, `NEXT_PUBLIC_TOKEN_ID` maps to
`TOKEN_ID`, and its network passphrase is intentionally fixed to testnet rather
than configurable. The web app validates the RPC's network at startup and
refuses to operate if it does not match.

## Deploy a fresh instance for each run

Every contract except `batch_payout` holds **one position per deployed
instance**. `create` / `init` / `authorize` claims that instance permanently,
and a second run against the same address fails with `AlreadyInitialized`. So
deploy a new one per run:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/sororail_stream.optimized.wasm \
  --source alice --network testnet
```

`batch_payout` is the exception — it is stateless, so one deployment is
reusable indefinitely.

## What each example shows

| Example | Covers |
|---|---|
| `stream-lifecycle.ts` | create, simulate, sign, send, read back, withdraw, and the conservation invariant on-chain |
| `escrow-lifecycle.ts` | init, fund, release; the contract holds the funds, then pays exactly the beneficiary |
| `vesting-lifecycle.ts` | the schedule as a pure function of time, the cliff, and revoke returning only the unvested part |
| `recurring-subscription.ts` | authorize, approve the token allowance (the real cap), wait for the period, charge as the payee, cancel |
| `batch-payout.ts` | preview before signing (and that it sends nothing), reading the cap, chunking an oversized payroll, and the recipient's balance |

## A thing worth knowing before you build a UI

An "available to withdraw" figure is **stale the moment you read it**. Stream
accrual is computed from ledger time, so it keeps rising between your balance
read and your transaction landing.

The first live run of `stream-lifecycle.ts` reported `can withdraw 0.00016` and
then withdrew `0.00026` — both correct, seconds apart. Show such figures as
"at least", or re-read immediately before submitting, rather than presenting
them as exact.
