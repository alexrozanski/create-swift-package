import { Command } from "commander";

export type CliOptions = {
  projectDirectory?: string;
  dryRun: boolean;
  noSwiftBuild: boolean;
  noPromptXcode: boolean;
};

export const parse = (
  args: NodeJS.Process["argv"],
  packageJson: { name: string; version: string }
): CliOptions => {
  const { name, version } = packageJson;

  let parsedArgs: CliOptions = {
    dryRun: false,
    noSwiftBuild: false,
    noPromptXcode: false,
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
    // These args are confusing because the 'no' is dropped.
    noSwiftBuild: !!command.opts().swiftBuild,
    noPromptXcode: !!command.opts().promptXcode,
  };
};
