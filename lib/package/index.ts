import { arg, decl, init, type SwiftFile, type Value } from "../swift/file";
import { PackageDescription } from "./description";

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
    case "plugin":
      return init(".plugin", [arg("name", name), arg("targets", [name])]);
  }
};

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
            description.targets.map((target) =>
              init(".target", [
                arg("name", target.name),
                arg(
                  "dependencies",
                  target.dependencies.map((dep) => dep.name)
                ),
              ])
            )
          ),
        ])
      ),
    ],
  };
};
