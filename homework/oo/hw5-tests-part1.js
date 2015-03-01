// Initialize the class table!

OO.initializeCT();

// Tests for Part I

tests(JS,
  {
    name: 'Number.<',
    code: 'OO.send(5, "<", 4)',
    expected: false
  },
  {
    name: 'Number.<=',
    code: 'OO.send(4, "<=", 4)',
    expected: true
  },
  {
    name: 'Number.>',
    code: 'OO.send(5, ">", 4)',
    expected: true
  },
  {
    name: 'Number.>=',
    code: 'OO.send(2, ">=", 4)',
    expected: false
  },
  {
    name: 'methods on null, true, and false',
    code: 'OO.declareMethod("Null", "m", function(_this) { return 100; });\n' +
          'OO.declareMethod("True", "m", function(_this) { return 10; });\n' +
          'OO.declareMethod("False", "m", function(_this) { return 1; });\n' +
          'OO.send(null, "m") + OO.send(true, "m") * 2 + OO.send(false, "m") * 3',
    expected: 123
  }
);

