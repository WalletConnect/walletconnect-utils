export default class CircularArray {
  private array: string[];
  private head: number;
  private currentSizeInBytes: number;
  private capacityInBytes: number;

  constructor(capacityInBytes: number) {
    this.capacityInBytes = capacityInBytes;
    this.currentSizeInBytes = 0;
    this.head = 0;
    this.array = [];
  }

  private calculateStringSize(item: string): number {
    return new TextEncoder().encode(item).length;
  }

  public enqueue(item: string): void {
    const itemSize = this.calculateStringSize(item);
    if (itemSize > this.capacityInBytes) {
      throw new Error("Item size exceeds total capacity.");
    }

    let insertIdx = this.array.length;
    while (this.currentSizeInBytes + itemSize > this.capacityInBytes) {
      const headItem = this.array[this.head];
      this.currentSizeInBytes -= this.calculateStringSize(headItem);
      insertIdx = this.head;
      this.array[this.head] = "";
      this.head = (this.head + 1) % Math.max(this.array.length, 1); // Avoid modulo 0, was causing bugs
    }

    if (insertIdx >= this.array.length) {
      this.array.push(item);
    } else {
      this.array[insertIdx] = item;
    }

    this.currentSizeInBytes += itemSize;
  }

  public get(index: number): string {
    if (index < 0 || index >= this.array.length) {
      throw new Error("Index out of bounds");
    }
    return this.array[(this.head + index) % this.array.length];
  }

  public toOrderedArray() {
    return Array.from(this);
  }

  public getRawArray() {
    return this.array;
  }

  [Symbol.iterator](): Iterator<string> {
    let index = 0;

    const next = (): IteratorResult<string> => {
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
}
