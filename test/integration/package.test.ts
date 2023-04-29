import { exec } from "child_process";
import path from "path";
import { type Config } from "../../lib/config";
import { createPackage } from "../../lib/package/create";
import { makeTargets } from "../../lib/package/target";
import { exists } from "../../lib/util/fs";
import { makeTemporaryDirectory } from "./util";

describe("Package integration tests", () => {
  let tmpDir: string;
  let removeDir: () => void;

  beforeEach(async () => {
    const { path, remove } = await makeTemporaryDirectory();
    tmpDir = path;
    removeDir = remove;

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
    });
  });

  afterEach(() => removeDir());

  test("successfully creates Package.swift", async () => {
    const packageExists = await exists(path.join(tmpDir, "Package.swift"));
    expect(packageExists).toBeTruthy();
  });

  test("creates valid Package.swift", (done) => {
    exec(
      "/usr/bin/env swift package dump-package",
      { cwd: tmpDir },
      (error) => {
        try {
          expect(error).toBe(null);
          done();
        } catch (e) {
          done(e);
        }
      }
    );
  });
});
