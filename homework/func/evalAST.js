F.evalAST = function(ast) {
  var visitor, astObj;

  astObj = new Impl.Ast.create(ast);
  visitor = new Impl.FuncVisitor();

  return astObj.accept(visitor);
};

Impl = { Ast: {}};

function initCap(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// "factory" for the ast nodes
Impl.Ast.create = function(ast) {
  var wrapped;

  if( ast.constructor !== Array ){
    return new Impl.Ast.Leaf(ast);
  }

  wrapped = Impl.Ast.wrapAll(ast);
  return new Impl.Ast.Node(wrapped);
};

Impl.Ast.wrapAll = function(nodes) {
  var constructor = this.constructor;

  return nodes.map(function(node) {
    return new Impl.Ast.create(node);
  });
};

// leaf nodes in the ast
Impl.Ast.Leaf = function(value) {
  this.value = value;
};

Impl.Ast.Leaf.prototype.accept = function(){
  return this.value;
};


// interior nodes in the AST
Impl.Ast.Node = function(ast){
  this.node = ast;

  // we expect the first node to be a leaf/string
  this.nodeType = ast[0].value;

  // set the method that the visitor will use on accept
  this.visitMethod = "visit" + initCap(this.nodeType);
};

Impl.Ast.Node.prototype.accept = function(visitor){
  // if the visitor supports the derived visit method call it
  if( visitor[this.visitMethod] ){
    var arguments = this.node.slice(1);

    return visitor[this.visitMethod].apply(visitor, arguments);
  }

  // throw an exception for unsupported node types
  throw new Error("no visit method defined for node type, `"
    + this.nodeType
    + "`, expected: "
    + this.visitMethod
    + "`"
  );
};

Impl.FuncVisitor = function(){};

// TODO setup an extend method
Impl.FuncVisitor.prototype[ 'visit*' ] = function(e1, e2){
  return e1.accept(this) * e2.accept(this);
};

Impl.FuncVisitor.prototype[ 'visit/' ] = function(e1, e2){
  return e1.accept(this) / e2.accept(this);
};

Impl.FuncVisitor.prototype[ 'visit-' ] = function(e1, e2){
  return e1.accept(this) - e2.accept(this);
};

Impl.FuncVisitor.prototype[ 'visit+' ] = function(e1, e2){
  return e1.accept(this) + e2.accept(this);
};

Impl.FuncVisitor.prototype[ 'visit<' ] = function(e1, e2){
  return e1.accept(this) < e2.accept(this);
};

Impl.FuncVisitor.prototype[ 'visit>' ] = function(e1, e2){
  return e1.accept(this) > e2.accept(this);
};

Impl.FuncVisitor.prototype[ 'visit=' ] = function(e1, e2){
  return e1.accept(this) === e2.accept(this);
};

Impl.FuncVisitor.prototype[ 'visit!=' ] = function(e1, e2){
  return e1.accept(this) !== e2.accept(this);
};

Impl.FuncVisitor.prototype[ 'visitOr' ] = function(e1, e2){
  return e1.accept(this) || e2.accept(this);
};
