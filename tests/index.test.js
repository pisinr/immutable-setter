"use strict";


import { expect } from 'chai';
import { setIn, getIn, deleteIn } from '../lib/index';

const originalObject = {
  a: {
    b: {
      someText1: 'Some text 1',
      someNumber1: 1
    },
    c: [
      { someText: 'Some text 2', someNumber: 2 },
      { someText: 'Some text 3', someNumber: 3 }
    ]
  },
  d: {
    someText4: 'Some text 4',
    someNumber4: 4
  },
  e:[1, 2]
};

describe('setIn', function() {

  it('Should create new object for not found property', function() {
    expect(setIn({a:'foo'}, ['b', 'c'], 'bar')).to.deep.equal({a:'foo', b:{c:'bar'}});
  });

  it('Should create array for undefined child key', function() {
    expect(setIn({a:'foo'}, ['b', undefined], 'bar')).to.deep.equal({a:'foo', b:['bar']} );
  });

  it('Should create new array for integer child key', function() {
    expect(setIn({a:'foo'}, ['b', 2,'c'], 'bar')).to.deep.equal({a:'foo', b:[, , {c:'bar'}]});
  });

  it('Should return original object if value already set', function() {
    const newObj = setIn(originalObject, ['a', 'b'], originalObject.a.b);
    expect(newObj).to.be.equal(originalObject);
  });

  it('Should create new objects only for modified tree branch', function() {
    const newObj = setIn(originalObject, ['a', 'b', 'someNumber1'], 2);

    expect(newObj.a.b.someNumber1).to.be.equal(2);
    expect(newObj).to.not.equal(originalObject);

    expect(newObj.d).to.be.equal(originalObject.d);

    expect(newObj.a).to.not.equal(originalObject.a);
    expect(newObj.a.b).to.not.equal(originalObject.a.b);

    expect(newObj.a.c).to.be.equal(originalObject.a.c);

    expect(newObj.a.b.someText1).to.be.equal(originalObject.a.b.someText1);

  });

  it('Should append item to array if key is not specified', function() {
    const newObj = setIn(originalObject, ['e', undefined], 5);
    expect(newObj.e[2]).to.be.equal(5);
  });

  it('Should create new object if key is new', function() {
    const newObj = setIn(originalObject, ['a', 'j', 'k'], "booo");

    expect(newObj.a.j.k).to.be.equal("booo");
  });

  //this test brakes immutable helper library: https://www.npmjs.com/package/immutability-helper
  //Should be used as an explanation why setIn is used instead
  //const newObj = update(originalObject, {a: {j: {$push:[{k: 'foo'}]}}});
  it('Should create new array if value key is undefined and parent does not exist', function() {
    const newObj = setIn(originalObject, ['a', 'j', ,'k'], "foo");
    expect(newObj.a.j[0].k).to.be.equal("foo");
  });

  it('Should create new instance of the array if array item is modified', function() {
    const newObj = setIn(originalObject, ['a', 'c', 1,'someNumber'], 10);

    expect(newObj.a.c).to.not.equal(originalObject.a.c);
    expect(newObj.a.c[0]).to.be.equal(originalObject.a.c[0]);
    expect(newObj.a.c[1]).to.not.equal(originalObject.a.c[1]);
    expect(newObj.a.c[1].someNumber).to.be.equal(10);
  });

  it('Should throw exception if undefined key in the keyPath points to object instead of the array',
    function() {
      expect(() => setIn(originalObject, ['a', , 'someText1'], 'abc') ).to.throw();
  });

});

describe('deleteIn', function () {
  it('Should delete existing object property specified by keyPath. Only references along the key path should change',
    function() {
      const newObj = deleteIn(originalObject, ['a', 'c', 0, 'someNumber']);

      //Delete
      expect(newObj.a.c[0].hasOwnProperty('someNumber')).to.be.false;
      expect(newObj.a.c[0].someText).to.be.equal('Some text 2');
      expect(newObj.a.c.length).to.be.equal(2);

      expect(newObj).to.not.equal(originalObject);
      expect(newObj.a.c).to.not.equal(originalObject.a.c);
      expect(newObj.a.c[0]).to.not.equal(originalObject.a.c[0]);

      expect(newObj.a.c[1]).to.be.equal(originalObject.a.c[1]);
      expect(newObj.a.b).to.be.equal(originalObject.a.b);

  });

  it('Should delete item fom array specified by keyPath. Only references along the key path should change',
    function() {
      const newObj = deleteIn(originalObject, ['a', 'c', 0]);

      expect(newObj.a.c.length).to.be.equal(1);
      expect(newObj.a.c[0].someNumber).to.be.equal(3);

      expect(newObj).to.not.equal(originalObject);
      expect(newObj.a.c).to.not.equal(originalObject.a.c);

      expect(newObj.a.c[0]).to.be.equal(originalObject.a.c[1]);
  });

  it("Should return original object if key or index in keyPath doesn't exist", function() {
    const newObj1 = deleteIn(originalObject, ['a', 'k']);
    expect(newObj1).to.be.equal(originalObject);

    const newObj2 = deleteIn(originalObject, ['a', 'e', 5]);
    expect(newObj2).to.be.equal(originalObject);
  });

  it('Should throw an exception when keyPath provide string instead of number for the array member',
    function() {
      expect(() => deleteIn(originalObject, ['a', 'c', 'd'])).to.throw();
  });

  it('Should throw an exception when keyPath points to value instead of object or an array',
    function() {
      expect(() => deleteIn(originalObject, ['a', 'b', 'someText1', 'k'])).to.throw();
    });

});

describe('getIn', function() {

  it('Should return value described by keyPath', function() {
    expect( getIn(originalObject, ['a', 'c', 1, 'someNumber']) ).to.be.equal(3);
  });

  it('Should return undefined if path points to value that does not exist', function() {
    expect( getIn(originalObject, ['a', 'f', 5, 'foo']) ).to.be.undefined;
  });

  it('Should throw exception for invalid key path', function() {
    expect(() => getIn(originalObject, ['e', 0, 1])).to.throw();
  });
});
