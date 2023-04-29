import { exec } from "child_process";
import path from "path";
import tmp from "tmp";
import { type Config } from "../../lib/config";
import { createPackage } from "../../lib/package/create";
import { makeTargets } from "../../lib/package/target";
import { exists } from "../../lib/util/fs";

describe("Package integration tests", () => {
  let tmpDir: string;
  let removeDir: () => void;

  beforeEach(async () => {
    const { path, remove } = await new Promise<{
      path: string;
      remove: () => void;
    }>((resolve, reject) => {
      tmp.dir({ unsafeCleanup: true }, (err, path, remove) => {
        if (err) {
          reject(err);
        } else {
          resolve({ path, remove });
        }
      });
    });

    tmpDir = path;
    removeDir = remove;

    const config: Config = {
      projectDir: tmpDir,
      name: "test",
      platforms: [{ platform: "macOS", minimumVersion: "10.13" }],
      productType: "library",
      language: "swift",
      minimumSwiftVersion: "5.7",
      includeTests: true,
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
      (error, stdout, stderr) => {
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
