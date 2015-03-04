// Initialize the class table!

OO.initializeCT();

// Tests for Part II

tests(O,
  {
    name: 'thenElse (1/2)',
    code: 'def True then tb else fb = tb.call();\n' +
          'def False then tb else fb = fb.call();\n' +
          '1 > 2 then {111} else {222}',
    expected: 222
  },
  {
    name: 'thenElse (2/2)',
    code: 'def True then tb else fb = tb.call();\n' +
          'def False then tb else fb = fb.call();\n' +
          '1 < 2 then {111} else {222}',
    expected: 111
  },
  {
    name: 'non-local return first',
    code: 'def True then tb else fb = tb.call();\n' +
          'def False then tb else fb = fb.call();\n\n' +
          'def Number.fact() {\n' +
          '  this === 0 then {\n' +
          '    return 1;\n' +
          '  } else {\n' +
          '    return this * (this - 1).fact();\n' +
          '  }\n' +
          '}\n\n' +
          '5.fact()',
    expected: 120
  },
  {
    name: 'non-local return second',
    code: 'def Object.m() {\n' +
          '  var b = { return 5; };\n' +
          ' return this.n(b) * 2;\n' +
          '}\n\n' +
          'def Object.n(aBlock) {\n' +
          '  aBlock.call();\n' +
          '  return 42;\n' +
          '}\n\n' +
          'new Object().m()',
    expected: 5
  },

  {
    name: 'multi-arg block 1',
    code: '{ x, y | x * y }.call(6, 7)',
    expected: 42
  },

  {
    name: 'multi-arg block 2',
    code: 'def Object.blam() { return 5; } \n' +
      'def Object.blim() { return 6; }\n' +
      '{ x | x.blam(); x.blim(); }.call(new Object())',
    expected: 6
  },

  {
    name: 'inst new class',
    code: 'var x = new Class("Baz", "Object"); \n'
      + 'x.define("biz", { 5 }); \n'
      + 'x.inst().biz();',
    expected: 5
  },

  {
    name: 'class decl + method decls + this',
    code: 'var aclass = new Class("A", "Object");\n' +
      'aclass.define("foo", { this === 1 });\n' +
      'aclass.inst().foo()',
    expected: false
  },

  {
    name: 'class decl + method decls + super send + class obj',
    code: 'var aclass = new Class("A", "Object");\n' +
      'var bclass = new Class("B", "A"); \n' +
      'aclass.define("foo", { 1 });\n' +
      'bclass.define("foo", { super.foo() + 41 });\n' +
      'bclass.inst().foo()',
    expected: 42
  },
  {
    name: 'class decl + ivars + this',
    code: 'var aclass = new Class("C", "Object", "prop");\n' +
      'aclass.define("initialize", { prop | this.prop = prop; });\n' +
      'aclass.define("foo", { this.prop });\n' +
      'aclass.inst(1).foo()',
    expected: 1
  },
  {
    name: 'class decl internal define',
    code: 'var aclass = new Class("D", "Object", "prop");\n' +
      'var bclass = new Class("E", "Object"); \n' +
      'aclass.define("initialize", { prop | \n' +
      '  this.prop = prop; \n' +
      '});\n' +

      'bclass.define("deffora", { \n' +
      '  aclass.define("bar", { this.prop });\n' +
      '});\n' +
      'bclass.inst().deffora(); aclass.inst(1).bar()',
    expected: 1
  },
  {
    name: 'azucar',
    code: 'var aclass = new Class("A", "Object");\n' +
      'aclass defines "foo" as { \n' +
      '  this === 1\n' +
      '}; \n' +
      'aclass.inst().foo();',
    expected: false
  }
);
