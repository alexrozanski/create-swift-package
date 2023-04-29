import { type Config } from "../../../lib/config";
import { makeTargets } from "../../../lib/target";
import { makeConfig } from "../util";

describe("Mixed language targets unit tests", () => {
  test("creates mixed language library targets", () => {
    const config: Config = makeConfig({
      name: "test-library",
      productType: "library",
      language: "mixed",
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
      name: "test-executable",
      productType: "executable",
      language: "mixed",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("swift");
    expect(targets[0].name).toBe("TestExecutable");
    expect(targets[1].language).toBe("cfamily");
    expect(targets[1].name).toBe("TestExecutableObjCxx");
  });

  test("creates mixed language plugin targets", () => {
    const config: Config = makeConfig({
      name: "test-plugin",
      productType: "plugin",
      language: "mixed",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("swift");
    expect(targets[0].name).toBe("TestPlugin");
    expect(targets[1].language).toBe("cfamily");
    expect(targets[1].name).toBe("TestPluginObjCxx");
  });
});
