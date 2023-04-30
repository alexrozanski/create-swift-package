import { execa } from "execa";
import { type Config } from "../../../lib/config";
import { createPackage } from "../../../lib/package/create";
import { makeTargets } from "../../../lib/package/target";
import { type ProductType } from "../../../lib/swift/types";
import { makeTemporaryDirectory } from "../util";

const makeConfig = (productType: ProductType, dir: string): Config => {
  return {
    projectDir: dir,
    name: "test",
    platforms: [{ platform: "iOS", minimumVersion: "13.0" }],
    productType: productType,
    language: { type: "swift" },
    minimumSwiftVersion: "5.7",
    includeTests: true,
    initGitRepo: false,
  };
};

describe("Basic package integration tests for all product types", () => {
  let tmpDir: string;
  let removeDir: () => void;

  beforeEach(async () => {
    const { path, remove } = await makeTemporaryDirectory();
    tmpDir = path;
    removeDir = remove;
  });

  afterEach(() => removeDir());

  const productTypes: ProductType[] = ["library", "executable"];
  productTypes.forEach((productType) => {
    test(`[${productType}] successfully creates Package.swift`, async () => {
      const config = makeConfig(productType, tmpDir);
      await createPackage({
        config,
        targets: makeTargets(config),
        options: { interactive: false, quiet: true },
      });
    });

    test(`[${productType}] creates valid Package.swift`, async () => {
      const config = makeConfig(productType, tmpDir);
      await createPackage({
        config,
        targets: makeTargets(config),
        options: { interactive: false, quiet: true },
      });
      await execa("swift", ["package", "dump-package"], { cwd: tmpDir });
    });

    test(`[${productType}] creates buildable package`, async () => {
      const config = makeConfig(productType, tmpDir);
      await createPackage({
        config,
        targets: makeTargets(config),
        options: { interactive: false, quiet: true },
      });
      await execa("swift", ["build"], { cwd: tmpDir });
    }, 30000);
  });
});
