import {
  ContractError,
  ErrorCode,
  errorMessages,
  type ErrorCodeName,
} from "@sororail/sdk";
import { expect, test } from "@playwright/test";

import { RECOVERY, recoveryFor } from "../src/lib/recovery";

/**
 * No browser needed: this is a table check. It fails the moment a variant is
 * added to the SDK's `ErrorCode` without a recovery step, so a user never
 * lands on an error with the SDK sentence and no next move.
 */
const names = Object.keys(ErrorCode) as ErrorCodeName[];

test.describe("error recovery", () => {
  test("every ErrorCode variant has recovery text", () => {
    for (const name of names) {
      const error = new ContractError(ErrorCode[name], name, errorMessages[name]);
      expect(recoveryFor(error), name).toBeTruthy();
    }
  });

  test("has no recovery text for a variant the SDK no longer defines", () => {
    expect(Object.keys(RECOVERY).sort()).toEqual([...names].sort());
  });

  test("gives nothing for errors that are not contract failures", () => {
    expect(recoveryFor(new Error("boom"))).toBeNull();
    expect(recoveryFor("boom")).toBeNull();
    expect(recoveryFor(new ContractError(999, "Unknown", "Unknown error"))).toBeNull();
  });
});
