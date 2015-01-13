C.prettyPrintAST =
C.prettyPrintValue = function(node) {
  var ctxt = Object.create(new IndentingOutputStream(), { visited: { value: [] } });
  _prettyPrint(node, ctxt);
  return ctxt.contents();
}

function _prettyPrint(node, ctxt) {
  if (node instanceof Array) {
    if (ctxt.visited.indexOf(node) >= 0) {
      ctxt.write('...');
    } else {
      ctxt.visited.push(node);
      var tag = node[0];
      _prettyPrint[tag].apply(ctxt, node.slice(1));
    }
  } else {
    ctxt.write(JSON.stringify(node));
  }
}

function prettyPrintBinop(op) {
  return function(x, y) {
    this.indentFromHere();
    this.write("['" + op + "',");
    this.nl();
    _prettyPrint(x, this);
    this.write(",");
    this.nl();
    _prettyPrint(y, this);
    this.write("]");
    this.dedent();
  };
}

_prettyPrint["+"] = prettyPrintBinop("+");
_prettyPrint["-"] = prettyPrintBinop("-");
_prettyPrint["*"] = prettyPrintBinop("*");
_prettyPrint["/"] = prettyPrintBinop("/");
_prettyPrint["^"] = prettyPrintBinop("^");

_prettyPrint.id = function(name) {
  this.write("['id', '" + name + "']");
};

_prettyPrint.set = function(name, value) {
  this.write("['set', '" + name + "', ");
  _prettyPrint(value, this);
  this.write("]");
};

_prettyPrint.seq = function(x, y) {
  this.indentFromHere();
  this.write("['seq',");
  this.nl();
  _prettyPrint(x, this);
  this.write(",");
  this.nl();
  _prettyPrint(y, this);
  this.write("]");
  this.dedent();
}

