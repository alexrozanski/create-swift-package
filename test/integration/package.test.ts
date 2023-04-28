import fs from "fs";
import tmp, { DirResult } from "tmp";
import { createPackage } from "../../lib/create";

describe("Package tests", () => {
  let tmpDir: DirResult;

  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  test("successfully creates Package.swift", () => {
    createPackage(tmpDir.name, {
      name: "test",
      platforms: [{ platform: "macOS", minimumVersion: "" }],
      targetType: "library",
      targetLanguage: "swift",
      minimumSwiftVersion: "5.5",
      includeTests: true,
    });

    const packageExists = fs.existsSync(`${tmpDir.name}/Package.swift`);
    expect(packageExists).toBeTruthy();
  });
});
