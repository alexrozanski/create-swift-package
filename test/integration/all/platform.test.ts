import { execa } from "execa";
import { type Config } from "../../../lib/config";
import { createPackage } from "../../../lib/package/create";
import { makeTargets } from "../../../lib/package/target";
import { type Platform, type PlatformVersion } from "../../../lib/swift/types";
import { makeTemporaryDirectory } from "../util";

type PlatformAndVersion<P extends Platform> = {
  platform: P;
  version: PlatformVersion<P>;
};

const tests: PlatformAndVersion<Platform>[] = [
  { platform: "macOS", version: "10.15" },
  { platform: "iOS", version: "16.0" },
  { platform: "watchOS", version: "8.0" },
  { platform: "tvOS", version: "14.0" },
];

const makeConfig = (
  { platform, version }: PlatformAndVersion<Platform>,
  dir: string
): Config => {
  return {
    projectDir: dir,
    name: "test",
    platforms: [{ platform: platform, minimumVersion: version }],
    productType: "library",
    language: { type: "swift" },
    minimumSwiftVersion: "5.7",
    includeTests: true,
    initGitRepo: false,
  };
};

describe("Basic package integration tests for all platforms", () => {
  let tmpDir: string;
  let removeDir: () => void;

  beforeEach(async () => {
    const { path, remove } = await makeTemporaryDirectory();
    tmpDir = path;
    removeDir = remove;
  });

  afterEach(() => removeDir());

  tests.forEach(({ platform, version }) => {
    test(`[${platform}] successfully creates Package.swift`, async () => {
      const config = makeConfig({ platform, version }, tmpDir);
      await createPackage({
        config,
        targets: makeTargets(config),
        options: { interactive: false, quiet: true },
      });
    });

    test(`[${platform}] creates valid Package.swift`, async () => {
      const config = makeConfig({ platform, version }, tmpDir);
      await createPackage({
        config,
        targets: makeTargets(config),
        options: { interactive: false, quiet: true },
      });
      await execa("swift", ["package", "dump-package"], { cwd: tmpDir });
    });

    test(`[${platform}] creates buildable package`, async () => {
      const config = makeConfig({ platform, version }, tmpDir);
      await createPackage({
        config,
        targets: makeTargets(config),
        options: { interactive: false, quiet: true },
      });
      await execa("swift", ["build"], { cwd: tmpDir });
    }, 30000);
  });
});
