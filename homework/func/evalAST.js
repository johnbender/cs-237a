F.evalAST = function(ast) {
  var visitor, astObj, result;

  astObj = new window.Impl.Ast.create(ast);
  visitor = new window.Impl.Visitor();

  result = astObj.accept(visitor);

  return (result && typeof result === "object") ? result.original : result;
};

(function() {
  var Ast = {};

  function initCap(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function extend(l, r){
    for(prop in r){
      if( r.hasOwnProperty(prop) ){
        l[prop] = r[prop];
      }
    }

    return l;
  }

  // "factory" for the ast nodes
  Ast.create = function(ast) {
    var wrapped;

    if( ast === null || ast.constructor !== Array ){
      return new Ast.Leaf(ast);
    }

    return new Ast.Node(ast);
  };

  Ast.wrapAll = function(nodes) {
    var constructor = this.constructor;

    return nodes.map(function(node) {
      return new Ast.create(node);
    });
  };

  // leaf nodes in the ast
  Ast.Leaf = function(value) {
    this.original = value;
  };

  Ast.Leaf.prototype.accept = function(){
    return this.original;
  };

  // interior nodes in the AST
  Ast.Node = function(ast){
    // mem bloat
    this.original = ast;

    this.node = Ast.wrapAll(ast);

    // we expect the first node to be a leaf/string
    this.nodeType = this.original[0];

    // set the method that the visitor will use on accept
    this.visitMethod = "visit" + initCap(this.nodeType);
  };

  Ast.Node.prototype.accept = function(visitor){
    // if the visitor supports the derived visit method call it
    if( visitor[this.visitMethod] ){
      // prepend the accept method args to the node sub-expressions
      var args = Array.prototype.slice.call(arguments, 1).concat(this.node.slice(1));

      return visitor[this.visitMethod].apply(visitor, args);
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
  function Env(extension, parent){
    this.parent = parent;
    this.extension = extension || {};
  };

  extend(Env.prototype, {
    lookup: function(key) {
      if( this.extension.hasOwnProperty(key) ) {
        return this.extension[key];
      }

      if( ! this.parent ) {
        throw new Error("The identifier `" + key + "` is undefined" );
      }

      return this.parent.lookup(key);
    },

    top: function() {
      var next = this;

      while(! next.top ) {
        next = next.parent;
      }

      return next;
    },

    append:function(env) {
      env.top().parent = this;
      return env;
    },

    clone: function() {
      var extension = {}, parent;

      for(prop in this.extension) {
        extension[prop] = this.extension[prop];
      }

      if( this.parent ){
        parent = this.parent.clone();
      }

      return new this.constructor(extension, parent);
    }
  });



  function Visitor() {
    this.env = new Env();
  };

  // TODO this all sucks
  Visitor.checkType = function(typeName, fn) {
    return function(e1, e2) {
      var l, r;
      l = this.checkType(e1, typeName);
      r = this.checkType(e2, typeName);

      return fn(l, r);
    };
  };

  // all visit methods
  extend(Visitor.prototype, {

    scope: function(update, callback) {
      // add a new extension to the environment
      var restore = this.env;

      // extend the current environment
      this.env = this.env.append(update);

      // invoke the callback with the updated env
      callback.call(this);

      // restore the previous env
      this.env = restore;
    },

    checkType: function(e, typeName) {
      var v = e.accept(this);

      if( typeof v !== typeName ){
        throw new Error( "expression should be of type: " + typeName );
      }

      return v;
    },

    'visit*': Visitor.checkType("number", function(l, r){
      return l * r;
    }),

    'visit/': Visitor.checkType("number", function(l, r){
      return l / r;
    }),

    'visit-': Visitor.checkType("number", function(l, r){
      return l - r;
    }),

    'visit+': Visitor.checkType("number", function(l, r){
      return l + r;
    }),

    'visit<': Visitor.checkType("number", function(l, r){
      return l < r;
    }),

    'visit>': Visitor.checkType("number", function(l, r){
      return l > r;
    }),

    'visit%': Visitor.checkType("number", function(l, r){
      return l % r;
    }),

    'visit=': function(e1, e2) {
      return e1.accept(this) === e2.accept(this);
    },

    'visit!=': function(e1, e2) {
      return e1.accept(this) !== e2.accept(this);
    },

    visitOr: Visitor.checkType("boolean", function(l, r){
      return l || r;
    }),

    visitAnd: Visitor.checkType("boolean", function(l, r){
      return l && r;
    }),

    visitIf : function(e1, e2, e3) {
      var b = this.checkType(e1, "boolean");

      if(b) {
        return e2.accept(this);
      } else {
        return e3.accept(this);
      }
    },

    visitId : function(id) {
      // get the id (should be a Leaf) and get the value of
      // the expression bound to it since these semantics are lazy
      var result = this.env.lookup(id.accept(this));

      return result;
    },

    visitCall : function(e1) {
      var self = this, args, closure;

      args = Array.prototype.slice.call(arguments, 1);

      // strict argument eval
      args = args.map(function(a) {
        return a.accept(self);
      });

      // eval the fun or id to get the closure
      closure = e1.accept(this);

      return closure.accept(this, args);
    },

    visitFun : function(params, e) {
      var freeVars = this.env;

      return Ast.create([
        'closure',
        params.original,
        e.original,
        this.env
      ]);
    },

    visitClosure: function(args, params, e1, env) {
      var envUpdate, argsEnv, closureEnv, result, self;

      self = this;
      envUpdate = {};

      // TODO sort out the "arrayness" of the params nodes
      if( args.length != params.node.length ){
        throw new Error(
          "Function call expected "
            + params.node.length
            + " params but got "
            + args.length
        );
      }

      // create an extension for the current environment with the args
      // TODO sort out the "arrayness" of the params nodes
      params.node.forEach(function(p, i) {
        envUpdate[p.accept(self)] = args[i];
      });

      // create new environment from the closure reference
      closureEnv = env.accept(this).clone();

      // new environment with the function arguments
      argsEnv = new Env(envUpdate);

      // params should go on the current env *after* the copied env from
      // when the fun was created so that the params have precedence
      // closed-over env and params should also be poped after the function
      // exits since inner funs should carry a ref on creation
      this.scope(closureEnv, function() {
        this.scope(argsEnv, function() {
          result = e1.accept(self);
        });
      });

      return result;
    },

    // TODO can be done using call but constructing nodes
    visitLet : function(id, e1, e2) {
      var idString, result, letEnv, envUpdate = {}, self = this;

      idString = id.accept(this);
      envUpdate = {};

      envUpdate[idString] = e1.accept(this);

      letEnv = new Env(envUpdate);

      this.scope(letEnv, function() {
        result = e2.accept(this);
      });

      return result;
    }
  });

  window.Impl = {
    Ast: Ast,
    Env: Env,
    Visitor: Visitor
  };
})();
