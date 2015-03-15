O.prettyPrintAST = function(node) {
  var ctxt = new IndentingOutputStream();
  ctxt.prettyPrint = prettyPrint;
  ctxt.prettyPrintList = prettyPrintList;
  ctxt.prettyPrint(node);
  return ctxt.contents();
};

function prettyPrint(node) {
  if (node === undefined) {
    this.write("undefined");
  } else if (typeof node !== 'object' ||
      node === null ||
      node instanceof Number ||
      node instanceof String ||
      node instanceof Boolean) {
    this.write(JSON.stringify(node));
  } else if (node instanceof Array) {
    if (prettyPrints[node[0]]) {
      prettyPrints[node[0]].apply(this, node.slice(1));
    } else {
      this.prettyPrintList(node);
    }
  } else {
    this.write('???');
  }
}

function prettyPrintList(xs) {
  this.write("[");
  for (var idx = 0; idx < xs.length; idx++) {
    if (idx > 0) {
      this.write(", ");
    }
    this.prettyPrint(xs[idx]);
  }
  this.write("]");
}

function genericPrettyPrintFor(tagName, numPartsToPrintOnSameLine) {
  return function(/* part1, part2, ... */) {
    this.indentFromHere();
    this.write('["' + tagName + '"');
    for (var idx = 0; idx < numPartsToPrintOnSameLine; idx++) {
      this.write(", ");
      this.prettyPrint(arguments[idx]);
    }
    for (var idx = numPartsToPrintOnSameLine; idx < arguments.length; idx++) {
      this.write(",");
      this.nl();
      this.prettyPrint(arguments[idx]);
    }
    this.write("]");
    this.dedent();
  };
};

var prettyPrints = {};

prettyPrints.program = genericPrettyPrintFor('program', 0);
prettyPrints.block = genericPrettyPrintFor('block', 0);
prettyPrints.send = genericPrettyPrintFor('send', 0);

prettyPrints["new"] = genericPrettyPrintFor('new', 1);
prettyPrints.instVarAssign = genericPrettyPrintFor('instVarAssign', 1);
prettyPrints.varAssign = genericPrettyPrintFor('varAssign', 1);

prettyPrints.varDecls = function(/* decl1, decl2, ... */) {
  this.indentFromHere();
  this.write('["varDecls"');
  for (var idx = 0; idx < arguments.length; idx++) {
    this.write(",");
    this.nl();
    this.prettyPrintList(arguments[idx]);
  }
  this.write("]");
  this.dedent();
};

prettyPrints.methodDecl = function(className, methodName, args, body) {
  this.indentFromHere();
  this.write('["methodDecl", ');
  this.prettyPrint(className);
  this.write(", ");
  this.prettyPrint(methodName);
  this.write(", ");
  this.prettyPrintList(args);
  this.write(", [");
  for (var idx = 0; idx < body.length; idx++) {
    if (idx > 0) {
      this.write(",");
    }
    this.nl();
    this.prettyPrint(body[idx]);
  }
  this.write("]]");
  this.dedent();
};

