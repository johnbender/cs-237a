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

tests(JS,
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
    name: 'primitive values should allow extension',
    code: 'false',
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
    name: 'get ivar fail',
    code: 'OO.getInstVar(OO.instantiate("Object"), "blaz");',
    shouldThrow: true
  },
  {
    name: 'get ivar succeed',
    code: 'OO.declareClass("GetIvar", "Object", ["foo"]);' +
      'var givar = OO.instantiate("GetIvar");' +
      'OO.setInstVar(givar, "foo", 3);'+
      'OO.getInstVar(givar, "foo");',
    expected: 3
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
    expected: true
  },
  {
    name: "walk the hierarchy, fail",
    code: 'OO.declareClass("whf", "Object", ["value"]);\n\n' +
      'OO.send(OO.instantiate("whf", 5), "bar", 4);',
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
  },
  {
    name: 'method declaration and send',
    code: '// def Object.add(x, y) { return x + y; }\n' +
      'OO.declareMethod("Object", "add", function(_this, x, y) { return x + y; });\n\n' +
      '// new Object().add(3, 4)\n' +
      'OO.send(OO.instantiate("Object"), "add", 3, 4);',
    expected: 7
  },
  /* Basic functionality testing */
  {
    name: 'Builtin Object === testing',
    code: 'var testObjectEq = OO.instantiate("C", 1);\n' +
      'OO.send(testObjectEq, "===", testObjectEq);',
    expected: true
  },
  {
    name: 'Builtin Object === testing',
    code: 'OO.send(OO.instantiate("C", 1), "===", OO.instantiate("C", 1));',
    expected: false
  },
  {
    name: 'Builtin Object !== testing',
    code: 'var testObjectEq = OO.instantiate("C", 1);\n' +
      'OO.send(testObjectEq, "!==", testObjectEq);',
    expected: false
  },
  {
    name: 'Builtin Object !== testing',
    code: 'OO.send(OO.instantiate("C", 1), "!==", OO.instantiate("C", 1));',
    expected: true
  },
  {
    name: 'Can declare a class, instantiate it.',
    code: 'OO.declareClass("Node", "Object", ["value", "next"]);\n' +
      'OO.declareMethod("Node", "initialize", function(_this, value, next) {\n' +
      '     OO.superSend("Object", _this, "initialize");\n' +
      '     OO.setInstVar(_this, "value", value);\n' +
      '     OO.setInstVar(_this, "next", next);\n' +
      '});\n\n' +
      'var testvarlist = OO.instantiate("Node", 0, null);\n' +
      '[OO.getInstVar(testvarlist, "value"), OO.getInstVar(testvarlist, "next")];',
    expected: [0,null]
  },
  {
    name: 'Can add and call a (recursive) method',
    code: 'OO.declareMethod("Node", "contains", function(_this, value) {\n' +
      '     if (OO.getInstVar(_this, "value") === value) return true;\n' +
      '     if (OO.getInstVar(_this, "next") === null) return false;\n' +
      '     return OO.send(OO.getInstVar(_this,"next"), "contains", value);' +
      '});\n\n' +
      'OO.send(OO.instantiate("Node", 0, OO.instantiate("Node", 1, null)),\n' +
      '     "contains", 1);',
    expected: true
  },
  {
    name: 'Can create, instantiate, get values of subclasses',
    code: 'OO.declareClass("DoublyLinked", "Node", ["previous"]);\n' +
      'OO.declareMethod("DoublyLinked", "initialize",\n' +
      '  function(_this, value, next, previous) {\n' +
      '     OO.superSend("Node", _this, "initialize", value, next);\n' +
      '     OO.setInstVar(_this, "previous", previous);\n' +
      '});\n\n' +
      'OO.getInstVar(OO.instantiate("DoublyLinked", 0, null, null), "value");',
    expected: 0
  },
  {
    name: 'Can access methods of superclasses',
    code: 'OO.send(OO.instantiate("DoublyLinked", 0, OO.instantiate("DoublyLinked", 1, null, null), null),\n' +
      '     "contains", 1);',
    expected: true
  },
  {
    name: 'Can access methods of superclasses using superSend',
    code: 'OO.superSend("Node", OO.instantiate("DoublyLinked", 0, OO.instantiate("DoublyLinked", 1, null, null), null),\n' +
      '     "contains", 1);',
    expected: true
  },
  {
    name: 'Can override methods of same class',
    code: 'OO.declareMethod("Node", "contains", function() {return 5;});\n' +
      'OO.send(OO.instantiate("Node", 0, null), "contains");',
    expected: 5
  },
  {
    name: 'Can override methods of super class',
    code: 'OO.declareMethod("DoublyLinked", "contains", function() {return 9;});\n' +
      'OO.send(OO.instantiate("DoublyLinked", 0, null), "contains");',
    expected: 9
  },
  /* Error testing */
  {
    name: 'Error to declare a duplicate class',
    code: 'OO.declareClass("C", "Object", ["value"]);',
    shouldThrow: true
  },
    /*{ // As per the followup down below, the spec doesn't actually require this case.
    name: 'Error to declare a class without a superclass',
    code: 'OO.declareClass("Er1", null, ["value"]);',
    shouldThrow: true
     }, */
  {
    name: 'Error to declare a class with a nonexistant superclass',
    code: 'OO.declareClass("Er2", "Nonexistant", ["value"]);',
    shouldThrow: true
  },
  {
    name: 'Error to declare a duplicate variable',
    code: 'OO.declareClass("Er3", "Object", ["value", "something", "value"]);',
    shouldThrow: true
  },
  {
    name: 'Error to declare a duplicate variable in subclass',
    code: 'OO.declareClass("Er4", "C", ["value"]);',
    shouldThrow: true
  },
  {
    name: 'Error to declare a method on a nonexistant class',
    code: 'OO.declareMethod("Nonexistant", "foo", function() { return 5; });',
    shouldThrow: true
  },
  {
    name: 'Error to instantiate a nonexistant class',
    code: 'OO.instantiate("Nonexistant");',
    shouldThrow: true
  },
  {
    name: 'Error to set nonexistant instance variable',
    code: 'OO.setInstVar(OO.instantiate("Object"), "value", 0);',
    shouldThrow: true
  },
  {
    name: 'Error to get nonexistant instance variable',
    code: 'OO.getInstVar(OO.instantiate("Object"), "value", 0);',
    shouldThrow: true
  },
  {
    name: 'Error to call nonexistant method',
    code: 'OO.send(OO.instantiate("Object"), "toString");',
    shouldThrow: true
  },
  {
    name: 'Error to call nonexistant method',
    code: 'OO.superSend("Object", OO.instantiate("C", 1), "toString");',
    shouldThrow: true
  }
);
