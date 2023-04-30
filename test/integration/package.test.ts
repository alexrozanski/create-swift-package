import { execa } from "execa";
import path from "path";
import { type Config } from "../../lib/config";
import { createPackage } from "../../lib/package/create";
import { makeTargets } from "../../lib/package/target";
import { exists } from "../../lib/util/fs";
import { makeTemporaryDirectory } from "./util";

describe("Basic package integration tests", () => {
  let tmpDir: string;
  let removeDir: () => void;

  beforeEach(async () => {
    const { path, remove } = await makeTemporaryDirectory();
    tmpDir = path;
    removeDir = remove;

    // A simple test config
    const config: Config = {
      projectDir: tmpDir,
      name: "test",
      platforms: [{ platform: "macOS", minimumVersion: "10.13" }],
      productType: "library",
      language: { type: "swift" },
      minimumSwiftVersion: "5.7",
      includeTests: true,
      initGitRepo: false,
    };
    await createPackage({
      config,
      targets: makeTargets(config),
      options: { interactive: false, quiet: true },
    });
  });

  afterEach(() => removeDir());

  test("successfully creates Package.swift", async () => {
    const packageExists = await exists(path.join(tmpDir, "Package.swift"));
    expect(packageExists).toBeTruthy();
  });

  test("creates valid Package.swift", async () => {
    await execa("swift", ["package", "dump-package"], { cwd: tmpDir });
  });

  test("creates buildable package", async () => {
    await execa("swift", ["build"], { cwd: tmpDir });
  }, 30000);
});
