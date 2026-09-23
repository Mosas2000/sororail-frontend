#!/usr/bin/env bash
#
# Runs every example against a live network, each on a freshly deployed
# contract instance, and exits non-zero if any of them fails.
#
# The examples assert what they demonstrate (see support.ts), so this is the
# SDK's integration suite. It needs the `stellar` CLI and the contracts built
# to wasm:
#
#   WASM_DIR=/path/to/sororail-contracts/target/wasm32v1-none/release \
#     pnpm --filter @sororail/sdk test:integration
#
# It generates and friendbot-funds its own throwaway testnet accounts, so no
# secrets are needed. Testnet only: `--fund` uses friendbot.
set -euo pipefail

: "${WASM_DIR:?Set WASM_DIR to the directory holding the built contract .wasm files}"
NETWORK="${STELLAR_NETWORK:-testnet}"

cd "$(dirname "${BASH_SOURCE[0]}")/.."

run_id="it$$"
payer="${run_id}_payer"
other="${run_id}_other"

echo "==> creating and funding accounts"
stellar keys generate "$payer" --network "$NETWORK" --fund
stellar keys generate "$other" --network "$NETWORK" --fund

SOROBAN_SECRET_KEY="$(stellar keys show "$payer")"
export SOROBAN_SECRET_KEY
other_public="$(stellar keys address "$other")"
other_secret="$(stellar keys show "$other")"

# The second account plays the recipient / beneficiary / payee in turn.
export RECIPIENT_PUBLIC_KEY="$other_public"
export RECIPIENT_SECRET_KEY="$other_secret"
export BENEFICIARY_PUBLIC_KEY="$other_public"
export PAYEE_PUBLIC_KEY="$other_public"
export PAYEE_SECRET_KEY="$other_secret"

# Prints the wasm for a contract, matched on its name.
wasm_for() {
  local found
  found="$(find "$WASM_DIR" -maxdepth 1 -name "*$1*.wasm" | sort | head -n 1)"
  if [ -z "$found" ]; then
    echo "No .wasm matching '$1' in $WASM_DIR" >&2
    return 1
  fi
  echo "$found"
}

# Every contract except batch_payout holds one position per instance, so each
# run needs its own. Prints the new contract id.
deploy() {
  stellar contract deploy --wasm "$(wasm_for "$1")" --source "$payer" --network "$NETWORK"
}

failed=()
summary=""

# usage: run_example <label> <script> <ENV_VAR> <contract-name>
run_example() {
  local label="$1" script="$2" env_var="$3" contract="$4"
  echo
  echo "==> $label"
  local id status=0
  if id="$(deploy "$contract")"; then
    echo "deployed $contract at $id"
    env "$env_var=$id" pnpm exec tsx "examples/$script" || status=$?
  else
    status=$?
  fi

  if [ "$status" -eq 0 ]; then
    summary+="| $label | passed |"$'\n'
  else
    summary+="| $label | **FAILED** |"$'\n'
    failed+=("$label")
  fi
}

run_example "stream"    stream-lifecycle.ts        STREAM_CONTRACT_ID    stream
run_example "escrow"    escrow-lifecycle.ts        ESCROW_CONTRACT_ID    escrow
run_example "vesting"   vesting-lifecycle.ts       VESTING_CONTRACT_ID   vesting
run_example "recurring" recurring-subscription.ts  RECURRING_CONTRACT_ID recurring
run_example "batch"     batch-payout.ts            BATCH_CONTRACT_ID     batch_payout

report="| Example | Result |"$'\n'"|---|---|"$'\n'"$summary"
echo
echo "$report"
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  echo "$report" >> "$GITHUB_STEP_SUMMARY"
fi

if [ "${#failed[@]}" -gt 0 ]; then
  echo "Failed: ${failed[*]}" >&2
  exit 1
fi
