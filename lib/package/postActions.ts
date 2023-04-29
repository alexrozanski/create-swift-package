import { exec } from "child_process";
import fs from "fs";
import ora from "ora";
import path from "path";
import { evaluateTemplate } from "../file/template";
import { execAsync } from "../util/process";

export const initGitRepo = async (directory: string) => {
  const spinner = ora("Initializing git repo...").start();

  // Check git installation.
  try {
    await execAsync("/usr/bin/env which git");
  } catch {
    spinner.fail(
      "Couldn't find git installation - make sure it's in your path."
    );
    return;
  }

  // Run `git init`
  try {
    await execAsync(`/usr/bin/env git init ${directory}`);
  } catch {
    spinner.fail();
    return;
  }

  // Write .gitignore
  try {
    await fs.promises.writeFile(
      path.join(directory, ".gitignore"),
      evaluateTemplate({ template: "gitignore", props: {} })
    );
  } catch {
    spinner.fail();
  }

  // Make initial commit
  try {
    await execAsync(`/usr/bin/env git -C ${directory} add .`);
    await execAsync(
      `/usr/bin/env git -C ${directory} commit -m "Initial commit"`
    );
  } catch {
    spinner.fail();
    return;
  }

  spinner.succeed();
};

export const openInXcode = async (directory: string) => {
  // TODO: Read value from xcselect and use that?
  await exec(`/usr/bin/env open -a Xcode.app ${directory}`);
};
