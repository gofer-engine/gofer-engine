import { exec as e } from 'child_process';

export const exec = async (command: string, verbose = false) => {
  return new Promise<string>((resolve, reject) => {
    e(command, (error, stdout) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  })
    .then((stdout) => {
      if (verbose) console.log(stdout);
      return true;
    })
    .catch((error) => {
      if (verbose) console.error(error);
      return false;
    });
};

export default exec;
