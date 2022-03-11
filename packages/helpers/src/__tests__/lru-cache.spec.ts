import { LRUCache } from '..';

describe('[LRUCache @@ helpers]', () => {
  test('Should return a instance of LRUCache with capacity 5', () => {
    const cache = new LRUCache(5);
  
    expect(Object.getPrototypeOf(cache)).toEqual(LRUCache.prototype);
    expect(cache.capacity).toEqual(5);
  });
  
  test('Should return correct cache value', () => {
    const cache = new LRUCache(2);
  
    cache.put('1', 2);
    cache.put('2', 3);
    const res = cache.get('1');
    expect(res).toEqual(2);
    cache.put('3', 1);
    const res1 = cache.get('2');
    expect(res1).toEqual(-1);
    const res2 = cache.get('1');
    expect(res2).toEqual(2);
    expect(cache.get('3')).toEqual(1);
    expect(cache.get('2')).toEqual(-1);
  });
});
