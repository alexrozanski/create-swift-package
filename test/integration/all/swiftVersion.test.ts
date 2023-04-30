import { execa } from "execa";
import {
  allLanguageTypes,
  type Config,
  type LanguageType,
} from "../../../lib/config";
import { createPackage } from "../../../lib/package/create";
import { makeTargets } from "../../../lib/package/target";
import { getInstalledSwiftVersion } from "../../../lib/swift/cmd";
import { SwiftVersion } from "../../../lib/swift/types";
import { greaterThanOrEqual } from "../../../lib/util/version";
import { makeTemporaryDirectory } from "../util";

const makeConfig = (
  version: SwiftVersion,
  languageType: LanguageType,
  dir: string
): Config => {
  return {
    projectDir: dir,
    name: "test",
    platforms: [{ platform: "iOS", minimumVersion: "13.0" }],
    productType: "library",
    language: { type: languageType },
    minimumSwiftVersion: version,
    includeTests: true,
    initGitRepo: false,
  };
};

const canRunSwiftBuild = (
  installedSwiftVersion: string | null,
  version: string
) => {
  return (
    installedSwiftVersion && greaterThanOrEqual(installedSwiftVersion, version)
  );
};

describe("Basic package integration tests for all platforms", () => {
  let installedSwiftVersion: string | null;
  let tmpDir: string;
  let removeDir: () => void;

  beforeAll(async () => {
    installedSwiftVersion = await getInstalledSwiftVersion();
  });

  beforeEach(async () => {
    const { path, remove } = await makeTemporaryDirectory();
    tmpDir = path;
    removeDir = remove;
  });

  afterEach(() => removeDir());

  let versions: SwiftVersion[] = [
    "5.5",
    "5.6",
    "5.7",
    "5.7.1",
    "5.7.2",
    "5.7.3",
    "5.8",
  ];

  versions.forEach((version) => {
    allLanguageTypes.forEach((languageType) => {
      test(`[${version}][${languageType}] successfully creates Package.swift`, async () => {
        const config = makeConfig(version, languageType, tmpDir);
        await createPackage({
          config,
          targets: makeTargets(config),
          options: { interactive: false, quiet: true },
        });
      });

      test(`[${version}][${languageType}] creates valid Package.swift`, async () => {
        if (canRunSwiftBuild(installedSwiftVersion, version)) {
          const config = makeConfig(version, languageType, tmpDir);
          await createPackage({
            config,
            targets: makeTargets(config),
            options: { interactive: false, quiet: true },
          });
          await execa("swift", ["package", "dump-package"], { cwd: tmpDir });
        } else {
          console.warn(
            "Skipped test because it needs a newer version of `swift`"
          );
        }
      });

      test(`[${version}][${languageType}] creates buildable package`, async () => {
        if (canRunSwiftBuild(installedSwiftVersion, version)) {
          const config = makeConfig(version, languageType, tmpDir);
          await createPackage({
            config,
            targets: makeTargets(config),
            options: { interactive: false, quiet: true },
          });
          await execa("swift", ["build"], { cwd: tmpDir });
        } else {
          console.warn(
            "Skipped test because it needs a newer version of `swift`"
          );
        }
      }, 30000);
    });
  });
});
