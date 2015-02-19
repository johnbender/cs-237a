var OO = {};

// TODO all the table[_] refs can be replaced by referencing the object itself
(function( ns ) {
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

    cls = getClass(instance);

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

    table["Object"] = new Class({
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
    });

    table["Number"] = new Class({
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
        }
      }
    });
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
    return typeof instance === "number" ? table["Number"] : table[instance._class];
  }

  function primSend(value, name, args) {
    switch(name){
    case "+":
      return value + args[1];
    case "-":
      return value - args[1];
    case "/":
      return value / args[1];
    case "*":
      return value * args[1];
    default:
      return value[name].apply(value, args);
    }
  }
})(OO);
