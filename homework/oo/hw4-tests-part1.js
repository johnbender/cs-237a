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
    name: 'method declaration and send',
    code: '// def Object.add(x, y) { return x + y; }\n' +
          'OO.declareMethod("Object", "add", function(_this, x, y) { return x + y; });\n\n' +
          '// new Object().add(3, 4)\n' +
          'OO.send(OO.instantiate("Object"), "add", 3, 4);',
    expected: 7
  },
  {
    name: 'Point',
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
    name: 'OK to have a method and an instance variable with the same name',
    code: '// class C { var value; }\n' +
          'OO.declareClass("C", "Object", ["value"]);\n\n' +
          '// def C.initialize(value) { this.value = value; }\n' +
          'OO.declareMethod("C", "initialize", function(_this, value) {\n' +
          '  OO.setInstVar(_this, "value", value);\n' +
          '});\n\n' +
          '// def C.value() { return this.value * this.value; }\n' +
          'OO.declareMethod("C", "value", function(_this) {\n' +
          '  return OO.getInstVar(_this, "value") * OO.getInstVar(_this, "value");\n' +
          '});\n\n' +
          '// new C(5).value()\n' +
          'OO.send(OO.instantiate("C", 5), "value");',
    expected: 25
  }
);

