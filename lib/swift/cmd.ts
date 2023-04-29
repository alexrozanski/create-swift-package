import { execa } from "execa";

export const getInstalledSwiftVersion = async () => {
  try {
    const { stdout } = await execa("swift", ["-version"]);
    const match = stdout.match(/Apple Swift version (\d+\.\d+\.\d+)/);
    if (match && match[1]) {
      return match[1];
    } else {
      return null;
    }
  } catch {
    return null;
  }
};
