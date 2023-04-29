import { Config } from "./config";

export type Target = {
  name: string;
  dependencies: Target[];
};

export const makeTargets = (config: Config): Target[] => {
  const targets: Target[] = [];

  let mainTarget: Target;
  switch (config.language) {
    case "cfamily":
    case "swift":
      mainTarget = { name: config.name, dependencies: [] };
      targets.push(mainTarget);
    case "mixed":
      const objCxx = { name: `${config.name}ObjCxx`, dependencies: [] };
      mainTarget = { name: config.name, dependencies: [objCxx] };
      targets.push(mainTarget);
      targets.push(objCxx);
  }

  if (config.includeTests) {
    targets.push({ name: `${config.name}Tests`, dependencies: [mainTarget] });
  }

  return targets;
};
