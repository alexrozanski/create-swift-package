export const versionCompareFn = versionCompareMapFn((x: string) => x);

export function versionCompareMapFn<T>(
  toVersion: (x: T) => string
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const aComponents = toVersion(a).split(".").map(Number);
    const bComponents = toVersion(b).split(".").map(Number);

    const maxLength = Math.max(aComponents.length, bComponents.length);

    for (let i = 0; i < maxLength; i++) {
      const aVal = aComponents[i] || 0;
      const bVal = bComponents[i] || 0;

      if (aVal > bVal) {
        return -1;
      } else if (aVal < bVal) {
        return 1;
      }
    }

    return 0;
  };
}
