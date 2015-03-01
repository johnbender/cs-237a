window.OO = {};

// TODO all the table[_] refs can be replaced by referencing the object itself
(function( ns, O ) {
  var table = {};

  function Class( config ) {
    this._ivars = config.ivars || [];

    // object
    this._methods = config.methods || {};

    // name for instance ref
    this._name = config.name;

    // parent for traversal
    this._parent = config.parent || "Object";
  }

  Class.prototype.parent = function() {
    return table[this._parent];
  };

  Class.prototype.def = function(selector, fn) {
    this._methods[selector] = fn;
  };

  Class.prototype.send = function(instance, name, args, cls) {
    var parent;

    cls = cls ? table[cls] : getClass(instance);

    // this class doesn't implement the requested methods
    if( ! this._methods.hasOwnProperty(name) ) {

      // if we're not at the top of the hierarchy go up
      // otherwise vomit
      if( cls._name !== "Object" ){
        parent = cls.parent();
        return parent.send(instance, name, args, parent._name);
      } else {
        throw new Error("Message not understood");
      }
    }

    // add the instance to the args
    args.unshift(instance);

    // otherwise just apply
    return this._methods[name].apply(instance, args);
  };

  Class.prototype.init = function(args) {
    var instance = {};

    instance._class = this._name;

    // let the constructor do something if it wants
    this.send(instance, "initialize", args);

    return instance;
  };

  Class.prototype.set = function( instance, name, value ) {
    this._checkIvar(name);

    if( this._ivars.indexOf(name) == -1 ){
      return table[this._parent].set( instance, name, value );
    };

    return instance[name] = value;
  };

  Class.prototype.get = function( instance, name ) {
    this._checkIvar(name);

    if( this._ivars.indexOf(name) == -1 ){
      return table[this._parent].get( instance, name );
    };

    return instance[name];
  };

  Class.prototype._checkIvar = function( name ) {
    if( this._name === "Object" ){
      throw new Error("Instance variable not defined");
    }
  };

  Class.prototype.walkIvar = function() {
    if( this._name == "Object" ){
      return [];
    }

    return this._ivars.concat(table[this._parent].walkIvar());
  };

  ns.initializeCT = function() {
    table = {};

    table = {
      "Object": new Class({
        name: "Object",
        methods: {
          initialize: function() {},

          isNumber: function() {
            return false;
          },

          "===": function(_this, other) {
            return _this === other;
          },

          "!==": function(_this, other) {
            return _this !== other;
          }
        }
      }),

      "Number" : new Class({
        name: "Number",
        methods: {
          isNumber: function() {
            return true;
          },

          "+": function(_this, other) {
            return _this + other;
          },

          "-": function(_this, other) {
            return _this - other;
          },

          "*": function(_this, other) {
            return _this * other;
          },

          "/": function(_this, other) {
            return _this / other;
          },

          "%": function(_this, other) {
            return _this % other;
          },

          "<": function(_this, other){
            return _this < other;
          },

          "<=": function(_this, other){
            return _this <= other;
          },

          ">": function(_this, other){
            return _this > other;
          },

          ">=": function(_this, other){
            return _this >= other;
          }
        }
      }),

      "Null" : new Class({
        name: "Null",
        methods: {}
      }),

      "Boolean" : new Class({
        name: "Boolean",
        methods: {}
      }),

      "True" : new Class({
        name: "True",
        parent: "Boolean",
        methods: {}
      }),

      "False" : new Class({
        name: "True",
        parent: "Boolean",
        methods: {}
      }),

      "Block": new Class({
        name: "Block",
        methods: {
          initialize: function(_this, callable) {
            _this._callable = callable;
          },

          call: function(_this) {
            var args = [].slice.call(arguments, 1);

            return _this._callable.apply(_this, args);
          }
        }
      })
    };
  };

  ns.declareClass = function(name, parent, ivars) {
    if( parent && ! table[parent] ){
      throw new Error( "Undefined parent class: " + parent );
    }

    if( table[name] ){
      throw new Error( "Class `" + name  + "` already defined." );
    }

    ivars = ivars || [];

    if( table[parent] ){
      ivars = ivars.concat(table[parent].walkIvar());
    }

    var uniq = ivars.filter(function(value, index, self) {
      return self.indexOf(value) === index;
    });

    if( uniq.length !== ivars.length ){
      throw new Error( "duplicate instance variables" );
    }

    return table[name] = new Class({
      ivars: ivars,
      name: name,
      parent: parent
    });
  };

  ns.declareMethod = function(className, selector, fn) {
    checkClass(className);

    table[className].def(selector, fn);
  };

  ns.instantiate = function(className) {
    var args = [].slice.call(arguments, 1);
    var cls = table[className];

    if( !cls ){
      throw new Error( "Class `" + className + "` is undefined" );
    }

    return cls.init(args);
  };

  ns.setInstVar = function( instance, name, value ) {
    return table[instance._class].set(instance, name, value );
  };

  ns.getInstVar = function( instance, name ) {
    return table[instance._class].get( instance, name );
  };

  ns.send = function( instance, name ){
    var args = [].slice.call(arguments, 2), cls;

    cls = getClass(instance);

    return cls.send(instance, name, args);
  };

  ns.superSend = function( parent, instance, name ) {
    checkClass(parent);

    var args = [].slice.call(arguments, 3);

    if( ! table[parent] ){
      throw new Error( "Undefined super class `" + parent + "`");
    }

    return table[parent].send(instance, name, args);
  };

  function checkClass( className ) {
    if( !table[className] ){
      throw new Error( "Undefined class: " + className );
    }
  };

  function isPrim( e ){
    if( typeof e === "number" || typeof e === "string" ){
      return true;
    }
  }

  function getClass( instance ) {
    switch(instance) {
    case null: return table["Null"];
    case true: return table["True"];
    case false: return table["False"];
    default: return typeof instance == "number" ? table["Number"] : table[instance._class];
    }
  }

  var THIS_STR = "__this__", clss = {};

  var trans = O.transAST = function( ast ) {
    var js = "OO.initializeCT();", send, inst, clsd, sewper;

    if( ast[0] == "program" ){
      return js + ast.slice(1).map(function( ast ) {
        return trans(ast);
      }).join(";");
    }

    return match.apply(window, [
      ast,

      ["exprStmt", _], function( expr ){
        return trans( expr );
      },

      [ "send", _, _], send = function(recv, m, args){
        var send = "OO.send(" + trans(recv) + ", '" + m + "'";

        if( args ) {
          send += (", " + args.map(function( arg) { return trans(arg); }).join(" , "));
        }

        send += ")";

        return send;
      },

      [ "send", _, _, many(_) ], send,

      [ "number", _], function( n ){
        return n.toString();
      },

      [ "varDecls", many(_)], function( decls ) {
        return decls.map(function( decl ) {
          return "var " + decl[0] + " = " + trans(decl[1]);
        }).join( ";\n" );
      },

      [ "getVar", _], function( name ) {
        return name;
      },

      [ "setVar", _, _], function( name, expr ) {
        return name + " = " + trans(expr);
      },

      [ "methodDecl", _, _, _, _], function( cls, name, args, bdyExprs ) {
        window.currentMethodParent = clss[cls];
        args.unshift(THIS_STR);
        return "OO.declareMethod( '"
          + cls
          + "', '" + name
          + "', function( " + args.join(",") + " ) { \n"
          + bdyExprs.map(function( expr ) {
            return trans(expr);
          })
          + "})";

      },

      [ "return", _ ], function( expr ) {
        return "return " + trans(expr) + ";";
      },

      [ "new", _, many(_)], inst = function( name, args ) {
        var str = "OO.instantiate( '" + name + "'";

        if( args ){
          str += "," + args.map(function( arg ) { return trans(arg); });
        }

        return str += ")";
      },

      [ "new", _], inst,

      [ "getInstVar", _], function( id ) {
        return "OO.getInstVar(" + THIS_STR + ", '" + id + "');";
      },

      [ "setInstVar", _, _], function( id, expr ) {
        return "OO.setInstVar(" + THIS_STR + ", '" + id + "', " + trans(expr) + ");";
      },

      [ "classDecl", _, _, _], clsd = function(name, parent, ivars) {
        var cls = "OO.declareClass('" + name + "', '" + parent + "'";

        clss[name] = parent;

        if( ivars ) {
          cls += ", [" + ivars.map(function( ivar ) {  return "'" + ivar + "'"; }) + "]";
        }

        return cls + ");";
      },

      [ "classDecl", _, _], clsd,

      [ "super", _, _], sewper = function( method, args ) {
        var sup = "OO.superSend( '"
              + (window.currentMethodParent || "Object") + "',"
              + THIS_STR + ", '"
              + method + "'";

        if( args ){
          sup += "," + args.map(function( arg ) { return trans(arg); });
        }

        return sup + ")";
      },

      [ "super", _ ], sewper,

      [ "true" ], function() {  return "true"; },
      [ "false" ], function() {  return "false"; },
      [ "block", _, _], function(args, exprs) {
        var transExprs;

        transExprs = exprs.map(function( expr ) {
          return trans(expr);
        });

        var blk = "OO.instantiate('Block', function(";

        blk += args.join(", ");

        blk += "){";

        console.log(transExprs);

        var last = transExprs[transExprs.length - 1];

        if( last.indexOf("return") == -1 ) {
          transExprs[transExprs.length - 1] = "return " + last;
        }

        blk += transExprs.join(";");

        return blk + "})";
      },
    ]);
  };


  try{ global._ = "foo"; } catch(e) { window._ = "foo"; }

  function when( pred ){
    return {
      pred: pred
    };
  }

  function many( pred ){
    var newPred;

    // a `when` is used as the predicate
    if( pred.pred ){
      newPred = pred.pred;
    }

    // a wildcard is used as a predicate
    if( pred === window._ ) {
      newPred = function( value ) {
        return true;
      };
    }

    // otherwise expect an array of matches
    newPred = newPred || function( value ) {
      return matchArray(value, [].slice.call(pred), []);
    };

    return {
      many: newPred
    };
  }

  function isValue(e) {
    if( typeof e === "number" || typeof e === "string" ){
      return true;
    }
  }

  function matchMany(values, pred) {
    var predBindings, result;


    result = {
      binding: [],
      rest: [].slice.call(values)
    };

    while(values.length) {
      var v = values.shift();

      predBindings = pred(v);

      if( predBindings ){
        if( predBindings.length ){
          result.binding = result.binding.concat(predBindings);
        } else {
          result.binding.push(v);
        }

        result.rest.shift();
      } else {
        return result;
      }
    }

    return result;
  }

  function matchArray(value, check, bindings) {
    // if both are empty return the bindings
    if( !value.length && !check.length ){
      return bindings;
    }

    var v, c;

    v = value.shift();
    c = check.shift();

    // if either is undefined and they are not both undefined (value)
    if( c === undefined || v === undefined || c === null || v === null ) {
      if( c == v ){
        return bindings;
      } else {
        return false;
      }
    }

    // the clause was a `when` and the pred doesn't match
    if ( c.pred && !c.pred(v) ){
      return false;
    }
    // we're not looking at an array or object
    // c is not a many predicate
    // c is not a predicate
    // c is not a wildcard
    // the value and check don't match
    if( isValue(v) && !c.many && !c.pred && c !== window._ && c !== v ){
      return false;
    }

    // if it's a wild card, add the binding regardless of value
    if( c === window._ ) {
      bindings.push(v);
    }

    // if we have a predicate and it matchs add the binding
    if( c.pred && c.pred(v) ){
      bindings.push(v);
    }

    // we allow many to not match, ("zero or more")
    // though the pattern matching might still succeed
    if ( c.many ){
      value.unshift(v);
      var result = matchMany(value, c.many);

      // push the result onto the bindings as an array
      bindings.push(result.binding);

      // process what's left recursively
      value = result.rest;
    }

    // nested array should recurse with nested arrays and append the bindings
    // avoid situations where we've already bound all of v
    if( !c.many && Array.isArray(v) && bindings.indexOf(v) == -1){
      bindings = bindings.concat(matchArray(v, c, bindings));
    }

    // otherwise we assume a literal match and proceed with the rest
    return matchArray(value, check, bindings);
  }

  function match(val /* , pat1, fun1, pat2, fun2, ... */) {
    var value, clauses, check, exec, bindings, wrappedV, wrappedC;

    clauses = [].slice.call(arguments, 1);

    while( clauses.length ){
      value = [].slice.call(val);

      check = clauses.shift();
      exec = clauses.shift();

      if( exec == undefined ){
        throw new Error("clauses are mismatched");
      }

      // NOTE check is wrapped in concert with value
      wrappedV = !Array.isArray(value) ? [value] : value;
      wrappedC = !Array.isArray(value) ? [check] : check;

      // otherwise assume array
      bindings = matchArray(wrappedV, wrappedC, []);

      // if bindings were returned we have a match, invoke
      if( bindings ){
        return exec.apply(window, bindings);
      }
    }

    throw new Error("no match found");
  }
})(OO, O);
