import { IncomingMessage } from 'http';
import { IContext } from '@vergiss/auf-core';


const kWWWUrlEncoded = 'application/x-www-urlencoded'
const kMultipartFormdata = 'multipart/form-data'

function getBoundary(request: IncomingMessage) {
  let contentType = request.headers['content-type']
  if (!contentType) {
    return ''
  }
  const contentTypeArray = contentType.split(';').map(item => item.trim())
  const boundaryPrefix = 'boundary='
  let boundary = contentTypeArray.find(item => item.startsWith(boundaryPrefix))
  if (!boundary) return null
  boundary = boundary.slice(boundaryPrefix.length)
  if (boundary) boundary = boundary.trim()
  return boundary
}

function getMatching(string: string, regex: RegExp) {
  // Helper function when using non-matching groups
  const matches = string.match(regex)
  if (!matches || matches.length < 2) {
    return null
  }
  return matches[1]
}

export function BodyParser () {
  return async function BodyParserMiddleware (ctx: IContext, next: Function) {
    const { req } = ctx;
    let ContentType = req.headers['content-type'];
    if (ContentType?.startsWith(kMultipartFormdata)) {
      ContentType = kMultipartFormdata;
    }
    if (ContentType === kMultipartFormdata) {
      // Use latin1 encoding to parse binary files correctly
      req.setEncoding('latin1')
    } else {
      req.setEncoding('utf8')
    }

    let rawData = '';
    ctx.req.on('data', chunk => {
      rawData += chunk;
    });

    const readReq = new Promise<Record<any, any>>((resolve, reject) => {
      ctx.req.on('end', () => {
        switch (ContentType) {
          case kMultipartFormdata: {
            const boundary = getBoundary(req);
            let result = {
              files: [] as any[]
            }
            if (!boundary) {
              throw new Error('Unmatching Content Type and Data')
            }
            const rawDataArray = rawData.split(boundary)
            for (let item of rawDataArray) {
              // Use non-matching groups to exclude part of the result
              let name = getMatching(item, /(?:name=")(.+?)(?:")/)
              if (!name || !(name = name.trim())) continue
              let value = getMatching(item, /(?:\r\n\r\n)([\S\s]*)(?:\r\n--$)/)
              if (!value) continue
              let filename = getMatching(item, /(?:filename=")(.*?)(?:")/)
              if (filename && (filename = filename.trim())) {
                // Add the file information in a files array
                let file = {}
                file[name] = value
                file['filename'] = filename
                let contentType = getMatching(item, /(?:Content-Type:)(.*?)(?:\r\n)/)
                if (contentType && (contentType = contentType.trim())) {
                  file['Content-Type'] = contentType
                }
                if (!result.files) {
                  result.files = []
                }
                result.files.push(file)
              } else {
                // Key/Value pair
                result[name] = value
              }
            }
            resolve(result)
            break;
          }
          case kWWWUrlEncoded:
          default: {
            const body = rawData.split('&').reduce((acc, curr) => {
              if (!curr) {
                return acc;
              }
              const [key, value] = curr.split('=');
              return {
                ...acc,
                [decodeURIComponent(key)]: decodeURIComponent(value)
              }
            }, Object.create(null));
            resolve(body);
            break;
          }
        }
      });

      ctx.req.on('error', err => {
        reject(err);
      });
    })

    const parsedBody = await readReq;

    ctx.extendInfo.body = parsedBody;
    await next(ctx);
  }
}