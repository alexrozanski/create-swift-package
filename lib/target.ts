import { Config } from "./config";

type TargetFile = {
  path: string; // Relative path of the file within the target's folder
  template: string; // Relative path to the template in `templates`
};
type TargetRole = "main" | "other" | "test";
export type TargetLanguage = "swift" | "cfamily";

export type Target = {
  name: string;
  role: TargetRole;
  language: TargetLanguage;
  dependencies: Target[];
  files: TargetFile[];
};

const mainTargetName = (config: Config) => {
  return config.name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (firstChar) => firstChar.toUpperCase())
    .replace(/\s+/g, "");
};

export const makeTargets = (config: Config): Target[] => {
  const targets: Target[] = [];

  const mainName = mainTargetName(config);
  let mainTarget: Target;

  switch (config.language) {
    case "cfamily":
      mainTarget = {
        name: mainName,
        role: "main",
        language: "cfamily",
        dependencies: [],
        files: [],
      };
      targets.push(mainTarget);
      break;
    case "swift":
      mainTarget = {
        name: mainName,
        role: "main",
        language: "swift",
        dependencies: [],
        files: [],
      };
      targets.push(mainTarget);
      break;
    case "mixed":
      const objCxx: Target = {
        name: `${mainName}ObjCxx`,
        role: "other",
        language: "cfamily",
        dependencies: [],
        files: [],
      };
      mainTarget = {
        name: mainName,
        role: "main",
        language: "swift",
        dependencies: [objCxx],
        files: [],
      };
      targets.push(mainTarget);
      targets.push(objCxx);
      break;
  }

  if (config.includeTests) {
    targets.push({
      name: `${mainName}Tests`,
      role: "test",
      language: mainTarget.language,
      dependencies: [mainTarget],
      files: [],
    });
  }

  return targets;
};
