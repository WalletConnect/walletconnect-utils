export function findDuplicates(arr: number[]): number[] {
  return arr.filter((item, index) => arr.indexOf(item) !== index);
}
