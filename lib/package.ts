import { Config } from "./config";
import {
  arg,
  decl,
  init,
  write,
  type SwiftFile,
  type Value,
} from "./swiftFile";

const platformVersion = (minimumVersion: string) => {
  const components = minimumVersion
    .split(".")
    .filter((component) => Number(component) !== 0);
  return `.v${components.join("_")}`;
};

const product = (config: Config): Value => {
  switch (config.targetType) {
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

const packageFile = (config: Config): SwiftFile => {
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
          arg("targets", [
            init(".target", [
              arg("name", config.name),
              arg("dependencies", []),
            ]),
          ]),
        ])
      ),
    ],
  };
};

export const packageString = (config: Config) => {
  return write(packageFile(config));
};
