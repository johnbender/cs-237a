tests(
  F,
  {
    name: 'recursive let',
    code: 'let f = fun n -> if n = 0\n' +
          '                 then 1\n' +
          '                 else n * f (n - 1) in\n' +
          '  f 5',
    expected: 120
  },
  {
    name: 'currying',
    code: 'let add = fun x y -> x + y in\n' +
          '  let inc = add 1 in\n' +
          '    inc 10',
    expected: 11
  },
  {
    name: 'cons',
    code: '5 + 4::0::6::nil',
    expected: ['cons', 9, ['cons', 0, ['cons', 6, null]]]
  },
  {
    name: 'list sugar',
    code: '[5 + 4;0;6]',
    expected: ['cons', 9, ['cons', 0, ['cons', 6, null]]]
  },
  {
    name: 'simple match failure',
    code: 'match 0 with\n' +
      '  1 -> 1 \n',
    shouldThrow: true
  },
  {
    name: 'simple match taut',
    code: 'match 1 with\n' +
      '  1 -> 1 \n',
    expected: 1
  },
  {
    name: 'simple match otherwise',
    code: 'match 0 with\n' +
      '  1 -> 1 \n' +
      '  | _ -> 2 \n',
    expected: 2
  },
  {
    name: 'simple destruct match',
    code: 'let lst = [1;2] in\n' +
          '  match lst with\n' +
          '    [1;x] -> 10 + x',
    expected: 12
  },
  {
    name: 'scoped simple destruct match',
    code: 'let y = 1 in\n' +
          '  match [y;2] with\n' +
          '    [1;x] -> 10 + x',
    expected: 12
  },
  {
    name: 'complex destruct match',
    code: 'let lst = [1;2::3;4] in\n' +
          '  match lst with\n' +
          '    [1;x::3;y] -> y * 10 + x',
    expected: 42
  },
  {
    name: 'match failure should throw exception',
    code: 'match 5 with 6 -> 42',
    shouldThrow: true
  },
  {
    name: 'factorial w/ pattern matching',
    code: 'let f = fun n ->\n' +
          '          match n with\n' +
          '            0 -> 1\n' +
          '          | _ -> n * f (n - 1) in\n' +
          '  f 6',
    expected: 720
  },
  {
    name: 'map',
    code: 'let map = fun f l ->\n' +
          '            match l with\n' +
          '              nil -> nil\n' +
          '            | x::xs -> f x::map f xs in\n' +
          '  map (fun x -> x + 1) [1;2;3]',
    expected: ['cons', 2, ['cons', 3, ['cons', 4, null]]]
  },
  {
    name: 'set and seq',
    code: 'let counter = (let count = 0 in fun -> count := count + 1) in\n' +
          '  counter (); counter (); counter ()',
    expected: 3
  },
  {
    name: 'list comprehension w/o predicate',
    code: 'let nats = [0;1;2;3;4] in\n' +
          '  [x * 2 | x <- nats]',
    expected: ['cons', 0, ['cons', 2, ['cons', 4, ['cons', 6, ['cons', 8, null]]]]]
  },
  {
    name: 'list comprehension w/ scoped var',
    code: 'let y = 3 in\n' +
          '  [x * y | x <- [1;2]]',
    expected: ['cons', 3, ['cons', 6, null]]
  },
  {
    name: 'list comprehension w/ scoped var can write to state',
    code: 'let y = 3 in\n'
      + '  [y:= 1; x * y | x <- [1;2]]; y',
    expected: 1
  },
  {
    name: 'list comprehension w/ shadow var',
    code: 'let x = 10 in let y = 3 in\n'
      + '  [x * y | x <- [1;2]]',
    expected: ['cons', 3, ['cons', 6, null]]
  },
  {
    name: 'list comprehension with predicate',
    code: 'let nats = [0;1;2;3;4] in\n' +
          '  [x * 2 | x <- nats, x % 2 = 0]',
    expected: ['cons', 0, ['cons', 4, ['cons', 8, null]]]
  },
  {
    name: 'list comprehension with compound predicate',
    code: 'let nats = [0;1;2;3;4] in\n' +
          '  [x * 2 | x <- nats, x % 2 = 0 && x = 4]',
    expected: ['cons', 8, null]
  },
  {
    name: 'list comprehension w/ bad generator',
    code: 'let nats = 4 in\n' +
          '  [x * 2 | x <- nats]',
    shouldThrow: true
  },
  {
    name: 'delay and force simple',
    code: 'force (delay 2)',
    expected: 2
  },
  {
    name: 'delay and force scoped',
    code: 'force (let x = 1 in delay x)',
    expected: 1
  },
  {
    name: 'delay and force complex',
    code: 'let take = fun n s ->\n' +
          '  match n with\n' +
          '    0 -> nil\n' +
          '  | _ -> match s with\n' +
          '           first::rest -> first::take (n - 1) (force rest) in\n' +
          'let ones = 1::delay ones in\n' +
          '  take 5 ones',
    expected:  ['cons', 1, ['cons', 1, ['cons', 1, ['cons', 1, ['cons', 1, null]]]]]
  },
  {
    name: 'scarry',
  code: 'let head = fun s ->\n'
      + '  match s with\n'
      + '    x::_ -> x\n'
      + 'in\n'
      + '\n'
      + 'let tail = fun s ->\n'
      + '  match s with\n'
      + '    _::dxs -> force dxs    \n'
      + 'in\n'
      + '\n'
      + 'let take = fun n s ->\n'
      + '  match n with\n'
      + '    0 -> null\n'
      + '  | _ -> (head s)::take (n - 1) (tail s)\n'
      + 'in\n'
      + '\n'
      + 'let ones = 1::delay ones\n'
      + 'in\n'
      + '\n'
      + 'let sum = fun s1 s2 ->\n'
      + '  (head s1) + (head s2)::delay (sum (tail s1) (tail s2))\n'
      + 'in\n'
      + '\n'
      + 'let fib = 1::delay (1::delay (sum fib (tail fib)))\n'
      + 'in\n'
      + '\n'
      + 'let filterMultiples = fun n s ->\n'
      + '  if head s % n = 0\n'
      + '  then filterMultiples n (tail s)\n'
      + '  else (head s)::delay (filterMultiples n (tail s))\n'
      + 'in\n'
      + '\n'
      + 'let sieve = fun s ->\n'
      + '  (head s)::delay (sieve (filterMultiples (head s) (tail s))) \n'
      + 'in\n'
      + '\n'
      + 'let intsFrom = fun n -> n::delay (intsFrom (n + 1))\n'
      + 'in\n'
      + '\n'
      + 'let primes = sieve (intsFrom 2)\n'
      + 'in\n'
      + '\n'
      + 'let first = fun p s ->\n'
      + '  if p (head s)\n'
      + '  then head s\n'
      + '  else first p (tail s)\n'
      + 'in\n'
      + 'first (fun x -> x > 1002) primes',
    expected: 1009
  }
);
