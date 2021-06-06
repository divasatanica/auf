function composePromise(...fns: Function[]) {
  return function (arg: any) {
    return fns.reduceRight(function (prevResult, currFn) {
      const promise = prevResult.then(res => currFn(res));

      return promise;
    }, Promise.resolve(arg));
  };
}

function compose(funcs: Function[]) {
  return function (arg: any) {
    return funcs.reduce(function (acc, curr) {
      return curr(acc);
    }, arg);
  };
}

export {
  composePromise,
  compose
}