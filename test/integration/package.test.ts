import { exec } from "child_process";
import fs from "fs";
import path from "path";
import tmp, { DirResult } from "tmp";
import { createPackage } from "../../lib/create";

describe("Package integration tests", () => {
  let tmpDir: DirResult;

  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });

    createPackage({
      config: {
        projectDir: tmpDir.name,
        name: "test",
        platforms: [{ platform: "macOS", minimumVersion: "10.13" }],
        productType: "library",
        language: "swift",
        minimumSwiftVersion: "5.7.1",
        includeTests: true,
      },
      targets: [],
    });
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  test("successfully creates Package.swift", () => {
    const packageExists = fs.existsSync(
      path.join(tmpDir.name, "Package.swift")
    );
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
