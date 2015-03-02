// Initialize the class table!

OO.initializeCT();

// Tests for Part II

tests(O,
  {
    name: 'arithmetic',
    code: '1 + 2 * 3',
    expected: 7
  },
  {
    name: 'var decls + access',
    code: 'var x = 1, y = 2;\n' +
          'x * 10 + y',
    expected: 12
  },
  {
    name: 'var decl + assignment',
    code: 'var x = 1;\n' +
          'x = 2;\n' +
          'x * 3',
    expected: 6
  },
  {
    name: 'method decl, just send',
    code: 'def Number.m() { return 42; }\n' +
          '3.m()',
    expected: 42
  },

  {
    name: 'method decl, new, and send',
    code: 'def Object.m() { return 42; }\n' +
          'new Object().m()',
    expected: 42
  },
  {
    name: 'method decl (with args), new, and send',
    code: 'def Object.m(x, y) { return x + y; }\n' +
          'new Object().m(1, 2)',
    expected: 3
  },
  {
    name: 'class decl + method decl + inst var ops + new',
    code: 'class RefCell with value;\n' +
          'def RefCell.initialize(value) { this.value = value; }\n' +
          'def RefCell.get() = this.value;\n' +
          'new RefCell(3).get()',
    expected: 3
  },
  {
    name: 'class decl + method decls + super send (1/2)',
    code: 'class C;\n' +
          'def Object.foo() = 1;\n' +
          'def C.foo() = super.foo() + 41;\n' +
          'new C().foo()',
    expected: 42
  },
  {
    name: 'method decls + super send (2/2)',
    code: 'def Boolean.foo() = 1;\n' +
          'def True.foo() = super.foo() + 41;\n' +
          'true.foo()',
    expected: 42
  },
  {
    name: 'augment null, send foo',
    code: 'def Null.foo() = 1;\n' + 'null.foo()',
    expected: 1
  },
  {
    name: 'method decls + super send third',
    code: 'class Point with x, y;\n' +
      'def Point.initialize(x, y) { super.initialize(); this.x = x; this.y = y; }\n' +
      'class ThreeDeePoint extends Point with z;\n' +
      'def ThreeDeePoint.initialize(x, y, z) { super.initialize(x, y); this.z = z; }\n' +
      'def ThreeDeePoint.m() = this.x * 100 + this.y * 10 + this.z;\n' +
      'new ThreeDeePoint(1, 2, 3).m()',
    expected: 123
  },
      /* by David Torosyan */
      {
        name: 'implicit return (1/2)',
        code: '{ var x = 1; x + 2; var y = 2;}.call()\n',
        expected: null
      },
      {
        name: 'implicit return (2/2)',
        code: 'class RefCell with value;\n' +
          'def RefCell.initialize(value) { this.value = value; }\n' +
          'def RefCell.get() = this.value;\n' +
          'def RefCell.set(value) { \n' +
          '    {\n' +
          '        null;\n' +
          '        this.value = value;\n' +
          '    }.call()\n' +
          '}\n' +
          'var r = new RefCell(1);\n' +
          'r.set(2);\n' +
          'r.get();\n',
        expected: 2
      },
      {
        name: 'null return block',
        code: '{}.call()\n',
        expected: null
      },
      {
        name: 'null return method',
        code: 'def Object.foo() {\n' +
          '1;\n' +
          '}\n' +
          '\n' +
          'new Object().foo()\n',
        expected: null
      },
      {
        name: 'ans',
        code: '1;\n' +
          'def Object.m() {\n' +
          '}\n',
        expected: 1
      },
      {
        name: 'recursive non-local return',
        code: 'def True then tb else fb = tb.call();\n' +
          'def False then tb else fb = fb.call();\n' +
          '\n' +
          'def Object.foo(first) {\n' +
          '  first\n' +
          '    then { this.bar(); }\n' +
          '    else { \n' +
          '      var b =  {return 5;}; \n' +
          '      return b;\n' +
          '    }\n' +
          '}\n' +
          '\n' +
          'def Object.bar() {\n' +
          '  this.foo(false).call();\n' +
          '}\n' +
          '\n' +
          'new Object().foo(true)\n',
        shouldThrow: true
      },
      {
        name: 'floating return',
        code: '{return 1;}\n',
        shouldThrow: true
      },
      {
        name: 'while loop',
        code: 'def True then tb else fb = tb.call();\n' +
          'def False then tb else fb = fb.call();\n' +
          'def Block while body = this.call() then {body.call(); this while body; } else {};\n' +
          '\n' +
          'var i = 0;\n' +
          'var sum = 0;\n' +
          '{i < 10} while {\n' +
          '    i = i + 1;\n' +
          '    sum = sum + i;\n' +
          ' };\n' +
          ' \n' +
          ' sum;\n',
        expected: 55
      },
      {
        name: 'do while loop',
        code: 'def True then tb else fb = tb.call();\n' +
          'def False then tb else fb = fb.call();\n' +
          'def Block while body = this.call() then {body.call(); this while body; } else {};\n' +
          'def Block doWhile cond {\n' +
          '    this.call();\n' +
          '    cond.call() then {this doWhile cond;} else {};\n' +
          '}\n' +
          '\n' +
          'var i = 0;\n' +
          'var sum = 0;\n' +
          '{\n' +
          '    i = i + 1;\n' +
          '    sum = sum + i;\n' +
          ' } doWhile {i < 10};\n' +
          ' \n' +
          ' sum;\n',
        expected: 55
      },
      {
        name: 'for loop',
        code: 'def True then tb else fb = tb.call();\n' +
          'def False then tb else fb = fb.call();\n' +
          'def Number to n do body = this <= n then {body.call(this); this+1 to n do body} else {};\n' +
          '\n' +
          'var sum = 0;\n' +
          '0 to 10 do {\n' +
          '    i | sum = sum + i;\n' +
          ' };\n' +
          ' \n' +
          ' sum;\n',
        expected: 55
      },
      {
        name: 'multi-arg blocks',
        code: 'false',
        expected: true
      }
);
