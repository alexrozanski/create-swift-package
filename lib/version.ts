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

export function greaterThanOrEqual(v1: string, v2: string) {
  const v1Components = v1.split(".").map(Number);
  const v2Components = v2.split(".").map(Number);

  const maxLength = Math.max(v1Components.length, v2Components.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Component = v1Components[i] || 0;
    const v2Component = v2Components[i] || 0;
    if (v1Component > v2Component) {
      return true;
    } else if (v1Component < v2Component) {
      return false;
    }
  }

  // All components the same so true.
  return true;
}

export function lessThan(v1: string, v2: string) {
  const v1Components = v1.split(".").map(Number);
  const v2Components = v2.split(".").map(Number);

  const maxLength = Math.max(v1Components.length, v2Components.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Component = v1Components[i] || 0;
    const v2Component = v2Components[i] || 0;
    if (v1Component < v2Component) {
      return true;
    } else if (v1Component > v2Component) {
      return false;
    }
  }

  // All components the same so false.
  return false;
}
