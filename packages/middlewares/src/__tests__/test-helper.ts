import { Readable, ReadableOptions } from 'stream';

type MessagePusherType = (host: MockIncomingMessage) => void;

export class MockIncomingMessage extends Readable {
  private messagesPusher: MessagePusherType;
  public headers: Record<string, string> = {};
  constructor(options: ReadableOptions, messagesPusher: MessagePusherType, headers: Record<string, string>) {
    super(options);
    this.messagesPusher = messagesPusher;
    this.headers = headers;
  }
  _read() {
    this.messagesPusher.call(null, this);
  }
}

class FileReadableStream extends Readable {
  private content: string | Buffer;
  constructor(options: ReadableOptions, content: string | Buffer) {
    options.objectMode = true;
    super(options);
    this.content = content
  }
  _read() {
    this.push(this.content, 'utf-8');
    this.push(null);
  }
}

class MockFile {
  private _name: string;
  private _isFile: boolean;
  constructor(name: string, isFile: boolean) {
    this._name = name;
    this._isFile = isFile;
  }

  get name() {
    return this._name;
  }

  isFile() {
    return this._isFile;
  }

  isDirectory() {
    return !(this.isFile());
  }
}

export class MockFileSystem {
  private dirs: MockFile[];
  constructor(dirs: string[]) {
    this.dirs = dirs.map(name => new MockFile(name, name.indexOf('.') > -1));
  }

  createReadStream(path: string) {
    return new FileReadableStream({}, path);
  }

  lstatSync(path: string) {
    let matched = this.dirs.filter(item => {
      return path.indexOf(item.name) > -1
    });

    if (!matched[0]) {
      throw new Error();
    }

    return matched[0];
  }

  readdirSync() {
    return this.dirs
  }
}