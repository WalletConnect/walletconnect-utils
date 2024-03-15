export default class CircularArray {
  private array: string[];
  private head = 0;
  private capacityInBytes: number;
  private currentSizeInBytes: number;

  public constructor(capacityInBytes: number) {
    this.capacityInBytes = capacityInBytes;
    this.currentSizeInBytes = 0;

    // Get an initial size for the array on the assumption that each
    this.array = [];
  }

  private calculateStringSize(item: string) {
    return new TextEncoder().encode(item).length;
  }

  public enqueue(item: string): void {
    const itemSize = this.calculateStringSize(item);
    if (itemSize > this.capacityInBytes) {
      throw new Error("Item size exceeds total capacity.");
    }

    while (this.currentSizeInBytes + itemSize > this.capacityInBytes) {
      const headItem = this.array[this.head];
      this.currentSizeInBytes -= this.calculateStringSize(headItem);
      this.head = (this.head + 1) % this.array.length;
      this.array[this.head] = "";
    }

    this.array.push(item);
    this.currentSizeInBytes += itemSize;
  }

  get(index: number): string {
    if (index < 0 || index >= this.array.length) {
      throw new Error("Index out of bounds");
    }
    return this.array[(this.head + index) % this.array.length];
  }

  public get size() {
    return this.capacityInBytes;
  }

  [Symbol.iterator](): Iterator<string> {
    let count = 0;
    let index = this.head;

    return {
      next: (): IteratorResult<string> => {
        if (count >= this.array.length) {
          return { done: true, value: null };
        }

        const value = this.array[index % this.array.length];
        index++;
        count++;
        return { done: false, value };
      },
    };
  }
}
