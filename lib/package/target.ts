import path from "path";
import { Config, LanguageOptions } from "../config";
import { type Template } from "../file/template";
import { ProductType } from "../swift/types";

export type TargetFile = {
  path: string; // Relative path of the file within the target's folder
  template: Template;
};
type TargetRole = "main" | "supporting" | "test";
export type TargetLanguage = "swift" | "cfamily";

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

const cIncludePath = (languageOptions: LanguageOptions) => {
  switch (languageOptions.type) {
    case "cfamily":
      return languageOptions.includePath;
    case "mixed":
      return languageOptions.cIncludePath;
    case "swift":
      return null;
  }
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
  switch (language) {
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
              path: path.join(headerPath, `${name}.m`),
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
  files: makeFiles(mainName, language, config, {
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
  }),
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
  // We process this here as we're passing it straight to the template engine.
  const productTypeString =
    productType.charAt(0).toUpperCase() + productType.slice(1);
  return {
    name: `${mainTarget.name}Tests`,
    role: "test",
    language: mainTarget.language,
    dependencies: [mainTarget],
    files: makeFiles(`${mainTarget.name}Tests`, mainTarget.language, config, {
      swiftTemplate: {
        template: "test/testCase/swift",
        props: {
          targetName: mainTarget.name,
          productType: productTypeString,
        },
      },
      cxxTemplates: {
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
  switch (language.type) {
    case "cfamily":
      mainTarget = makeMainTarget(mainName, productType, "cfamily", [], config);
      targets.push(mainTarget);
      break;
    case "swift":
      mainTarget = makeMainTarget(mainName, productType, "swift", [], config);
      targets.push(mainTarget);
      break;
    case "mixed":
      const objCxx = makeSupportingTarget(
        `${mainName}ObjCxx`,
        "cfamily",
        [],
        config
      );
      mainTarget = makeMainTarget(
        mainName,
        productType,
        "swift",
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
