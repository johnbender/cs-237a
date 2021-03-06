// This function is used by the test harness to pretty-print values.
// Right now it doesn't handle undefined, functions, NaN, Number.POSITIVE_INFINITY, etc.
// Feel free to modify / extend it as you see fit.
// (FYI, pretty-printing is not used by our grading scripts.)

function prettyPrintValue(value) {
  return JSON.stringify(value);
}

// Helper functions used in the tests

function greaterThan(n) {
  return function(x) { return x > n; };
}

function isNumber(x) {
  return typeof x === 'number';
}

// Tests!

tests(
  {
    name: 'wildcard',
    code: 'match(123,\n' +
          '  _, function(x) { return x + 2; }\n' +
          ')',
    expected: 125
  },
  {
    name: 'mismatched',
    code: 'match(123,\n' +
          '  _\n' +
          ')',
    shouldThrow: true
  },
  {
    name: 'literal pattern',
    code: 'match(123,\n' +
          '  42,  function() { return "aaa"; },\n' +
          '  123, function() { return "bbb"; },\n' +
          '  444, function() { return "ccc"; }\n' +
          ')',
    expected: "bbb"
  },
  {
    name: 'array pattern',
    code: 'match(["+", 5, 7],\n' +
          '  ["+", _, _], function(x, y) { return x + y; }\n' +
          ')',
    expected: 12
  },
  {
    name: 'many numbers',
    code: 'match(["sum", 1, 2, 3, 4],\n' +
          '  ["sum", many(when(isNumber))], function(ns) {\n' +
          '                                   return ns.reduce(function(x, y) { return x + y; });\n' +
          '                                 }\n' +
          ')',
    expected: 10
  },
  {
    name: 'many pairs',
    code: 'match([[1, 2], [3, 4], [5, 6]],\n' +
          '  [many([_, _])], function(pts) { return JSON.stringify(pts); }\n' +
          ')',
    expected: "[1,2,3,4,5,6]"
  },
  {
    name: 'many wildcard',
    code: 'match([[1, 2], [3, 4], [5, 6]],\n' +
          '  [many(_)], function(pts) { return JSON.stringify(pts); }\n' +
          ')',
    expected: "[[1,2],[3,4],[5,6]]"
  },
  {
    name: 'when',
    code: 'match(5,\n' +
          '  when(greaterThan(8)), function(x) { return x + " is greater than 8"; },\n' +
          '  when(greaterThan(2)), function(x) { return x + " is greater than 2"; }\n' +
          ')',
    expected: "5 is greater than 2"
  },
  {
    name: 'first match wins',
    code: 'match(123,\n' +
          '  _,   function(x) { return x; },\n' +
          '  123, function()  { return 4; }\n' +
          ')',
    expected: 123
  },
  {
    name: 'first match wins, direct match first',
    code: 'match(123,\n' +
          '  123,   function(x) { return 1; },\n' +
          '  _, function()  { return x; }\n' +
          ')',
    expected: 1
  },
  {
    name: 'match failed',
    code: 'match(3,\n' +
          '  1,   function() { return 1; },\n' +
          '  2,   function() { return 2; },\n' +
          '  [3], function() { return 3; }\n' +
          ')',
    shouldThrow: true
  },
  {
    name: 'many failed overconsume',
    code: 'match([1, 2, 3, "and", 4], [many(_), "and", _], function(xs, x) { return false; })',
    shouldThrow: true
  },
  {
    name: 'many sum',
    code: 'match(["sum", 1, 2, 3, 4], ["sum", many(when(isNumber))], function(nums) {'
      + ' return nums.reduce(function(x, y){ return x + y });'
      + '})',
    expected: 10
  },
  {
    name: 'many list split',
    code: 'match([0, 0, 0, "and", 4], [many(when(isNumber)), "and", _], function(xs, x) {'
      +  ' return xs.reduce(function(list){ return (list.push(x), list) }, []);'
      + '})',
    expected: [4,4,4]
  },
  {
    name: 'match undefined',
    code: 'match(undefined, undefined, function(){ return "foo"; })',
    expected: "foo"
  },
  {
    name: 'match null',
    code: 'match(null, null, function(){ return "foo"; })',
    expected: "foo"
  },

  {
    name: 'many class 1',
    code: 'match([1,2,3], [many(_)], function() { return JSON.stringify(arguments); })',
    expected: '{"0":[1,2,3]}'
  },
  {
    name: 'many class 2',
    code: 'function isOne(x) { return x === 1 };\n'
      + 'match([1,2,3], [many(when(isOne)),many(_)], function() { return JSON.stringify(arguments); })',
    expected: '{"0":[1],"1":[2,3]}'
  },
  {
    name: 'many class 3',
    code: 'match([2,2,3], [many(when(isOne)),many(_)], function() { return JSON.stringify(arguments); })',
    expected: '{"0":[],"1":[2,2,3]}'
  },
  {
    name: 'many class 4',
    code: 'match([1,2,3], [many(when(isOne)),2,many(_)], function() { return JSON.stringify(arguments); })',
    expected: '{"0":[1],"1":[3]}'
  },
  {
    name: 'many class 5',
    code: 'match([[1,2],[3,4]], [many([many(_)])], function() { return JSON.stringify(arguments); })',
    expected: '{"0":[[1,2],[3,4]]}'
  }
);

// TODO test undefine literal match
// TODO test combinations of array matching
