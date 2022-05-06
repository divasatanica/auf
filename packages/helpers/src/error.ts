interface ICommonErrorOptions {
  message: string;
  statusCode: number;
  statusMessage: string;
}

const commonErrorSymbol = Symbol('CommonError');

class CommonError extends Error {
  public statusCode: number;
  public statusMessage: string;
  public type = commonErrorSymbol;
  constructor({ message, statusCode, statusMessage }: ICommonErrorOptions) {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

function throwCommonError(options: ICommonErrorOptions): never {
  throw new CommonError(options);
}

function isCommonError (value: any): value is CommonError {
  return value.type === commonErrorSymbol;
}
export {
  CommonError,
  isCommonError,
  throwCommonError
}