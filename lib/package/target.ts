import path from "path";
import { Config, cIncludePath } from "../config";
import { type Template } from "../file/template";
import { ProductType } from "../swift/types";

export type TargetFile = {
  path: string; // Relative path of the file within the target's folder
  template: Template;
};
type TargetRole = "main" | "supporting" | "test";
export type TargetLanguage =
  | { type: "swift" }
  | { type: "cfamily"; publicHeadersPath: string };

export type Target = {
  name: string;
  role: TargetRole;
  language: TargetLanguage;
  dependencies: Target[];
  files: TargetFile[];
};

/* Helpers */

const mainTargetName = (config: Config) => {
  return config.name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (firstChar) => firstChar.toUpperCase())
    .replace(/\s+/g, "");
};

const makeFiles = (
  name: string,
  language: TargetLanguage,
  config: Config,
  templates: {
    swiftTemplate: Template;
    cxxTemplates: { header?: Template; implementation?: Template };
  }
) => {
  const { swiftTemplate, cxxTemplates } = templates;
  switch (language.type) {
    case "cfamily": {
      const { header, implementation } = cxxTemplates;
      const headerPath = cIncludePath(config.language) || "include";
      const headerFile =
        header != null
          ? { path: path.join(headerPath, `${name}.h`), template: header }
          : null;
      const implementationFile =
        implementation != null
          ? {
              path: `${name}.m`,
              template: implementation,
            }
          : null;

      var files: TargetFile[] = [];
      if (headerFile != null) {
        files.push(headerFile);
      }
      if (implementationFile != null) {
        files.push(implementationFile);
      }
      return files;
    }
    case "swift":
      return [{ path: `${name}.swift`, template: swiftTemplate }];
  }
};

const makeMainTarget = (
  mainName: string,
  productType: ProductType,
  language: TargetLanguage,
  dependencies: Target[],
  config: Config
): Target => ({
  name: mainName,
  role: "main",
  language,
  dependencies,
  files: makeFiles(
    productType === "executable" ? "main" : mainName,
    language,
    config,
    {
      swiftTemplate: {
        template: `${productType}/main/swift`,
        props: { targetName: mainName },
      },
      cxxTemplates: {
        header:
          productType === "library"
            ? {
                template: `library/main/objCHeader`,
                props: { targetName: mainName },
              }
            : undefined,
        implementation: {
          template: `${productType}/main/objCImplementation`,
          props: { targetName: mainName },
        },
      },
    }
  ),
});

const makeSupportingTarget = (
  name: string,
  language: TargetLanguage,
  dependencies: Target[],
  config: Config
): Target => ({
  name,
  role: "supporting",
  language,
  dependencies,
  files: makeFiles(name, language, config, {
    swiftTemplate: {
      template: "supporting/main/swift",
      props: { targetName: name },
    },
    cxxTemplates: {
      header: {
        template: "supporting/main/objCHeader",
        props: { targetName: name },
      },
      implementation: {
        template: "supporting/main/objCImplementation",
        props: { targetName: name },
      },
    },
  }),
});

const makeTestTarget = (
  mainTarget: Target,
  productType: ProductType,
  config: Config
): Target => {
  const testTargetName = `${mainTarget.name}Tests`;
  // We process this here as we're passing it straight to the template engine.
  const productTypeString =
    productType.charAt(0).toUpperCase() + productType.slice(1);
  return {
    name: testTargetName,
    role: "test",
    language: mainTarget.language,
    dependencies: [mainTarget],
    files: makeFiles(testTargetName, mainTarget.language, config, {
      swiftTemplate: {
        template: "test/testCase/swift",
        props: {
          targetName: mainTarget.name,
          productType: productTypeString,
        },
      },
      cxxTemplates: {
        // An include directory is needed for Obj-C targets so put a placeholder umbrella header here.
        header: {
          template: "cxx/umbrella",
          props: { targetName: testTargetName },
        },
        implementation: {
          template: "test/testCase/objC",
          props: {
            targetName: mainTarget.name,
            productType: productTypeString,
          },
        },
      },
    }),
  };
};

/* Public */

export const makeTargets = (config: Config): Target[] => {
  const targets: Target[] = [];
  const { productType, language } = config;

  const mainName = mainTargetName(config);
  let mainTarget: Target;

  const publicHeadersPath = cIncludePath(language) || "include";

  switch (language.type) {
    case "cfamily":
      mainTarget = makeMainTarget(
        mainName,
        productType,
        { type: "cfamily", publicHeadersPath },
        [],
        config
      );
      targets.push(mainTarget);
      break;
    case "swift":
      mainTarget = makeMainTarget(
        mainName,
        productType,
        { type: "swift" },
        [],
        config
      );
      targets.push(mainTarget);
      break;
    case "mixed":
      const objCxx = makeSupportingTarget(
        `${mainName}ObjCxx`,
        { type: "cfamily", publicHeadersPath },
        [],
        config
      );
      mainTarget = makeMainTarget(
        mainName,
        productType,
        { type: "swift" },
        [objCxx],
        config
      );
      targets.push(mainTarget);
      targets.push(objCxx);
      break;
  }

  if (config.includeTests) {
    targets.push(makeTestTarget(mainTarget, productType, config));
  }

  return targets;
};
