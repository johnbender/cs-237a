// Initialize the class table to start fresh!

OO.initializeCT();

// Tests for Part II

tests(
  {
    name: 'times',
    code: '// 6 * 7\n' +
          'OO.send(6, "*", 7);',
    expected: 42
  },
  {
    name: 'a number is a Number',
    code: '// 123.isNumber()\n' +
          'OO.send(123, "isNumber");',
    expected: true
  },
  {
    name: 'an Object is not a Number',
    code: '// new Object().isNumber()\n' +
          'OO.send(OO.instantiate("Object"), "isNumber");',
    expected: false
  },
  {
    name: 'Point, sending messages to Numbers',
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
          '    OO.send(OO.getInstVar(_this, "x"), "+", OO.getInstVar(that, "x")),\n' +
          '    OO.send(OO.getInstVar(_this, "y"), "+", OO.getInstVar(that, "y"))\n' +
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
    name: 'ThreeDeePoint, sending messages to Numbers',
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
          '    OO.send(OO.getInstVar(_this, "x"), "+", OO.getInstVar(that, "x")),\n' +
          '    OO.send(OO.getInstVar(_this, "y"), "+", OO.getInstVar(that, "y")),\n' +
          '    OO.send(OO.getInstVar(_this, "z"), "+", OO.getInstVar(that, "z"))\n' +
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
    name: 'factorial',
    code: '// def Number.factorial {\n' +
          '//   if (this === 0) {\n' +
          '//     return 1;\n' +
          '//   } else {\n' +
          '//     return this * (this - 1).factorial();\n' +
          '//   }\n' +
          '// }\n' +
          'OO.declareMethod("Number", "factorial", function(_this) {\n' +
          '  if (OO.send(_this, "===", 0)) {\n' +
          '    return 1;\n' +
          '  } else {\n' +
          '    return OO.send(\n' +
          '      _this,\n' +
          '      "*",\n' +
          '      OO.send(\n' +
          '        OO.send(_this, "-", 1),\n' +
          '        "factorial"));\n' +
          '  }\n' +
          '});\n\n' +
          '// 5.factorial()\n' +
          'OO.send(5, "factorial");',
    expected: 120
  }
);

