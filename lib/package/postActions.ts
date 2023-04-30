import chalk from "chalk";
import { exec } from "child_process";
import { execa } from "execa";
import fs from "fs";
import ora from "ora";
import path from "path";
import stream from "stream";
import { evaluateTemplate } from "../file/template";
import { clearLines } from "../util/term";

const has = async (command: string) => {
  try {
    await execa("which", [command]);
    return true;
  } catch {
    return false;
  }
};

/* Git */

export const initGitRepo = async (directory: string) => {
  const spinner = ora("Initializing git repo...").start();

  // Check git installation.
  if (!(await has("git"))) {
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

const swiftBuildMessage = "Building Swift package [Ctrl-C] to stop...";

// Only run this after checking we can run `swift build`.
const runSwiftBuild = async (directory: string) => {
  let running = true;

  // We duplex output from the spinner stream with output from `swift build`
  let spinnerOutput = "";
  let swiftOutput = "";

  // Clears all existing spinner and `swift build` lines before rewriting their new contents.
  const clearOutput = () => {
    if (!running) return;

    clearLines(swiftOutput.split("\n").length);
    clearLines(spinnerOutput.split("\n").length);
  };

  const writeOutput = () => {
    if (!running) return;

    process.stdout.write(spinnerOutput);
    process.stdout.write(swiftOutput);
  };

  const spinnerStream = new stream.Writable({
    write(chunk, _, callback) {
      clearOutput();
      spinnerOutput = chunk.toString() + "\n";
      writeOutput();
      callback();
    },
  });

  const spinner = ora({
    text: swiftBuildMessage,
    stream: spinnerStream,
    isEnabled: true,
  }).start();

  try {
    const subprocess = execa("swift", ["build", "--package-path", directory], {
      all: true,
      buffer: false,
    });

    const customWritableStream = new stream.Writable({
      write(chunk, _, callback) {
        clearOutput();
        swiftOutput += chunk.toString();
        writeOutput();
        callback();
      },
    });

    subprocess.all?.pipe(customWritableStream);
    await subprocess;
    spinner.succeed();
    return true;
  } catch (error) {
    spinner.fail();
    return false;
  } finally {
    running = false;
  }
};

export const buildPackage = async (directory: string) => {
  const spinner = ora(swiftBuildMessage).start();

  // Check git installation.
  if (!(await has("swift"))) {
    spinner.warn(
      chalk.yellow(
        "Couldn't find `swift` installation - make sure it's in your path."
      )
    );
    return { success: false, interrupt: false };
  }

  spinner.stop();

  let status = { success: false, interrupt: false };

  process.on("SIGINT", () => {
    status = { ...status, interrupt: true };
  });
  try {
    // Store the result before assigning to status - interrupts mess with this otherwise.
    const result = await runSwiftBuild(directory);
    status = { ...status, success: result };
  } catch {
    return { ...status, success: false };
  }

  return status;
};

/* Xcode */

export const openInXcode = async (directory: string) => {
  // TODO: Read value from xcselect and use that?
  await exec(`/usr/bin/env open -a Xcode.app ${directory}`);
};
