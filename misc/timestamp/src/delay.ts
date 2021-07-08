export function delay(timeout: number): Promise<true> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
}
