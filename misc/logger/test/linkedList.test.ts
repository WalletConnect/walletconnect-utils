import "mocha";
import * as chai from "chai";

import LinkedList from "../src/linkedList";

describe("Circular Array", () => {
  describe("Basic use case", () => {
    it("Able to insert items up to byte count", () => {
      const array = new LinkedList(16);
      const aString = "a".repeat(4);
      const bString = "b".repeat(4);
      const cString = "c".repeat(4);
      const dString = "d".repeat(4);

      array.append(aString);
      array.append(bString);
      array.append(cString);
      array.append(dString);

      const orderedArray = array.toOrderedArray();

      chai.expect(orderedArray).deep.equal([aString, bString, cString, dString]);
    });

    it("Able to insert items less than byte count and return correct array", () => {
      const array = new LinkedList(16);
      const aString = "a".repeat(4);
      const bString = "b".repeat(4);

      array.append(aString);
      array.append(bString);

      const orderedArray = array.toOrderedArray();

      chai.expect(orderedArray).deep.equal([aString, bString]);
    });

    it("Able to overwrite old items when going over max byte count and order correctly", () => {
      const array = new LinkedList(16);
      const aString = "a".repeat(4);
      const bString = "b".repeat(4);
      const cString = "c".repeat(4);
      const dString = "d".repeat(4);
      const eString = "e".repeat(4);

      array.append(aString);
      array.append(bString);
      array.append(cString);
      array.append(dString);
      array.append(eString);

      const orderedArray = array.toOrderedArray();

      chai.expect(orderedArray).deep.equal([bString, cString, dString, eString]);
    });

    it("Is able to fully overwrite the array using new items", () => {
      const array = new LinkedList(16);
      const aString = "a".repeat(4);
      const bString = "b".repeat(4);
      const cString = "c".repeat(4);
      const dString = "d".repeat(4);

      const eString = "e".repeat(4);
      const fString = "e".repeat(4);
      const gString = "e".repeat(4);
      const hString = "e".repeat(4);

      array.append(aString);
      array.append(bString);
      array.append(cString);
      array.append(dString);

      array.append(eString);
      array.append(fString);
      array.append(gString);
      array.append(hString);

      const orderedArray = array.toOrderedArray();

      chai.expect(orderedArray).deep.equal([eString, fString, gString, hString]);
    });
  });

  describe("Byte capacity enforcing", () => {
    it("Handles inserts of different sizes", () => {
      const array = new LinkedList(16);
      const aString = "a".repeat(4);
      const bString = "b".repeat(8);
      const cString = "c".repeat(4);

      array.append(aString);
      array.append(bString);
      array.append(cString);

      chai.expect(array.toOrderedArray()).deep.equal([aString, bString, cString]);
    });

    it("Handles inserts of different sizes and overwrites correctly", () => {
      const array = new LinkedList(16);
      const aString = "a".repeat(4);
      const bString = "b".repeat(8);
      const cString = "c".repeat(4);
      const dString = "d".repeat(1);

      array.append(aString);
      array.append(bString);
      array.append(cString);
      array.append(dString);

      chai.expect(array.toOrderedArray()).deep.equal([bString, cString, dString]);
    });

    it("Extends array length when appropiate via pushing new values", () => {
      const array = new LinkedList(16);
      const aString = "a".repeat(4);
      const bString = "b".repeat(4);
      const cString = "c".repeat(4);
      const dString = "d".repeat(4);

      array.append(aString);
      array.append(bString);
      array.append(cString);
      array.append(dString);

      chai.expect(array.toOrderedArray()).deep.equal([aString, bString, cString, dString]);

      const eString = "e".repeat(1);
      array.append(eString);

      chai.expect(array.toOrderedArray()).deep.equal([bString, cString, dString, eString]);

      const fString = "f".repeat(1);
      array.append(fString);

      chai.expect(array.toOrderedArray()).deep.equal([bString, cString, dString, eString, fString]);
    });

    it("Does not permit inserting item above limit", () => {
      const array = new LinkedList(16);
      const aString = "a".repeat(17);

      const expectedError = `[LinkedList] Value too big to insert into list: ${aString} with size ${17}`;

      chai.expect(array.append.bind(array, aString)).throws(expectedError);
    });

    it("Measure of performance", () => {
      const oneMillionBytes = 1024 * 1000;
      const baseItemSize = 20;
      const array = new LinkedList(oneMillionBytes);
      let insertedItemsCount = 0;
      let totalInsertionTime = 0;
      for (let i = 0; i < oneMillionBytes / baseItemSize; ++i) {
        const byteSize = Math.floor(baseItemSize + Math.random() * 200);
        const insertionStartTime = performance.now();
        array.append("a".repeat(byteSize));
        totalInsertionTime += performance.now() - insertionStartTime;
        insertedItemsCount++;
      }
      console.log(`It took ${totalInsertionTime}ms to insert ${insertedItemsCount} items`);

      const toArrayStartTime = performance.now();
      const orderedArray = array.toOrderedArray();
      const toArrayElapsedTime = performance.now() - toArrayStartTime;

      console.log(
        `It took ${toArrayElapsedTime}ms to create the ordered array of len ${orderedArray.length}`,
      );
    });
  });
});
