tests(
  F,
  {
    name: 'plus',
    code: '6 * 7',
    expected: 42
  },
  {
    name: 'less than',
    code: '6 < 7',
    expected: true
  },
  {
    name: 'arithmetic and relational operators should require args to be numbers',
    code: '(fun x -> x) + 1',
    shouldThrow: true
  },
  {
    name: 'or',
    code: 'true || false',
    expected: true
  },
  {
    name: 'boolean operators should require args to be booleans',
    code: '(fun x -> x) || true',
    shouldThrow: true
  },
  {
    name: 'conditional',
    code: 'if 2 > 3 then 4321 else 1234',
    expected: 1234
  },
  {
    name: 'let',
    code: 'let x = 3 + 4 in\n' +
          '  x - 2',
    expected: 5
  },
  {
    name: 'unbound identifier',
    code: 'x + 1',
    shouldThrow: true
  },
  {
    name: 'fun and call',
    code: '(fun x -> x + 1) 3',
    expected: 4
  },
  {
    name: 'passing too many args is not OK',
    code: '(fun x -> x + 1) 3 4',
    shouldThrow: true
  },
  {
    name: 'nested funs',
    code: 'let add = fun x -> fun y -> x + y in\n' +
          '  let inc = add 1 in\n' +
          '    inc 10',
    expected: 11
  }
);

