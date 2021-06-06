import { createHash } from 'crypto';
import { createReadStream } from 'fs';

function getMD5(file: string): Promise<string> {
  const fileStream = createReadStream(file);

  const hash = createHash('md5');

  return new Promise((resolve, reject) => {
    fileStream.on('readable', () => {
      const data = fileStream.read();

      if (data) {
        hash.update(data);
      } else {
        resolve(hash.digest('hex'));
      }
    });

    fileStream.once('error', err => {
      reject(err);
    })
  })
}

export {
  getMD5
}