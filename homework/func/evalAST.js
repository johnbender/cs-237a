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
  this.nodeType = ast[0].accept(this);

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


// environment tracking
Impl.Env = function(extension, parent){
  this.parent = parent;
  this.extension = extension || {};
};

Impl.Env.prototype.lookup = function(key) {
  if( this.extension.hasOwnProperty(key) ) {
    return this.extension[key];
  }

  if( ! this.parent ) {
    throw new Error("The identifier `" + key + "` is undefined" );
  }

  return this.parent.lookup(key);
};


Impl.FuncVisitor = function(){
  this.env = new Impl.Env();
};

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

Impl.FuncVisitor.prototype.visitOr = function(e1, e2){
  return e1.accept(this) || e2.accept(this);
};

// TODO consider the impact of eager eval
Impl.FuncVisitor.prototype.visitIf = function(e1, e2, e3) {
  if( e1.accept(this) ){
    return e2.accept(this);
  } else {
    return e3.accept(this);
  }
};

Impl.FuncVisitor.prototype.visitId = function(id) {
  // get the id (should be a Leaf) and get the value of
  // the expression bound to it since these semantics are lazy
  return this.env.lookup(id.accept(this)).accept(this);
};

Impl.FuncVisitor.prototype.visitCall = function(e1) {
  var args = Array.prototype.slice.call(arguments, 1);

  return e1.accept(this).apply(this, args);
};

Impl.FuncVisitor.prototype.visitFun = function(params, e1) {
  return function() {
    var envUpdate, ags, result, self;

    self = this;
    envUpdate = {};
    args = Array.prototype.slice.call(arguments);

    // TODO define forEach on ast node
    params.node.forEach(function(p, i) {
      envUpdate[p.accept(self)] = args[i];
    });

    this.scope(envUpdate, function() {
      result = e1.accept(self);
    });

    return result;
  };
};

Impl.FuncVisitor.prototype.scope = function(update, callback) {
  // add a new extension to the environment
  this.env = new Impl.Env(update, this.env);

  // invoke the callback with the updated env
  callback.call(this);

  // restore the previous env
  this.env = this.env.parent;
};
