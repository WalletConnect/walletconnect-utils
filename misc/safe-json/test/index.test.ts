import { safeJsonParse, safeJsonStringify } from '../src';

const json = { something: true };
const valid = JSON.stringify(json);
const invalid = '{something:true}';
const str = 'hello world';
const missing = { something: true, missing: undefined };

describe('safe-json-utils', () => {
  describe('safeJsonParse', () => {
    it('should throw when value is not a string', () => {
      expect(() => safeJsonParse(json as any)).toThrow(
        'Cannot safe json parse value of type object'
      );
    });
    it('should return an object when valid json', () => {
      const result = safeJsonParse(valid);
      expect(result).toEqual(json);
    });
    it('should return the same input when invalid json', () => {
      const result = safeJsonParse(invalid);
      expect(result).toEqual(invalid);
    });
  });
  describe('safeJsonStringify', () => {
    it('should return a stringfied json', () => {
      const result = safeJsonStringify(json);
      expect(result).toEqual(valid);
    });
    it('should ignored undefined values', () => {
      const result = safeJsonStringify(missing);
      expect(result).toEqual(valid);
    });
    it('should return input when already a string', () => {
      const result = safeJsonStringify(str);
      expect(result).toEqual(str);
    });
  });
});
