import chalk from "chalk";
import fs from "fs";
import _ from "lodash";
import ora from "ora";
import path from "path";
import prompts from "prompts";
import { packageFile } from ".";
import { type Config } from "../config";
import { evaluateTemplate } from "../file/template";
import { formatDirectoryTree, type Node } from "../format/directory";
import { writeSwiftFile } from "../swift/file";
import { canWrite, exists } from "../util/fs";
import { makePackageDescription } from "./description";
import { buildPackage, initGitRepo, openInXcode } from "./postActions";
import { type Target } from "./target";

const writeTarget = async (
  config: Config,
  target: Target,
  options?: { dryRun?: boolean }
) => {
  const targetBase = path.join(config.projectDir, "Sources", target.name);
  const dryRun = !!options?.dryRun;

  if (!dryRun) {
    fs.promises.mkdir(targetBase, {
      recursive: true,
    });
  }

  await Promise.all(
    target.files.map(async (file) => {
      const contents = evaluateTemplate(file.template);
      const filePath = path.join(targetBase, file.path);
      const { dir } = path.parse(filePath);

      await fs.promises.mkdir(dir, { recursive: true });
      return await fs.promises.writeFile(filePath, contents);
    })
  );
};

const relativePath = (pathInTarget: string, target: Target) => {
  return path.join("Sources", target.name, pathInTarget);
};

const packageFiles = (config: Config, targets: Target[]) => {
  return {
    filePaths: [
      ...targets.flatMap((target) =>
        target.files.map((file) => relativePath(file.path, target))
      ),
      "Package.swift",
      ".gitignore",
    ],
    targetPaths: targets.map((target) => relativePath("/", target)),
  };
};

const equalComponents = (a: string[], b: string[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

// Offset is how much of the components array we have processed.
// Keep track of this separately so we can get the current processed path.
const makeNode = (
  components: string[],
  targetPaths: string[],
  offset: number
): Record<string, Node> => {
  const component = components[offset];
  if (offset === components.length - 1) {
    return {
      [component]: {
        type: "file",
        name: component,
      },
    };
  } else {
    const currentComponents = components.slice(0, offset + 1);
    const isTargetDirectory = targetPaths.some((targetPath) =>
      equalComponents(
        targetPath.split("/").filter((c) => c.length > 0),
        currentComponents
      )
    );

    return {
      [component]: {
        type: "directory",
        name: component,
        marker: isTargetDirectory ? "package" : undefined,
        contents: makeNode(components, targetPaths, offset + 1),
      },
    };
  }
};

const makeDirectoryStructure = (
  config: Config,
  paths: { filePaths: string[]; targetPaths: string[] }
): Node => {
  const { filePaths, targetPaths } = paths;

  return {
    type: "directory",
    name: path.basename(config.projectDir),
    marker: "root",
    contents: filePaths.reduce((acc, filePath) => {
      const components = filePath.split("/");
      return _.merge(makeNode(components, targetPaths, 0), acc);
    }, {}),
  };
};

export const createPackage = async (props: {
  config: Config;
  targets: Target[];
  options?: {
    dryRun?: boolean;
    interactive?: boolean;
    quiet?: boolean;
    runSwiftBuild?: boolean;
    promptXcode?: boolean;
  };
}) => {
  const { config, targets, options } = props;
  const description = makePackageDescription(config, targets);
  const file = packageFile(description);

  const {
    dryRun = false,
    interactive = true,
    quiet = false,
    runSwiftBuild = true,
    promptXcode = true,
  } = options || {};

  if (!dryRun) {
    const dirExists = await exists(config.projectDir);
    if (!dirExists) {
      await fs.promises.mkdir(config.projectDir, { recursive: true });
    }

    const canWriteDir = await canWrite(config.projectDir);
    if (!canWriteDir) {
      throw new Error(`Can't write to '${config.projectDir}'`);
    }

    await fs.promises.writeFile(
      path.join(config.projectDir, "Package.swift"),
      writeSwiftFile(file)
    );
  }

  await Promise.all(
    targets.map((target) => writeTarget(config, target, options))
  );

  if (!dryRun) {
    if (config.initGitRepo) {
      await initGitRepo(config.projectDir);
    }
  }

  if (!dryRun && interactive && runSwiftBuild) {
    const { success, interrupt } = await buildPackage(config.projectDir);
    if (!success && !interrupt) {
      ora(chalk.bold("Failed to build package.")).fail();
      console.log("Exiting");
      return;
    }
  }

  if (!quiet) {
    if (dryRun) {
      ora(
        chalk.bold(
          `Package would be created at ${chalk.bold(config.projectDir)}`
        )
      ).info();
      console.log(chalk.gray("  - Rerun without `--dry-run` to create"));
    } else {
      ora(
        chalk.bold(`Package created at ${chalk.bold(config.projectDir)}`)
      ).succeed();
    }

    console.log();
    console.log(
      formatDirectoryTree(
        makeDirectoryStructure(config, packageFiles(config, targets))
      )
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")
    );

    ora(
      chalk.bold(
        `View the Package.swift docs at ${chalk.underline(
          "https://docs.swift.org/package-manager/PackageDescription/PackageDescription.html"
        )}`
      )
    ).info();
  }

  if (!dryRun && interactive && promptXcode) {
    const response = await prompts({
      type: "toggle",
      name: "open",
      message: "Open in Xcode?",
      active: "Yes",
      inactive: "No",
      initial: true,
    });

    if (!!response.open) {
      await openInXcode(config.projectDir);
    }
  }
};
