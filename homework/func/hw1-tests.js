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
  },
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
  },

  {
    name: 'rh-t2',
    code: 'let f = fun x -> let x = 1 in x = 1 in f 2',
    expected: true
  },

  /* start Zhixuan's test */
  {
    name: 'primValueNumber1',
    code: '1',
    expected: 1
  },
  {
    name: 'primValueNumber2',
    code: '-10',
    expected: -10
  },
  {
    name: 'primValueNumber3',
    code: '0',
    expected: 0
  },
  {
    name: 'primValueBoolean1',
    code: 'true',
    expected: true
  },
  {
    name: 'primValueBoolean2',
    code: 'false',
    expected: false
  },
  {
    name: 'primValueNull1',
    code: 'null',
    expected: null
  },
  {
    name: 'primValueNull2',
    code: 'undefined',
    shouldThrow: true
  },
  // ops
  {
    name: 'arithmetic and relational operators type checking',
    code: 'true > false',
    shouldThrow: true
  },
  {
    name: 'arithmetic and relational operators type checking',
    code: 'true < 3',
    shouldThrow: true
  },
  {
    name: 'arithmetic and relational operators type checking',
    code: 'true / 3',
    shouldThrow: true
  },
  {
    name: 'arithmetic and relational operators type checking',
    code: '3 - false',
    shouldThrow: true
  },
  {
    name: 'arithmetic and relational operators type checking',
    code: 'true % false',
    shouldThrow: true
  },
  // TODO: confirm this
  {
    name: 'logical operators type checking',
    code: '1 || 1',
    shouldThrow: true
  },
  {
    name: 'logical operators type checking',
    code: '4 && 1',
    shouldThrow: true
  },
  {
    name: 'logical operators type checking',
    code: 'true || 1',
    shouldThrow: true
  },
  {
    name: 'logical operators type checking',
    code: 'false && 1',
    shouldThrow: true
  },
  // equality
  {
    name: 'equalty',
    code: '1 = 1',
    expected: true
  },
  {
    name: 'equalty',
    code: 'true = 1',
    expected: false
  },
  {
    name: 'equalty',
    code: '1 = null',
    expected: false
  },
  {
    name: 'equalty',
    code: 'null = null',
    expected: true
  },
  // id
  {
    name: 'variable shadowing',
    code: 'let x = 3 in let x = 4 in x',
    expected: 4
  },
  {
    name: 'unbound value',
    code: 'let f = fun x y -> x*y in f y',
    shouldThrow: true
  },
  // if
  // TODO: confirm this
  {
    name: 'if requires e1 to be boolean',
    code: 'if 4 then 2 else false',
    shouldThrow: true
  },
  {
    name: 'conditional',
    code: 'if 2 < 3 then 4321 else 1234',
    expected: 4321
  },
  // call
  {
    name: 'call',
    code: 'let x = fun x -> x in x 1',
    expected: 1
  },
  {
    name: 'calling with multiple args',
    code: 'let f = fun x y -> x*y in f 10 3',
    expected: 30
  },
  {
    name: 'calling with too few args',
    code: 'let f = fun x y -> x in f 10 ',
    shouldThrow: true
  },
  {
    name: 'calling with too many args',
    code: 'let f = fun x y -> x in f 10 3 true',
    shouldThrow: true
  },

  // end
  {
    name: 'end of args placeholder',
    code: 'if 4 then 2 else false',
    shouldThrow: true
  },

  {
    name: 'only the parent scope should be available',
    code: 'let x = 1 in\n' +
      '  let f = (fun x -> y) in\n' +
      '    let y = 0 in\n' +
      '      f y',
    shouldThrow: true
  },

  {
    name: 'retains proper closed over value instead of new scope value',
    code: 'let x = 1 in\n'
      + '  let f = (let y = 2 in (fun x -> y)) in\n'
      + '    let y = 3 in\n'
      + '      f y',
    expected: 2
  },

  /* start Runhang's test */
  {
    name: 'rh-t1',
    code: 'let f = fun x -> ((x + 2) * x / 1) % 2 in\n' +
      '(let x = 5 in let x = 3 in x) * (let x = 3 in f (x + 2))',
    expected: 3
  }
);
