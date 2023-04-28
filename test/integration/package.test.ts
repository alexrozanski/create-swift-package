import { exec } from "child_process";
import fs from "fs";
import tmp, { DirResult } from "tmp";
import { createPackage } from "../../lib/create";

describe("Package tests", () => {
  let tmpDir: DirResult;

  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });

    createPackage(tmpDir.name, {
      name: "test",
      platforms: [{ platform: "macOS", minimumVersion: "13.0" }],
      targetType: "library",
      targetLanguage: "swift",
      minimumSwiftVersion: "5.7.1",
      includeTests: true,
    });
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  test("successfully creates Package.swift", () => {
    const packageExists = fs.existsSync(`${tmpDir.name}/Package.swift`);
    expect(packageExists).toBeTruthy();
  });

  test("creates valid Package.swift", (done) => {
    exec(
      "/usr/bin/env swift package dump-package",
      { cwd: tmpDir.name },
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
