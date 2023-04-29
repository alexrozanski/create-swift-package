import { exec } from "child_process";

export const execAsync = async (command: string): Promise<void> => {
  return new Promise((resolve, reject) =>
    exec(command, (error) => {
      if (error?.code == null) {
        resolve();
      } else {
        reject(error.message);
      }
    })
  );
};
