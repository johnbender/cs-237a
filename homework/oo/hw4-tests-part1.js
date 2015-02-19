// This function is used by the test harness to pretty-print values.
// Right now it doesn't handle undefined, functions, NaN, Number.POSITIVE_INFINITY, etc.
// Feel free to modify / extend it as you see fit.
// (FYI, pretty-printing is not used by our grading scripts.)

function prettyPrintValue(value) {
  return JSON.stringify(value);
}

// Initialize the class table!

OO.initializeCT();

// Tests for Part I

tests(
  {
    name: 'object equality',
    code: 'var foo = OO.instantiate("Object");\n' +
          'OO.send(foo, "===", foo);',
    expected: true
  },
  {
    name: 'object equality false',
    code: 'var foo = OO.instantiate("Object");' +
          'var bar = OO.instantiate("Object"); window.foo = foo; window.bar = bar;' +
          'OO.send(foo, "===", bar);',
    expected: false
  },
  {
    name: 'object inequality false',
    code: 'var foo = OO.instantiate("Object");\n' +
          'OO.send(foo, "!==", foo);',
    expected: false
  },
  {
    name: 'object inequality',
    code: 'var foo = OO.instantiate("Object");' +
          'var bar = OO.instantiate("Object");' +
          'OO.send(foo, "!==", bar);',
    expected: true
  },
  {
    name: 'object equality',
    code: 'OO.declareMethod("Object", "add", function(_this, x, y) { return x + y; });\n\n' +
          'var foo = OO.instantiate("Object");// new Object().add(3, 4)\n' +
          'OO.send(foo, "===", foo);',
    expected: true
  },
  {
    name: 'redeclare',
    code: 'OO.declareClass("Object");',
    shouldThrow: true
  },
  {
    name: 'declare name',
    code: 'OO.declareClass("Foo");' +
          'var foo = OO.instantiate("Foo");' +
          'foo._class',
    expected: "Foo"
  },
  {
    name: 'declare parent',
    code: 'OO.declareClass("Faz", "Object")._parent;',
    expected: "Object"
  },
  {
    name: 'declare parent undefined',
    code: 'OO.declareClass("Foo", "Bar");',
    shouldThrow: true
  },
  {
    name: 'declare parent dup ivars',
    code: 'OO.declareClass("Fiz", "Object", [ "x", "x" ] );',
    shouldThrow: true
  },
  {
    name: 'declare parent dup parent ivars',
    code: 'OO.declareClass("Fizz", "Object", [ "x" ] );' +
      'OO.declareClass("Fizzed", "Fizz", [ "x" ] );',
    shouldThrow: true
  },
  {
    name: 'declare parent no duped ivars',
    code: 'OO.declareClass("FizzGud", "Object", [ "x" ] );' +
      'OO.declareClass("FizzedGud", "Fizz", [ "y" ] ); "Good"',
    expected: "Good"
  },
  {
    name: 'instantiate undefined',
    code: 'OO.instantiate("not defined for sure");',
    shouldThrow: true
  },
  {
    name: 'override',
    code: 'OO.declareClass("Over");' +
      'OO.declareMethod("Over", "===", function(_this, other){ return 10 });' +
      'OO.send(OO.instantiate("Over"), "===", 3, 4);',
    expected: 10
  },
  {
    name: 'super send bad class',
    code: 'OO.superSend("NotDefined", 3, 4);',
    shouldThrow: true
  },
  {
    name: 'super send works',
    code: 'OO.declareClass("Super");' +
      'var sup = OO.instantiate("Super");' +
      'OO.superSend("Object", sup, "!==", 3);',
    expected: true
  },
  {
    name: 'method declaration and send',
    code: '// def Object.add(x, y) { return x + y; }\n' +
          'OO.declareMethod("Object", "add", function(_this, x, y) { return x + y; });\n\n' +
          '// new Object().add(3, 4)\n' +
          'OO.send(OO.instantiate("Object"), "add", 3, 4);',
    expected: 7
  },
  {
    name: 'message not understood',
    code: 'OO.send(OO.instantiate("Object"), "not going to exist", 3, 4);',
    shouldThrow: true
  },
  {
    name: 'set ivar',
    code: 'OO.setInstVar(OO.instantiate("Object"), "foo", 3);',
    shouldThrow: true
  },
  {
    name: 'normal Point',
    code: '// class Point { var x, y; }\n' +
          'OO.declareClass("Point", "Object", ["x", "y"]);\n\n' +
          '// def Point.initialize(x, y) {\n' +
          '//   super.initialize();\n' +
          '//   this.x = x;\n' +
          '//   this.y = y;\n' +
          '// }\n' +
          'OO.declareMethod("Point", "initialize", function(_this, x, y) {\n' +
          '  OO.superSend("Object", _this, "initialize");\n' +
          '  OO.setInstVar(_this, "x", x);\n' +
          '  OO.setInstVar(_this, "y", y);\n' +
          '});\n\n' +
          '// def Point + that {\n' +
          '//   return new Point(this.x + that.x, this.y + that.y);\n' +
          '// }\n' +
          'OO.declareMethod("Point", "+", function(_this, that) {\n' +
          '  return OO.instantiate(\n' +
          '    "Point",\n' +
          '    OO.getInstVar(_this, "x") + OO.getInstVar(that, "x"),\n' +
          '    OO.getInstVar(_this, "y") + OO.getInstVar(that, "y")\n' +
          '  );\n' +
          '});\n\n' +
          '// def Point.toString() {\n' +
          '//   return "Point(" + this.x + ", " + this.y + ")";\n' +
          '// }\n' +
          'OO.declareMethod("Point", "toString", function(_this) {\n' +
          '  return "Point(" + OO.getInstVar(_this, "x") + ", " + OO.getInstVar(_this, "y") + ")";\n' +
          '});\n\n' +
          '// var p = new Point(1, 2) + new Point(3, 4);\n' +
          '// p.toString()\n' +
          'var p = OO.send(OO.instantiate("Point", 1, 2), "+", OO.instantiate("Point", 3, 4));\n' +
          'OO.send(p, "toString");',
    expected: 'Point(4, 6)'
  },
  {
    name: 'ThreeDeePoint',
    code: '// class ThreeDeePoint { var z; }\n' +
          'OO.declareClass("ThreeDeePoint", "Point", ["z"]);\n\n' +
          '// def ThreeDeePoint.initialize(x, y, z) {\n' +
          '//   super.initialize(x, y);\n' +
          '//   this.z = z;\n' +
          '// }\n' +
          'OO.declareMethod("ThreeDeePoint", "initialize", function(_this, x, y, z) {\n' +
          '  OO.superSend("Point", _this, "initialize", x, y);\n' +
          '  OO.setInstVar(_this, "z", z);\n' +
          '});\n\n' +
          '// def ThreeDeePoint + that {\n' +
          '//   return new ThreeDeePoint(this.x + that.x, this.y + that.y, this.z + that.z);\n' +
          '// }\n' +
          'OO.declareMethod("ThreeDeePoint", "+", function(_this, that) {\n' +
          '  return OO.instantiate(\n' +
          '    "ThreeDeePoint",\n' +
          '    OO.getInstVar(_this, "x") + OO.getInstVar(that, "x"),\n' +
          '    OO.getInstVar(_this, "y") + OO.getInstVar(that, "y"),\n' +
          '    OO.getInstVar(_this, "z") + OO.getInstVar(that, "z")\n' +
          '  );\n' +
          '});\n\n' +
          '// def ThreeDeePoint.toString() {\n' +
          '//   return "ThreeDeePoint(" + this.x + ", " + this.y + ", " + this.z + ")";\n' +
          '// }\n' +
          'OO.declareMethod("ThreeDeePoint", "toString", function(_this) {\n' +
          '  return "ThreeDeePoint(" +\n' +
          '         OO.getInstVar(_this, "x") + ", " +\n' +
          '         OO.getInstVar(_this, "y") + ", " +\n' +
          '         OO.getInstVar(_this, "z") + ")";\n' +
          '});\n\n' +
          '// var p = new ThreeDeePoint(1, 2, 3) + new Point(4, 5, 6);\n' +
          '// p.toString()\n' +
          'var p = OO.send(OO.instantiate("ThreeDeePoint", 1, 2, 3), "+", OO.instantiate("ThreeDeePoint", 4, 5, 6));\n' +
          'OO.send(p, "toString");',
    expected: 'ThreeDeePoint(5, 7, 9)'
  },
  {
    name: "walk the hierarchy",
    code: 'OO.declareClass("C", "Object", ["value"]);\n\n' +
      'OO.send(OO.instantiate("C", 5), "!==", 4);',
    expected: false
  },
  {
    name: "walk the hierarchy, fail",
    code: 'OO.declareClass("C", "Object", ["value"]);\n\n' +
      'OO.send(OO.instantiate("C", 5), "bar", 4);',
    shouldThrow: true
  },
  {
    name: 'OK to have a method and an instance variable with the same name',
    code: 'OO.declareClass("D", "Object", ["value"]);\n\n' +
          'OO.declareMethod("D", "initialize", function(_this, value) {\n' +
          '  OO.setInstVar(_this, "value", value);\n' +
          '});\n\n' +
          'OO.declareMethod("D", "value", function(_this) {\n' +
          '  return OO.getInstVar(_this, "value") * OO.getInstVar(_this, "value");\n' +
          '});\n\n' +
          'OO.send(OO.instantiate("D", 5), "value");',
    expected: 25
  }
);
