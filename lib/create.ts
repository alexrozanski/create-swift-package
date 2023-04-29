import fs from "fs";
import { type Config } from "./config";
import { packageString } from "./package";

export const createPackage = (config: Config) => {
  const packageFile = packageString(config);

  if (!fs.existsSync(config.projectDir)) {
    fs.mkdirSync(config.projectDir);
  }

  try {
    fs.writeFileSync(`${config.projectDir}/Package.swift`, packageFile);
  } catch (err) {
    console.error(err);
  }
};
