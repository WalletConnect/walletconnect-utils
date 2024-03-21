export default class CircularLengthArray {
  private array: number[];
  private size: number;
  private head: number;
  private count: number;

  public constructor(size: number) {
    this.array = new Array(size);
    this.size = size;
    this.head = 0;
    this.count = 0;
  }

  public enlargeWithItem(item: number) {
    this.array.push(item);
    this.size ++;
    this.count++;
  }

  public enqueue(item: number) {
    if (this.count === this.size) {
      this.head = (this.head + 1) % this.size;
    } else {
      this.count++;
    }

    // Calculate the index at which to place the new item.
    const index = (this.head + this.count - 1) % this.size;
    this.array[index] = item;
  }

  public toOrderedArray() {
    return Array.from(this)
  }

  public get(index: number): number {
    if (index < 0 || index >= this.array.length) {
      throw new Error("Index out of bounds");
    }

    return this.array[(this.head + index) % this.array.length];
  }

  [Symbol.iterator](): Iterator<number> {
    let index = 0;

    const next = (): IteratorResult<number> => {
      if (index >= this.array.length) {
        return { done: true, value: null };
      }

      const value = this.get(index);
      index++;

      if (!value) {
        return next();
      }

      return { done: false, value };
    };

    return {
      next,
    };
  }

  public getSize() {
    return this.size;
  }
}
