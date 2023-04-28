import fs from "fs";
import { type Config } from "./config";
import { packageString } from "./package";

export const createPackage = (outputDir: string, config: Config) => {
  const packageFile = packageString(config);

  try {
    fs.writeFileSync(`${outputDir}/Package.swift`, packageFile);
  } catch (err) {
    console.error(err);
  }
};
