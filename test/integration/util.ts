import tmp from "tmp";

export const makeTemporaryDirectory = async () => {
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

  return { path, remove };
};
