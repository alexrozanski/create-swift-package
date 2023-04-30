#!/usr/bin/env node

import chalk from "chalk";
import { exit } from "process";
import { parse } from "./lib/cli";
import { promptConfig } from "./lib/cli/prompt";
import { createPackage } from "./lib/package/create";
import { makeTargets } from "./lib/package/target";
import packageJson from "./package.json";

const cli = parse(process.argv, packageJson);

(async function () {
  const config = await promptConfig(cli.projectDirectory);
  if (config == null) {
    console.log("Exiting.");
    exit(1);
  }

  try {
    const targets = makeTargets(config);
    await createPackage({
      config,
      targets,
      options: {
        dryRun: cli.dryRun,
        interactive: true,
        runSwiftBuild: !cli.noSwiftBuild,
        promptXcode: !cli.noPromptXcode,
      },
    });
  } catch (err) {
    console.error(
      chalk.red(`Couldn't create package: ${(err as Error).message}`)
    );
    exit(1);
  }
})();
