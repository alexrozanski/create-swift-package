import { Config } from "./config";

export type Target = {
  name: string;
  dependencies: Target[];
};

export const makeTargets = (config: Config): Target[] => {
  switch (config.language) {
    case "cfamily":
    case "swift":
      return [{ name: config.name, dependencies: [] }];
    case "mixed":
      const objCxx = { name: `${config.name}ObjCxx`, dependencies: [] };
      return [{ name: config.name, dependencies: [objCxx] }, objCxx];
  }
};
