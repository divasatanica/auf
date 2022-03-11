import { createHash } from 'crypto';
import * as fs from 'fs';

function getMD5(file: string, fileSystem = fs): Promise<string> {
  const fileStream = fileSystem.createReadStream(file);

  const hash = createHash('md5');

  return new Promise((resolve, reject) => {
    fileStream.on('readable', () => {
      let data: string;

      while (data = fileStream.read()) {
        hash.update(data);
      }

      resolve(hash.digest('hex'));
    });

    fileStream.once('error', err => {
      reject(err);
    })
  })
}

export {
  getMD5
}