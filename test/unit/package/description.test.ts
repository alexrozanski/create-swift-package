import { Config } from "../../../lib/config";
import { makePackageDescription } from "../../../lib/package/description";
import { makeTargets } from "../../../lib/package/target";
import { makeConfig } from "../util";

describe("Package description unit tests", () => {
  test("creates simple library package description", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    const description = makePackageDescription(config, targets);

    expect(description.packageName).toBe("TestPackage");
    expect(description.products.length).toBe(1);
    expect(description.targets.length).toBe(1);
  });

  test("creates simple library package description", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    const description = makePackageDescription(config, targets);

    expect(description.packageName).toBe("TestPackage");
    expect(description.products.length).toBe(1);
    expect(description.targets.length).toBe(1);
  });

  test("CamelCases product name", () => {
    const config: Config = makeConfig({
      name: "test-package",
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    const description = makePackageDescription(config, targets);

    expect(description.products.length).toBe(1);
    expect(description.products[0].name).toBe("TestPackage");
  });

  test("regular package name and product name should match", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    const description = makePackageDescription(config, targets);

    expect(description.packageName).toBe("TestPackage");
    expect(description.products.length).toBe(1);
    expect(description.products[0].name).toBe("TestPackage");
  });

  test("non-CamelCased package name and product name should match", () => {
    const config: Config = makeConfig({
      name: "test-package",
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    const description = makePackageDescription(config, targets);

    expect(description.packageName).toBe("TestPackage");
    expect(description.products.length).toBe(1);
    expect(description.products[0].name).toBe("TestPackage");
  });
});
