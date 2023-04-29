import { Command } from "commander";

export type CliOptions = {
  projectDirectory?: string;
  dryRun: boolean;
};

export const parse = (
  args: NodeJS.Process["argv"],
  packageJson: { name: string; version: string }
): CliOptions => {
  const { name, version } = packageJson;

  let parsedArgs: CliOptions = { dryRun: false };
  const command = new Command(name)
    .version(version)
    .argument("[project-directory]")
    .usage(`[project-directory] [options]`)
    .action((dir) => {
      parsedArgs.projectDirectory = dir;
    })
    .option(
      "--dry-run",
      "Output what the command will do, but don't actually create a package."
    )
    .allowUnknownOption()
    .parse(args);

  return { ...parsedArgs, dryRun: !!command.opts().dryRun };
};
