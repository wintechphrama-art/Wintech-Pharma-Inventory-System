/**
 * Generates the next employee code in the EMP### format.
 * Finds the highest existing number and increments by 1.
 */
export function generateNextEmployeeCode(
  existingCodes: string[]
): string {
  const prefix = "EMP";

  const numbers = existingCodes
    .filter((code) => code.startsWith(prefix))
    .map((code) => {
      const numPart = code.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      return isNaN(parsed) ? 0 : parsed;
    });

  const maxNum =
    numbers.length > 0
      ? Math.max(...numbers)
      : 0;

  const nextNum = maxNum + 1;

  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}
