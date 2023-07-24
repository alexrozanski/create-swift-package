import {
  arg,
  decl,
  init,
  type Argument,
  type SwiftFile,
  type Value,
} from "../swift/file";
import { type PackageDescription } from "./description";
import { type Target } from "./target";

// This works for now -- might need some additional logic later
const platformVersion = (minimumVersion: string) => {
  const components = minimumVersion
    .split(".")
    // e.g. 13.0 always maps to v13
    .filter((component) => Number(component) !== 0);
  return `.v${components.join("_")}`;
};

const productValue = (
  product: PackageDescription["products"][number]
): Value => {
  const { name, type } = product;
  switch (type) {
    case "library":
      return init(".library", [arg("name", name), arg("targets", [name])]);
    case "executable":
      return init(".executable", [arg("name", name), arg("targets", [name])]);
  }
};

const targetValue = (target: Target): Value => {
  let publicHeadersArg: Argument | null;
  switch (target.language.type) {
    case "cfamily":
      publicHeadersArg = arg(
        "publicHeadersPath",
        target.language.publicHeadersPath
      );
      break;
    case "swift":
      publicHeadersArg = null;
      break;
  }

  return init(target.role === "test" ? ".testTarget" : ".target", [
    arg("name", target.name),
    arg(
      "dependencies",
      target.dependencies.map((dep) => dep.name)
    ),
    ...(publicHeadersArg ? [publicHeadersArg] : []),
  ]);
};

/**
 * General purpose AST for Package.swift. This should be easy to modify for different versions
 * of Swift or if this format changes.
 */
export const packageFile = (description: PackageDescription): SwiftFile => {
  return {
    headerComment: `swift-tools-version: ${description.toolsVersion}`,
    importedModules: ["PackageDescription"],
    globalDeclarations: [
      decl(
        "let",
        "package",
        init("Package", [
          arg("name", description.packageName),
          arg(
            "platforms",
            description.platforms.map((platform) =>
              init(`.${platform.platform}`, [
                arg("_", init(platformVersion(platform.minimumVersion))),
              ])
            )
          ),
          arg(
            "products",
            description.products.map((product) => productValue(product))
          ),
          arg("dependencies", []),
          arg(
            "targets",
            description.targets.map((target) => targetValue(target))
          ),
        ])
      ),
    ],
  };
};
