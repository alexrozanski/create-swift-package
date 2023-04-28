#!/usr/bin/env node

import { exit } from "process";
import { parse } from "./lib/cli";
import { promptConfig } from "./lib/prompt";
import packageJson from "./package.json";

const cli = parse(process.argv, packageJson);

(async function () {
  try {
    const config = await promptConfig(cli.projectDirectory);
    if (config == null) {
      console.log("Exiting.");
      exit(1);
    }

    console.log(config);
  } catch {
    console.log("Exiting.");
    exit(1);
  }
})();
