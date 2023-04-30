import { Command } from "commander";

export type CliOptions = {
  projectDirectory?: string;
  dryRun: boolean;
  swiftBuild: boolean;
  promptXcode: boolean;
};

export const parse = (
  args: NodeJS.Process["argv"],
  packageJson: { name: string; version: string }
): CliOptions => {
  const { name, version } = packageJson;

  let parsedArgs: CliOptions = {
    dryRun: false,
    swiftBuild: true,
    promptXcode: true,
  };
  const command = new Command(name)
    .version(version)
    .argument("[project-directory]")
    .usage(`[project-directory] [options]`)
    .action((dir) => {
      parsedArgs.projectDirectory = dir;
    })
    .option(
      "--dry-run",
      `
  Output what the command will do, but don't actually create a package.
`
    )
    .option(
      "--no-swift-build",
      `
  Don't validate by running \`swift build\` after creating the package.
`
    )
    .option(
      "--no-prompt-xcode",
      `
  Don't prompt to open the new package in Xcode.
`
    )
    .allowUnknownOption()
    .parse(args);

  return {
    ...parsedArgs,
    dryRun: !!command.opts().dryRun,
    swiftBuild: !!command.opts().swiftBuild,
    promptXcode: !!command.opts().promptXcode,
  };
};
