function uuid(count: number) {
  return `${(100 * Math.random()) * (100 * Math.random())}`.replace(/\./g, '').slice(0, count);
}

export {
  uuid
}