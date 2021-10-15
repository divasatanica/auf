/**
 * @param {number} capacity
 */
 class LRUCache {
  public map: Map<string, any>;
  public list: DoubleLinkedList;
  public capacity: number;
  constructor(capacity: number) {
    this.map = new Map();
    this.list = new DoubleLinkedList();
    this.capacity = capacity;
  }

  get(key: string): any {
    if (!this.map.has(key)) {
      return -1;
    }

    const node = this.map.get(key);

    this.list.splice(node);
    const newNode = this.list.push(key, node.val);
    this.map.set(key, newNode);
    return node.val;
  }

  put(key: string, value: any): void {
    if (!this.map.has(key)) {
      const node = this.list.push(key, value);
      this.map.set(key, node);
      if (this.list.count > this.capacity) {
        const lruNode = this.list.shift();
        if (lruNode) {
          this.map.delete(lruNode.key);
        }
      }
      return;
    }

    this.list.splice(this.map.get(key));
    const node = this.list.push(key, value);
    this.map.set(key, node);
  }
}

/**
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */

class DoubleLinkedListNode {
  public pre: DoubleLinkedListNode | null;
  public next: DoubleLinkedListNode | null;
  public val: any;
  public key: any;
  constructor (val?: any, key: any | null = null) {
    this.pre = null;
    this.next = null;
    this.val = val;
    this.key = key;
  }
}

class DoubleLinkedList {
  public head: DoubleLinkedListNode;
  public tail: DoubleLinkedListNode;
  public count: number;
  constructor () {
    this.head = new DoubleLinkedListNode();
    this.tail = new DoubleLinkedListNode();
    this.head.next = this.tail;
    this.tail.pre = this.head;
    this.count = 0;
  }

  push(key: string, val: any) {
    const node = new DoubleLinkedListNode(val, key);
    const last = this.tail.pre!;
    last.next = node;
    node.pre = last;
    this.tail.pre = node;
    node.next = this.tail;
    this.count ++;

    return node;
  }


  shift(): DoubleLinkedListNode | null {
    if (this.count < 1) {
      return null;
    }

    const first = this.head.next!;

    this.head.next = first.next;
    first.next!.pre = this.head;
    first.next = null;
    first.pre = null;
    this.count --;
    return first;
  }

  splice(node: DoubleLinkedListNode) {
    if (this.count < 1) {
      return null;
    }

    const pre = node.pre!;
    const next = node.next!;
    node.pre = null;
    node.next = null;
    pre.next = next;
    next.pre = pre;
    this.count --;
    return node;
  }
}

export {
  LRUCache
}