import * as env from '../src';

describe('Environment', () => {
  describe('isNode', () => {
    it('should return true', () => {
      const result = env.isNode();
      expect(result).toBeTruthy();
    });
  });

  describe('isReactNative', () => {
    it('should return false', () => {
      const result = env.isReactNative();
      expect(result).toBeFalsy();
    });
  });

  describe('isBrowser', () => {
    it('should return false', () => {
      const result = env.isBrowser();
      expect(result).toBeFalsy();
    });
  });
});
