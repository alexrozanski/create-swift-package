import { type Config } from "../../../lib/config";
import { makeTargets } from "../../../lib/package/target";
import { makeConfig } from "../util";

describe("Valid target name tests", () => {
  test("CamelCases target name", () => {
    const config: Config = makeConfig({
      name: "test-package",
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets[0].name).toBe("TestPackage");
  });

  test("removes invalid characters from name", () => {
    const config: Config = makeConfig({
      name: 'test*!-package$-\\"&',
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets[0].name).toBe("TestPackage");
  });
});
