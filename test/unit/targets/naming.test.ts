import { type Config } from "../../../lib/config";
import { makeTargets } from "../../../lib/target";
import { makeConfig } from "../util";

describe("Valid target name tests", () => {
  test("CamelCases target name", () => {
    const config: Config = makeConfig({
      name: "test-target",
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets[0].name).toBe("TestTarget");
  });

  test("removes invalid characters from name", () => {
    const config: Config = makeConfig({
      name: 'test*!-target$-\\"&',
      productType: "library",
      language: "swift",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets[0].name).toBe("TestTarget");
  });
});
