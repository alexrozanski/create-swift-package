import tmp from "tmp";
import { type Config } from "../../lib/config";
import { createPackage } from "../../lib/package/create";
import { makeTargets } from "../../lib/package/target";

export const createPackageInTemporaryDirectory = async (config: Config) => {
  const { path, remove } = await new Promise<{
    path: string;
    remove: () => void;
  }>((resolve, reject) => {
    tmp.dir({ unsafeCleanup: true }, (err, path, remove) => {
      if (err) {
        reject(err);
      } else {
        resolve({ path, remove });
      }
    });
  });

  await createPackage({
    config,
    targets: makeTargets(config),
  });

  return { path, remove };
};
