import fs from "fs";
import { F_OK, W_OK } from "node:constants";
import path from "path";

export const sanitizedDirectory = (filePath: string) => {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);

  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/_+/g, "-");

  return path.join(dirName, sanitizedFileName);
};

export const exists = async (filename: string) => {
  try {
    await fs.promises.access(filename, F_OK);
    return true;
  } catch {
    return false;
  }
};

export const canWrite = async (filename: string) => {
  try {
    await fs.promises.access(filename, W_OK);
    return true;
  } catch {
    return false;
  }
};
