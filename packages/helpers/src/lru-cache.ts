class DoubleLinkedListNode {
  pre: null | DoubleLinkedListNode;
  next: null | DoubleLinkedListNode;
  val: any;
  key: any;
  constructor(val: any) {
    this.pre = null;
    this.next = null;
    this.val = val
  }
}

class LRUCache {
  private _count: number;
  private _capacity: number;
  private _valueMap: Record<string, any>;
  private _first: any;
  private _last: any;
  /**
   * @param {number} capacity
   */
  constructor(capacity: number) {
    this._count = 0;
    this._capacity = capacity;
    this._valueMap = {};
    this._first = null;
    this._last = null;
  }

  get(key: string) {
    const node = this._valueMap[key];
    const keyExists = !!node;

    if (!keyExists) {
      this._valueMap[key] = void 0;
      return -1;
    }

    this._setMRU(key);
    return node.val;
  }

  put(key: string, value: any) {
    const node = this._valueMap[key];
    const keyExists = !!node;
  
    if (keyExists) {
      node.val = value;
    } else {
      if (this._count >= this._capacity) {
        this._removeLRU();
      }
      this._addToList(key, value);
    }
    this._setMRU(key);
  }

  private _removeLRU() {
    const second = this._first.next;
    const key = this._first.key;
    this._first.next = null;
    if (second) {
      second.pre = null; 
    }
    this._first = second;
    this._count --;
    delete this._valueMap[key];
  }

  private _setMRU(key: string) {
    const newLast = this._valueMap[key];
    const preLast = this._last;

    if (preLast === newLast) {
      return;
    }

    this._last = newLast;

    // If newLast.pre is falsy, this._first should be updated because it means newLast was the first node.
    if (newLast.pre) {
      newLast.pre.next = newLast.next;
    } else if (newLast.next) {
      this._first = this._first.next;
    }
    if (newLast.next) {
      newLast.next.pre = newLast.pre; 
    }
    if (preLast) {
      preLast.next = newLast;
      newLast.pre = preLast;
      newLast.next = null;
    }
  }

  private _addToList(key: string, value: any) {
    this._count ++;

    const newLast = new DoubleLinkedListNode(value);

    // the key property is for deleting the LRU Node in the map within the _removeLRU method.
    newLast.key = key;
    this._valueMap[key] = newLast;

    // If this._first is falsy, directly set the newLast to this._first and this._last.
    if (!this._first) {
      this._first = this._last = newLast;
    } else {
      this._setMRU(key);
    }
  }
}

export {
  LRUCache
}