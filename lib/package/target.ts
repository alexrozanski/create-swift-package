import { Config } from "../config";

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

/* Helpers */

const mainTargetName = (config: Config) => {
  return config.name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (firstChar) => firstChar.toUpperCase())
    .replace(/\s+/g, "");
};

const makeMainTarget = (
  mainName: string,
  language: TargetLanguage,
  dependencies: Target[] = []
): Target => ({
  name: mainName,
  role: "main",
  language,
  dependencies,
  files: [],
});

const makeOtherTarget = (
  name: string,
  language: TargetLanguage,
  dependencies: Target[] = []
): Target => ({
  name,
  role: "other",
  language,
  dependencies,
  files: [],
});

const makeTestTarget = (name: string, mainTarget: Target): Target => ({
  name,
  role: "test",
  language: mainTarget.language,
  dependencies: [mainTarget],
  files: [],
});

/* Public */

export const makeTargets = (config: Config): Target[] => {
  const targets: Target[] = [];

  const mainName = mainTargetName(config);
  let mainTarget: Target;
  switch (config.language.type) {
    case "cfamily":
      mainTarget = makeMainTarget(mainName, "cfamily");
      targets.push(mainTarget);
      break;
    case "swift":
      mainTarget = makeMainTarget(mainName, "swift");
      targets.push(mainTarget);
      break;
    case "mixed":
      const objCxx = makeOtherTarget(`${mainName}ObjCxx`, "cfamily");
      mainTarget = makeMainTarget(mainName, "swift", [objCxx]);
      targets.push(mainTarget);
      targets.push(objCxx);
      break;
  }

  if (config.includeTests) {
    targets.push(makeTestTarget(`${mainName}Tests`, mainTarget));
  }

  return targets;
};
