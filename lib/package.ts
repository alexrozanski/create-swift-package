import { Config } from "./config";
import {
  arg,
  decl,
  init,
  write,
  type SwiftFile,
  type Value,
} from "./swiftFile";
import { type Target } from "./target";

const platformVersion = (minimumVersion: string) => {
  const components = minimumVersion
    .split(".")
    .filter((component) => Number(component) !== 0);
  return `.v${components.join("_")}`;
};

const product = (config: Config): Value => {
  switch (config.productType) {
    case "library":
      return init(".library", [
        arg("name", config.name),
        arg("targets", [config.name]),
      ]);
    case "executable":
      return init(".executable", [
        arg("name", config.name),
        arg("targets", [config.name]),
      ]);
    case "plugin":
      return init(".plugin", [
        arg("name", config.name),
        arg("targets", [config.name]),
      ]);
  }
};

const packageFile = (config: Config, targets: Target[]): SwiftFile => {
  return {
    headerComment: `swift-tools-version: ${config.minimumSwiftVersion}`,
    importedModules: ["PackageDescription"],
    globalDeclarations: [
      decl(
        "let",
        "package",
        init("Package", [
          arg("name", config.name),
          arg(
            "platforms",
            config.platforms.map((platform) =>
              init(`.${platform.platform}`, [
                arg("_", init(platformVersion(platform.minimumVersion))),
              ])
            )
          ),
          arg("products", [product(config)]),
          arg("dependencies", []),
          arg(
            "targets",
            targets.map((target) =>
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

export const packageString = (config: Config, targets: Target[]) => {
  return write(packageFile(config, targets));
};
