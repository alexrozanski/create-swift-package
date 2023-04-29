import path from "path";
import { Config, LanguageOptions } from "../config";

export type TargetFile = {
  path: string; // Relative path of the file within the target's folder
  template: string; // Relative path to the template in `templates`
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
    swiftTemplate: string;
    cxxTemplates: { header: string; implementation: string };
  }
) => {
  const { swiftTemplate, cxxTemplates } = templates;
  switch (language) {
    case "cfamily": {
      const { header, implementation } = cxxTemplates;
      const headerPath = cIncludePath(config.language) || "include";
      return [
        { path: path.join(headerPath, `${name}.h`), template: header },
        { path: `${name}.m`, template: implementation },
      ];
    }
    case "swift":
      return [{ path: `${name}.swift`, template: swiftTemplate }];
  }
};

const makeMainTarget = (
  mainName: string,
  language: TargetLanguage,
  dependencies: Target[],
  config: Config
): Target => ({
  name: mainName,
  role: "main",
  language,
  dependencies,
  files: makeFiles(mainName, language, config, {
    swiftTemplate: "",
    cxxTemplates: { header: "", implementation: "" },
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
    swiftTemplate: "",
    cxxTemplates: { header: "", implementation: "" },
  }),
});

const makeTestTarget = (mainTarget: Target, config: Config): Target => ({
  name: `${mainTarget.name}Tests`,
  role: "test",
  language: mainTarget.language,
  dependencies: [mainTarget],
  files: makeFiles(`${mainTarget.name}Tests`, mainTarget.language, config, {
    swiftTemplate: "",
    cxxTemplates: { header: "", implementation: "" },
  }),
});

/* Public */

export const makeTargets = (config: Config): Target[] => {
  const targets: Target[] = [];

  const mainName = mainTargetName(config);
  let mainTarget: Target;
  switch (config.language.type) {
    case "cfamily":
      mainTarget = makeMainTarget(mainName, "cfamily", [], config);
      targets.push(mainTarget);
      break;
    case "swift":
      mainTarget = makeMainTarget(mainName, "swift", [], config);
      targets.push(mainTarget);
      break;
    case "mixed":
      const objCxx = makeSupportingTarget(
        `${mainName}ObjCxx`,
        "cfamily",
        [],
        config
      );
      mainTarget = makeMainTarget(mainName, "swift", [objCxx], config);
      targets.push(mainTarget);
      targets.push(objCxx);
      break;
  }

  if (config.includeTests) {
    targets.push(makeTestTarget(mainTarget, config));
  }

  return targets;
};
