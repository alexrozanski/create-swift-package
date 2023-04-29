import chalk from "chalk";
import { exec } from "child_process";
import { execa } from "execa";
import fs from "fs";
import ora from "ora";
import path from "path";
import { evaluateTemplate } from "../file/template";

/* Git */

export const initGitRepo = async (directory: string) => {
  const spinner = ora("Initializing git repo...").start();

  // Check git installation.
  try {
    await execa("which", ["git"]);
  } catch (err) {
    spinner.fail(
      "Couldn't find git installation - make sure it's in your path."
    );
    return;
  }

  try {
    // Run `git init`
    await execa("git", ["init", directory]);

    // Write .gitignore
    await fs.promises.writeFile(
      path.join(directory, ".gitignore"),
      evaluateTemplate({ template: "gitignore", props: {} })
    );

    // Make initial commit
    await execa("git", ["-C", directory, "add", "."]);
    await execa("git", ["-C", directory, "commit", "-m", '"Initial commit"']);
  } catch {
    spinner.fail();
    return;
  }

  spinner.succeed(chalk.bold("Initialized git repo"));
};

/* Swift build */

/* Xcode */

export const openInXcode = async (directory: string) => {
  // TODO: Read value from xcselect and use that?
  await exec(`/usr/bin/env open -a Xcode.app ${directory}`);
};
