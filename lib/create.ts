import fs from "fs";
import { F_OK, W_OK } from "node:constants";
import { type Config } from "./config";
import { packageString } from "./package";

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

export const createPackage = async (config: Config) => {
  const packageFile = packageString(config);

  const dirExists = await exists(config.projectDir);
  if (!dirExists) {
    await fs.promises.mkdir(config.projectDir, { recursive: true });
  }

  const canWriteDir = await canWrite(config.projectDir);
  if (!canWriteDir) {
    throw new Error(`Can't write to '${config.projectDir}'`);
  }

  await fs.promises.writeFile(
    `${config.projectDir}/Package.swift`,
    packageFile
  );
};
