import { type Config } from "../../../lib/config";
import { makeTargets } from "../../../lib/package/target";
import { makeConfig } from "../util";

describe("Mixed language targets unit tests", () => {
  test("creates mixed language library targets", () => {
    const config: Config = makeConfig({
      name: "test-library",
      productType: "library",
      language: { type: "mixed" },
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("swift");
    expect(targets[0].name).toBe("TestLibrary");
    expect(targets[1].language).toBe("cfamily");
    expect(targets[1].name).toBe("TestLibraryObjCxx");
  });

  test("creates mixed language executable targets", () => {
    const config: Config = makeConfig({
      name: "TestExecutable",
      productType: "executable",
      language: { type: "mixed" },
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("swift");
    expect(targets[0].name).toBe("TestExecutable");
    expect(targets[1].language).toBe("cfamily");
    expect(targets[1].name).toBe("TestExecutableObjCxx");
  });
});
