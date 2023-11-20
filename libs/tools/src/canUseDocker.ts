import { exec } from 'child_process';

export const canUseDocker = async () => {
  return new Promise<boolean>((resolve) => {
    exec('docker version -f json', (err) => {
      if (err) {
        return resolve(false);
      }
      return resolve(true);
    })
  })
}