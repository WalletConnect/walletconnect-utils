import Timestamp, { delay } from '../src';

describe('Timestamp', () => {
  let time: Timestamp;
  beforeAll(() => {
    time = new Timestamp();
  });
  it('init', () => {
    expect(time).toBeTruthy();
  });
  it('start & stop', async () => {
    const timeout = 1000;
    const before = Date.now();
    const label = 'test';
    time.start(label);
    await delay(timeout);
    time.stop(label);
    const info = time.get(label);
    expect(info).toBeTruthy();
    expect(info.started >= before).toBeTruthy();
    if (typeof info.elapsed === 'undefined')
      throw new Error('Elapsed must be defined after stop');
    expect(info.elapsed).toBeTruthy();
    expect(info.elapsed >= timeout).toBeTruthy();
  });
});
