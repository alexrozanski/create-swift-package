#!/usr/bin/env node

import chalk from "chalk";
import { exit } from "process";
import { parse } from "./lib/cli";
import { createPackage } from "./lib/create";
import { promptConfig } from "./lib/prompt";
import packageJson from "./package.json";

const cli = parse(process.argv, packageJson);

(async function () {
  const config = await promptConfig(cli.projectDirectory);
  if (config == null) {
    console.log("Exiting.");
    exit(1);
  }

  try {
    await createPackage(config);
  } catch (err) {
    console.error(
      chalk.red(`Couldn't create package: ${(err as Error).message}`)
    );
    exit(1);
  }
})();
