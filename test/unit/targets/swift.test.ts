import { type Config } from "../../../lib/config";
import { makeTargets } from "../../../lib/package/target";
import { makeConfig } from "../util";

describe("Swift target unit tests", () => {
  test("creates simple library target", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "library",
      language: { type: "swift" },
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(1);
    expect(targets[0].language).toBe("swift");
  });

  test("creates simple library target with tests", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "library",
      language: { type: "swift" },
      includeTests: true,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("swift");
    expect(targets[0].role).toBe("main");
    expect(targets[1].language).toBe("swift");
    expect(targets[1].role).toBe("test");
  });

  test("creates simple executable target", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "executable",
      language: { type: "swift" },
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(1);
    expect(targets[0].language).toBe("swift");
  });

  test("creates simple executable target with tests", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "executable",
      language: { type: "swift" },
      includeTests: true,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("swift");
    expect(targets[0].role).toBe("main");
    expect(targets[1].language).toBe("swift");
    expect(targets[1].role).toBe("test");
  });

  test("creates simple plugin target", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "plugin",
      language: { type: "swift" },
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(1);
    expect(targets[0].language).toBe("swift");
  });

  test("creates simple plugin target with tests", () => {
    const config: Config = makeConfig({
      name: "TestPackage",
      productType: "executable",
      language: { type: "swift" },
      includeTests: true,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("swift");
    expect(targets[0].role).toBe("main");
    expect(targets[1].language).toBe("swift");
    expect(targets[1].role).toBe("test");
  });
});
