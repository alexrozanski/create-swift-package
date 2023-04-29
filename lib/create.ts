import fs from "fs";
import { F_OK, W_OK } from "node:constants";
import path from "path";
import { type Config } from "./config";
import { packageString } from "./package";
import { type Target } from "./target";

const exists = async (filename: string) => {
  try {
    await fs.promises.access(filename, F_OK);
    return true;
  } catch {
    return false;
  }
};

const canWrite = async (filename: string) => {
  try {
    await fs.promises.access(filename, W_OK);
    return true;
  } catch {
    return false;
  }
};

const writeTarget = async (config: Config, target: Target) => {
  fs.promises.mkdir(path.join(config.projectDir, "Sources", target.name), {
    recursive: true,
  });
};

export const createPackage = async (props: {
  config: Config;
  targets: Target[];
}) => {
  const { config, targets } = props;
  const packageFile = packageString(config, targets);

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
    packageFile
  );

  await Promise.all(targets.map((target) => writeTarget(config, target)));
};
