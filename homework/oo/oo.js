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
        name: "Null"
      }),

      "Boolean" : new Class({
        name: "Boolean"
      }),

      "True" : new Class({
        name: "True",
        parent: "Boolean"
      }),

      "False" : new Class({
        name: "True",
        parent: "Boolean"
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
      }),

      "Class": new Class({
        name: "Class",
        methods: {
          intialize: function(_this, name, parent ) {
            debugger ;
            return ns.declareClass(name, parent, [].slice.call(arguments, 2));
          },

          define: function(_this, name, block ) {
            debugger ;
            ns.declareMethod(_this._class, name, block._callable);
          },

          inst: function(_this) {
            var args = [].slice.call(arguments, 1);

            debugger;
            args.unshift(_this._class);
            return ns.instantiate.apply(window, args);
          }
        }
      }),

      "__Program__": new Class({
        name: "__Program__"
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

  ns.ReturnJump = function( value, method ) {
    this._value = value;
    this._method = method;
    this.message = "return jump from `" + method + "`, should be caught ";
    this.name = "ReturnJump";
  };

  ns.ReturnJump.prototype = Error.prototype;

  function wrapTryCatch( transExprs, valVar ) {
    return "try {"
      + transExprs.join(";")
      + "} catch( e ) {"
      + "  if( e instanceof OO.ReturnJump && e._method === __method ) {"
      + "console.log( e );"
      +      (valVar ? valVar + " = e._value;" : "return e._value;")
      // + "  } else if( e instanceof OO.ReturnJump && e._method !== __method ) {"
      // + "console.log( e );"
      // +      "throw new Error('block return outside original scope');"
      + "  } else {"
      + "console.log( e );"
      + "    throw e;"
      + "  }"
      + "}";
  }

  function wrapReturnJump(str, env) {
    if( env.currentMethod ) {
      return "throw new OO.ReturnJump(" + str + ", __method);";
    } else {
      return "return " + str;
    }
  }

  function ensureThrow(exprs, transExprs, env) {
    if( !transExprs.length || exprs[exprs.length - 1][0] !== "exprStmt" ){
      transExprs.push("null");
    }

    var last = transExprs[transExprs.length - 1];

    if( last.indexOf("throw") !== 0 || last.indexOf("return") !== 0 ) {
      transExprs[transExprs.length - 1] = wrapReturnJump(last, env);
    }
  }

  ns.methodCallId = 0;

  var trans = O.transAST = function( ast, env ) {
    var js = "OO.initializeCT();", send, inst, clsd, sewper, oldEnv;

    env = env || {};

    if( ast[0] == "program" ){
      js += ast.slice(1).map(function( subast ) {
        return trans(subast, env);
      }).join(";");

      return js;
    }


    return match.apply(window, [
      ast,

      ["exprStmt", _], function( expr ){
        return trans( expr, env );
      },

      [ "send", _, _], send = function(recv, m, args){
        var send = "OO.send(" + trans(recv, env) + ", '" + m + "'";

        if( args ) {
          send += (", " + args.map(function( arg) { return trans(arg, env); }).join(" , "));
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
          return "var " + decl[0] + " = " + trans(decl[1], env);
        }).join( ";\n" );
      },

      [ "getVar", _], function( name ) {
        return name;
      },

      [ "setVar", _, _], function( name, expr ) {
        return name + " = " + trans(expr, env);
      },

      [ "methodDecl", _, _, _, _], function( cls, name, args, bdyExprs ) {
        oldEnv = env;
        env = {};

        env.methodParent = clss[cls];
        env.currentMethod = cls + "#" + name;

        var transExprs = bdyExprs.map(function( expr ) {
          return trans(expr, env);
        });

        ensureThrow(bdyExprs, transExprs, env);

        args.unshift(THIS_STR);

        return "OO.declareMethod( '"
          + cls
          + "', '" + name
          + "', function( " + args.join(",") + " ) { \n"
          + "var __method = '" + env.currentMethod + "-' + OO.methodCallId++;"
          + wrapTryCatch(transExprs)
          + "})";

      },

      [ "return", _ ], function( expr ) {
        return wrapReturnJump(trans(expr, env), env);
      },

      [ "new", _, many(_)], inst = function( name, args ) {
        var str = "OO.instantiate( '" + name + "'";

        if( args ){
          str += "," + args.map(function( arg ) { return trans(arg, env); });
        }

        return str += ")";
      },

      [ "new", _], inst,

      [ "getInstVar", _], function( id ) {
        return "OO.getInstVar(" + THIS_STR + ", '" + id + "')";
      },

      [ "setInstVar", _, _], function( id, expr ) {
        return "OO.setInstVar(" + THIS_STR + ", '" + id + "', " + trans(expr, env) + ")";
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

      [ "super", _, many(_)], sewper = function( method, args ) {
        var sup = "OO.superSend( '"
              + (env.methodParent || "Object") + "',"
              + THIS_STR + ", '"
              + method + "'";

        if( args ){
          sup += "," + args.map(function( arg ) { return trans(arg, env); });
        }

        return sup + ")";
      },

      [ "super", _ ], sewper,

      [ "this" ], function() {  return THIS_STR },

      [ "true" ], function() {  return "true"; },
      [ "false" ], function() {  return "false"; },
      [ "null" ], function() {  return "null"; },
      [ "string", _ ], function(str) {  return "'" + str + "'"; },
      [ "block", _, _], function(args, exprs) {
        var transExprs;

        transExprs = exprs.map(function( expr ) {
          return trans(expr, env);
        });

        var blk = "OO.instantiate('Block', function(";

        blk += args.join(", ");

        blk += "){";

        ensureThrow(exprs, transExprs, env);

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
