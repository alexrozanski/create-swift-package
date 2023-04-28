import { Command } from "commander";

export type Arguments = {
  projectDirectory?: string;
};

export const parse = (
  args: NodeJS.Process["argv"],
  packageJson: { name: string; version: string }
) => {
  const { name, version } = packageJson;

  let parsedArgs: Arguments = {};
  const values = new Command(name)
    .version(version)
    .argument("[project-directory]")
    .usage(`[project-directory]`)
    .action((dir) => {
      parsedArgs.projectDirectory = dir;
    })
    .allowUnknownOption()
    .parse(args);

  return parsedArgs;
};
