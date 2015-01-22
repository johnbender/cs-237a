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

    // empty args list
    if(ast.length == 0){
      return;
    }

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
    get: function(key) {
      if( this.extension.hasOwnProperty(key) ) {
        return this.extension[key];
      }

      if( ! this.parent ) {
        throw new Error("The identifier `" + key + "` is undefined" );
      }

      return this.parent.get(key);
    },

    set: function(key, value) {
      if( this.extension.hasOwnProperty(key) ){
        return this.extension[key] = value;
      }

      if( ! this.parent ){
        return;
      }

      return this.parent.set(key, value);
    },

    add: function(key, value) {
      return this.extension[key] = value;
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

    scopedVisit: function(opts) { //update, parent, callback) {
      // add a new extension to the environment
      var parent, restore, result;

      restore = this.env;

      // extend the current environment
      this.env = opts.parent.append(new opts.parent.constructor(opts.update));

      // invoke the callback with the updated env
      result = opts.expression.accept(this);

      // restore the previous env
      this.env = restore;

      return result;
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
      if( r == 0 ) {
        throw new Error( "attempted to divide " + l + " by zero" );
      }

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
      var result = this.env.get(id.accept(this));

      return result;
    },

    visitCons: function(e1, e2) {
      var rest = e2.accept(this);

      // TODO ugh
      rest = (rest && rest.original) || rest;

      return Ast.create([
        "cons",
        e1.accept(this),
        rest
      ]);
    },

    visitSeq: function(e1, e2) {
      e1.accept(this);
      return e2.accept(this);
    },

    visitSet: function(e1, e2) {
      var id, value, set;

      id = e1.accept(this);
      value = e2.accept(this);

      set = this.env.set(id, value);

      return set ? set : this.env.add(id, value);
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

      if( closure.nodeType !== "closure" ){
        throw new Error("Cannot call `" + closure + "` with `" + args + "`");
      }

      return closure.accept(this, args);
    },

    visitFun : function(params, e, env) {
      // NOTE we rely on the fact that the object ref to
      // this.env will show updates when that becomes relevant
      return Ast.create([
        'closure',
        params.original ? params.original : params,
        e.original,
        env ? this.env.append(env) : this.env
      ]);
    },

    visitClosure: function(args, params, e1, env) {
      var envUpdate, closureEnv, result, last, paramIds;

      envUpdate = {};
      paramIds = params.original;

      // curry
      if( args.length < params.node.length ){
        // create an extension for the current environment with the args
        args.map(function(a, i) {
          envUpdate[paramIds[i]] = a;
          last = i + 1;
        });

        return this.visitFun(paramIds.slice(last), e1, new Env(envUpdate));
      }

      // too many args
      if( args.length > params.node.length ){
        throw new Error(
          "Function call expected "
            + params.node.length
            + " params but got "
            + args.length
        );
      }

      args.map(function(a, i) {
        envUpdate[paramIds[i]] = a;
      });

      // create new environment from the closure reference
      closureEnv = env.accept(this);

      // params should go on the current env *after* the copied env from
      // when the fun was created so that the params have precedence
      // closed-over env and params should also be poped after the function
      // exits since inner funs should carry a ref on creation
      result = this.scopedVisit({
        update: envUpdate,
        parent: closureEnv,
        expression: e1
      });

      return result;
    },

    // TODO can be done using call but constructing nodes
    visitLet : function(id, e1, e2) {
      var idString, result, letEnv, envUpdate;

      idString = id.accept(this);
      envUpdate = {};

      // store the expression itself for the identifier
      envUpdate[idString] = e1;

      // execute the assigned expression using e1 with for the id
      envUpdate[idString] = this.scopedVisit({
        update: envUpdate,
        parent: this.env,
        expression: e1
      });

      // run the body of the let as normal
      result = this.scopedVisit({
        update: envUpdate,
        parent: this.env,
        expression: e2
      });

      return result;
    },

    consFromList: function(list) {
      var result = null;

      list.reverse().forEach(function(e){
        result = ['cons', e, result];
      });

      return result;
    },

    check: function(pred, env) {
      return this.scopedVisit({
        update: env,
        parent: this.env,
        expression: pred
      });
    },

    visitListComp: function(e1, v, gen, pred) {
      var genVal, envUpdate, results;

      genVal = gen.accept(this);
      envUpdate = {};
      results = [];

      if( genVal.nodeType !== 'cons' ){
        throw new Error( "the generator expression must be a cons list" );
      }

      while(genVal !== null ){
        envUpdate[v.accept(this)] = genVal.node[1].accept(this);

        // if there are predicates one of them fails skip
        if( !pred || this.check(pred, envUpdate) ){
          results.push(this.scopedVisit({
            update: envUpdate,
            parent: this.env,
            expression: e1
          }));
        }

        genVal = genVal.node[2].accept(this);
      }

      return Ast.create(this.consFromList(results));
    }
  });

  window.Impl = {
    Ast: Ast,
    Env: Env,
    Visitor: Visitor
  };
})();
