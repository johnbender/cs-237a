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
  throw new Error(
    "no visit method defined for node type, `"
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

Impl.Env.prototype.top = function() {
  var next = this;

  while(next.parent) {
    next = next.parent;
  }

  return next;
};

Impl.Env.prototype.append = function(env) {
  env.top().parent = this;
  return env;
};

Impl.Env.prototype.clone = function() {
  var extension = {}, parent;

  for(prop in this.extension) {
    extension[prop] = this.extension[prop];
  }

  if( this.parent ){
    parent = this.parent.clone();
  }

  return new this.constructor(extension, parent);
};


Impl.FuncVisitor = function(){
  this.env = new Impl.Env();
};

Impl.FuncVisitor.prototype.scope = function(update, callback) {
  // add a new extension to the environment
  var restore = this.env;

  // extend the current environment
  this.env = this.env.append(update);

  // invoke the callback with the updated env
  callback.call(this);

  // restore the previous env
  this.env = restore;
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
  var freeVars = this.env;

  return function() {
    var envUpdate, argsEnv, args, result, self;

    self = this;
    envUpdate = {};
    args = Array.prototype.slice.call(arguments);

    // TODO sort out the "arrayness" of the params nodes
    if( args.length != params.node.length ){
      throw new Error(
        "Function call expected "
          + params.length
          + " params but got "
          + args.length
      );
    }

    // push the params onto the env
    // TODO sort out the "arrayness" of the params nodes
    params.node.forEach(function(p, i) {
      envUpdate[p.accept(self)] = args[i];
    });

    // new environment with the function arguments
    argsEnv = new Impl.Env(envUpdate);

    // params should go on the current env *after* the copied env from
    // when the fun was created so that the params have precedence
    // closed-over env and params should also be poped after the function
    // exits since inner funs should carry a ref on creation
    this.scope(freeVars.clone(), function() {
      this.scope(argsEnv, function() {
        result = e1.accept(self);
      });
    });

    return result;
  };
};

// TODO can be done using call but constructing nodes
Impl.FuncVisitor.prototype.visitLet = function(id, e1, e2) {
  var idString, result, letEnv, envUpdate = {}, self = this;

  idString = id.accept(this);
  envUpdate = {};

  envUpdate[idString] = e1;

  letEnv = new Impl.Env(envUpdate);

  this.scope(letEnv, function() {
    result = e2.accept(this);
  });

  return result;
};
