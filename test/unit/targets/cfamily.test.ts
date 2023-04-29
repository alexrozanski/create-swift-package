import { type Config } from "../../../lib/config";
import { makeTargets } from "../../../lib/package/target";
import { makeConfig } from "../util";

describe("C-family target unit tests", () => {
  test("creates simple library target", () => {
    const config: Config = makeConfig({
      name: "test-target",
      productType: "library",
      language: "cfamily",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(1);
    expect(targets[0].language).toBe("cfamily");
  });

  test("creates simple library target with tests", () => {
    const config: Config = makeConfig({
      name: "test-target",
      productType: "library",
      language: "cfamily",
      includeTests: true,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("cfamily");
    expect(targets[0].role).toBe("main");
    expect(targets[1].language).toBe("cfamily");
    expect(targets[1].role).toBe("test");
  });

  test("creates simple executable target", () => {
    const config: Config = makeConfig({
      name: "test-target",
      productType: "executable",
      language: "cfamily",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(1);
    expect(targets[0].language).toBe("cfamily");
  });

  test("creates simple executable target with tests", () => {
    const config: Config = makeConfig({
      name: "test-target",
      productType: "executable",
      language: "cfamily",
      includeTests: true,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("cfamily");
    expect(targets[0].role).toBe("main");
    expect(targets[1].language).toBe("cfamily");
    expect(targets[1].role).toBe("test");
  });

  test("creates simple plugin target", () => {
    const config: Config = makeConfig({
      name: "test-target",
      productType: "plugin",
      language: "cfamily",
      includeTests: false,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(1);
    expect(targets[0].language).toBe("cfamily");
  });

  test("creates simple plugin target with tests", () => {
    const config: Config = makeConfig({
      name: "test-target",
      productType: "executable",
      language: "cfamily",
      includeTests: true,
    });
    const targets = makeTargets(config);
    expect(targets.length).toBe(2);
    expect(targets[0].language).toBe("cfamily");
    expect(targets[0].role).toBe("main");
    expect(targets[1].language).toBe("cfamily");
    expect(targets[1].role).toBe("test");
  });
});
