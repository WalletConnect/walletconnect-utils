class LogListNode {
  private nodeValue: string;
  private sizeInBytes: number;
  public next: LogListNode | null;

  constructor(value: string) {
    this.nodeValue = value;
    this.sizeInBytes = new TextEncoder().encode(this.nodeValue).length;
    this.next = null;
  }

  public get value() {
    return this.nodeValue;
  }

  public get size() {
    return this.sizeInBytes;
  }
}

export default class LogLinkedList {
  private lengthInNodes: number;
  private sizeInBytes: number;
  private head: LogListNode | null;
  private tail: LogListNode | null;
  private maxSizeInBytes: number;

  constructor(maxSizeInBytes: number) {
    this.head = null;
    this.tail = null;
    this.lengthInNodes = 0;
    this.maxSizeInBytes = maxSizeInBytes;
    this.sizeInBytes = 0;
  }

  public append(value: string): void {
    const newNode = new LogListNode(value);

    while(this.size + newNode.size > this.maxSizeInBytes) {
      this.shift();
    }

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
      }
      this.tail = newNode;
    }
    this.lengthInNodes++;
    this.sizeInBytes += newNode.size;
  }

  public shift(): void {
    if (!this.head) {
      return;
    }

    const removedNode = this.head;
    this.head = this.head.next;

    if (!this.head) {
      this.tail = null;
    }

    this.lengthInNodes--;
    this.sizeInBytes -= removedNode.size;
  }

  public toArray(): string[] {
    const array: string[] = [];
    let currentNode = this.head;
    while (currentNode !== null) {
      array.push(currentNode.value);
      currentNode = currentNode.next;
    }
    return array;
  }

  public get length() {
    return this.lengthInNodes;
  }

  public get size() {
    return this.sizeInBytes;
  }

  public toOrderedArray() {
    return Array.from(this)
  }

  [Symbol.iterator](): Iterator<string> {
    let node = this.head

    const next = (): IteratorResult<string> => {
      if(!node) {
	return { done: true, value: null }
      }

      const value = node.value;
      node = node.next;

      return { done: false, value: value }
    }

    return { next }
  }
}
