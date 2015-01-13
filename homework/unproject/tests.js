tests(
  C,
  {
    name: 'plus',
    code: '6 + 7',
    expected: 13
  },
  {
    name: 'minus',
    code: '6 - 7',
    expected: -1
  },
  {
    name: 'times',
    code: '6 * 7',
    expected: 42
  },
  {
    name: 'divide',
    code: '8 / 4',
    expected: 2
  },
  {
    name: 'all together now',
    code: '1 + 2 ^ 3 - 4 * 5 / 10',
    expected: 7
  },
  {
    name: 'sequencing evaluates to value of 2nd operand',
    code: '1 + 23\n' +
          '-5 - 8\n' +
          '3^2',
    expected: 9
  },
  {
    name: 'undeclared variable evaluates to 0',
    code: 'asdf',
    expected: 0
  },
  {
    name: 'assignment evaluates to the value of the rhs',
    code: 'aaa = 2 * 3',
    expected: 6
  },
  {
    name: 'assignment and var lookup',
    code: 'x = 3\n' +
          '800\n' +
          'y = 2\n' +
          '(y + 1)^x',
    expected: 27
  },
  {
    name: 'variables don\'t persist',
    code: 'x',
    expected: 0
  }
);

