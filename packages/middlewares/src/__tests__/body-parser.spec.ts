import { BodyParser } from '..';
import { MockIncomingMessage } from './test-helper';

const fakeFormDataBody = 
`------WebKitFormBoundaryJFLpcZZ2mz71yHFu\r\nContent-Disposition: form-data; name="file"; filename="blob"\r\n\Content-Type: application/octet-stream\r\n\r\nlove\r\n------WebKitFormBoundaryJFLpcZZ2mz71yHFu\r\nContent-Disposition: form-data; name="index"\r\n\r\n0\r\n------WebKitFormBoundaryJFLpcZZ2mz71yHFu--`;

const readableFactory = (message: string) => {
  const pusher = (host: MockIncomingMessage) => {
    const messages = message.split('&');
    const datas = [...messages, null];

    datas.forEach((message, index) => {
      host.push(message, 'utf-8');
      if (index < datas.length - 2) {
        host.push('&');
      }
    });
  }
  return new MockIncomingMessage({}, pusher, {
    'content-type': 'application/x-www-urlencoded'
  });
}

const getFakeDataStream = (message: string) => {
  return readableFactory(message);
}

const getFakeFormData = (message: string) => {
  const pusher = (host: MockIncomingMessage) => {
    host.push(message);
    host.push(null);
  }
  const fakeFormData = new MockIncomingMessage({}, pusher, {
    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryJFLpcZZ2mz71yHFu'
  })
  return fakeFormData;
}

describe('[BodyParser @@ middlewares] Normal Test', () => {
  test('Should correctly parse http body', done => {
    const fakeContext = {
      req: getFakeDataStream('name=coma&age=25'),
      body: {},
      extendInfo: {
        body: {} as any
      }
    } as any;
  
    const BodyParserMiddleware = BodyParser();
  
    BodyParserMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      expect(fakeContext.extendInfo.body.name).toBe('coma');
      expect(fakeContext.extendInfo.body.age).toEqual('25');
      done();
    });
  });
  
  test('Should correctly parse http body in form-data', done => {
    const fakeContext = {
      req: getFakeFormData(fakeFormDataBody),
      body: {},
      extendInfo: {
        body: {} as any
      }
    } as any;
  
    const BodyParserMiddleware = BodyParser();
  
    BodyParserMiddleware(fakeContext, () => Promise.resolve()).then(() => {
      expect(fakeContext.extendInfo.body.files).toBeInstanceOf(Array);
      expect(fakeContext.extendInfo.body.files[0].file).toBe('love');
      expect(fakeContext.extendInfo.body.index).toEqual('0');
      done();
    });
  });
});