import "mocha";
import * as chai from "chai";

import CircularByteArray from "../src/circularByteArray";

describe("Circular Array", () => {
  describe("Basic use case", () => {
    it("Able to insert items up to byte count", () => {
	const array = new CircularByteArray(16);
	const aString = "a".repeat(4)
	const bString = "b".repeat(4)
	const cString = "c".repeat(4)
	const dString = "d".repeat(4)

	array.enqueue(aString);
	array.enqueue(bString);
	array.enqueue(cString);
	array.enqueue(dString);

	const orderedArray = array.toOrderedArray();

	chai.expect(orderedArray).deep.equal([aString, bString, cString, dString])
    })

    it("Able to insert items less than byte count and return correct array", () => {
	const array = new CircularByteArray(16);
	const aString = "a".repeat(4)
	const bString = "b".repeat(4)

	array.enqueue(aString);
	array.enqueue(bString);

	const orderedArray = array.toOrderedArray();

	chai.expect(orderedArray).deep.equal([aString, bString])
    })

    it("Able to overwrite old items when going over max byte count", () => {
	const array = new CircularByteArray(16);
	const aString = "a".repeat(4)
	const bString = "b".repeat(4)
	const cString = "c".repeat(4)
	const dString = "d".repeat(4)
	const eString = "e".repeat(4)

	array.enqueue(aString);
	array.enqueue(bString);
	array.enqueue(cString);
	array.enqueue(dString);
	array.enqueue(eString);

	const rawArray = array.getRawArray();

	chai.expect(rawArray).deep.equal([eString, bString, cString, dString])
    })

    it("Able to overwrite old items when going over max byte count and order correctly", () => {
	const array = new CircularByteArray(16);
	const aString = "a".repeat(4)
	const bString = "b".repeat(4)
	const cString = "c".repeat(4)
	const dString = "d".repeat(4)
	const eString = "e".repeat(4)

	array.enqueue(aString);
	array.enqueue(bString);
	array.enqueue(cString);
	array.enqueue(dString);
	array.enqueue(eString);

	const orderedArray = array.toOrderedArray();

	chai.expect(orderedArray).deep.equal([bString, cString, dString, eString])
    })

    it("Is able to fully overwrite the array using new items", () => {
	const array = new CircularByteArray(16);
	const aString = "a".repeat(4)
	const bString = "b".repeat(4)
	const cString = "c".repeat(4)
	const dString = "d".repeat(4)

	const eString = "e".repeat(4)
	const fString = "e".repeat(4)
	const gString = "e".repeat(4)
	const hString = "e".repeat(4)

	array.enqueue(aString);
	array.enqueue(bString);
	array.enqueue(cString);
	array.enqueue(dString);

	array.enqueue(eString);
	array.enqueue(fString);
	array.enqueue(gString);
	array.enqueue(hString);

	const orderedArray = array.toOrderedArray();

	const rawArray = array.getRawArray();

	chai.expect(orderedArray).deep.equal([eString, fString, gString, hString])

	chai.expect(rawArray).deep.equal([eString, fString, gString, hString])
    })
  })

  describe("Byte capacity enforcing", () => {
    it("Handles inserts of different sizes", () => {
      const array = new CircularByteArray(16);
      const aString = "a".repeat(4)
      const bString = "b".repeat(8)
      const cString = "c".repeat(4)

      array.enqueue(aString);
      array.enqueue(bString);
      array.enqueue(cString);

      chai.expect(array.toOrderedArray()).deep.equal([aString, bString, cString])
    })

    it("Handles inserts of different sizes and overwrites correctly", () => {
      const array = new CircularByteArray(16);
      const aString = "a".repeat(4)
      const bString = "b".repeat(8)
      const cString = "c".repeat(4)
      const dString = "d".repeat(1)

      array.enqueue(aString);
      array.enqueue(bString);
      array.enqueue(cString);
      array.enqueue(dString);

      chai.expect(array.toOrderedArray()).deep.equal([bString, cString, dString])
    })

    it("Extends array length when appropiate via pushing new values", () => {
      const array = new CircularByteArray(16);
      const aString = "a".repeat(4)
      const bString = "b".repeat(4)
      const cString = "c".repeat(4)
      const dString = "d".repeat(4)

      array.enqueue(aString);
      array.enqueue(bString);
      array.enqueue(cString);
      array.enqueue(dString);

      chai.expect(array.toOrderedArray()).deep.equal([aString, bString, cString, dString]);

      const eString = "e".repeat(1);
      array.enqueue(eString);

      chai.expect(array.toOrderedArray()).deep.equal([bString, cString, dString, eString]);
      chai.expect(array.getRawArray()).deep.equal([eString, bString, cString, dString]);

      const fString = "f".repeat(1);
      array.enqueue(fString);

      chai.expect(array.getRawArray()).deep.equal([eString, bString, cString, dString, fString]);

      chai.expect(array.getReadOrder()).deep.equal([1,2,3,0,4]);

      chai.expect(array.toOrderedArray()).deep.equal([bString, cString, dString, eString, fString]);
    })


  })
});
