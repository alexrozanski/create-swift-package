import { type Config, type PlatformWithVersion } from "../config";
import {
  type Platform,
  type ProductType,
  type SwiftVersion,
} from "../swift/types";
import { type Target } from "./target";

export type PackageDescription = {
  toolsVersion: SwiftVersion;
  packageName: string;
  platforms: PlatformWithVersion<Platform>[];
  products: [{ name: string; type: ProductType }];
  targets: Target[];
};

export const makePackageDescription = (
  config: Config,
  targets: Target[]
): PackageDescription => {
  const mainTarget = targets.filter((target) => target.role === "main")[0];
  if (mainTarget == null) {
    throw new Error("Missing main target");
  }

  return {
    toolsVersion: config.minimumSwiftVersion,
    packageName: mainTarget.name,
    platforms: config.platforms,
    products: [{ name: mainTarget.name, type: config.productType }],
    targets,
  };
};
