import { exec } from "child_process";
import path from "path";
import { type Config } from "../../lib/config";
import { exists } from "../../lib/util/fs";
import { createPackageInTemporaryDirectory } from "./util";

describe("Package integration tests", () => {
  let tmpDir: string;
  let removeDir: () => void;

  beforeEach(async () => {
    const config: Config = {
      projectDir: tmpDir,
      name: "test",
      platforms: [{ platform: "macOS", minimumVersion: "10.13" }],
      productType: "library",
      language: "swift",
      minimumSwiftVersion: "5.7",
      includeTests: true,
    };
    const { path, remove } = await createPackageInTemporaryDirectory(config);

    tmpDir = path;
    removeDir = remove;
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
