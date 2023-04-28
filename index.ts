#!/usr/bin/env node

import { exit } from "process";
import { parse } from "./lib/cli";
import { packageString } from "./lib/package";
import { promptConfig } from "./lib/prompt";
import packageJson from "./package.json";

const cli = parse(process.argv, packageJson);

(async function () {
  const config = await promptConfig(cli.projectDirectory);
  if (config == null) {
    console.log("Exiting.");
    exit(1);
  }

  console.log(config);
  console.log("\n\n");
  console.log(packageString(config));
})();
