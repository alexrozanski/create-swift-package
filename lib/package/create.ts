import chalk from "chalk";
import fs from "fs";
import _ from "lodash";
import path from "path";
import prompts from "prompts";
import { packageFile } from ".";
import { type Config } from "../config";
import { evaluateTemplate } from "../file/template";
import { formatDirectoryTree, type Node } from "../format/directory";
import { writeSwiftFile } from "../swift/file";
import { canWrite, exists } from "../util/fs";
import { makePackageDescription } from "./description";
import { initGitRepo, openInXcode } from "./postActions";
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
  options?: { dryRun?: boolean };
}) => {
  const { config, targets, options } = props;
  const description = makePackageDescription(config, targets);
  const file = packageFile(description);

  const dryRun = !!options?.dryRun;

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

  if (dryRun) {
    console.log(
      `\nPackage would be created at ${chalk.bold(config.projectDir)}`
    );
    console.log(chalk.gray("-  Rerun without `--dry-run` to create\n"));
  } else {
    console.log(
      chalk.green(
        `\nPackage successfully created at ${chalk.bold(config.projectDir)}}:\n`
      )
    );
  }

  console.log(
    formatDirectoryTree(
      makeDirectoryStructure(config, packageFiles(config, targets))
    )
  );

  if (!dryRun) {
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
