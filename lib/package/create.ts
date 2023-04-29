import fs from "fs";
import path from "path";
import { packageFile } from ".";
import { type Config } from "../config";
import { writeSwiftFile } from "../swift/file";
import { canWrite, exists } from "../util/fs";
import { makePackageDescription } from "./description";
import { type Target } from "./target";

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
  const description = makePackageDescription(config, targets);
  const file = packageFile(description);

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

  await Promise.all(targets.map((target) => writeTarget(config, target)));
};
