import { ValidationError, toStroops } from "@sororail/sdk";

export interface ParsedLine {
  line: number;
  to: string;
  amount: string;
  stroops?: bigint;
  error?: string;
}

export function parseCsv(text: string): ParsedLine[] {
  return text
    .split("\n")
    .map((raw, index) => ({ raw: raw.trim(), index }))
    .filter(({ raw }) => raw.length > 0 && !raw.startsWith("#"))
    .map(({ raw, index }): ParsedLine => {
      const parts = raw.split(",").map((part) => part.trim());
      const line = index + 1;

      if (parts.length > 2) {
        return {
          line,
          to: parts[0] || "",
          amount: parts[1] || "",
          error: `Row has ${parts.length} columns; expected 2 (address,amount)`,
        };
      }

      const [to = "", amount = ""] = parts;

      if (!/^G[A-Z2-7]{55}$/.test(to)) {
        return { line, to, amount, error: "Not a valid account address (G…)" };
      }
      try {
        const stroops = toStroops(amount);
        if (stroops <= 0n) {
          return { line, to, amount, error: "Amount must be greater than zero" };
        }
        return { line, to, amount, stroops };
      } catch (error) {
        return {
          line,
          to,
          amount,
          error: error instanceof ValidationError ? error.message : "Invalid amount",
        };
      }
    });
}

/** Removes successfully paid source rows while preserving comments and errors. */
export function removeCsvLines(
  text: string,
  lineNumbers: Iterable<number>,
): string {
  const removed = new Set(lineNumbers);
  return text
    .split("\n")
    .filter((_, index) => !removed.has(index + 1))
    .join("\n");
}
