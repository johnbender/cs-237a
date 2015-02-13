var OO = {};

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

  Class.prototype.def = function(selector, fn) {
    this._methods[selector] = fn;
  };

  Class.prototype.send = function(instance, name, args) {
   // add the instance to the args
    args.unshift(instance);

    if( ! this._methods[name] ){
      throw new Error([
        "Message not understood, object of type `",
        this._name + "` got `" + name + "`"
      ].join(""));
    }

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

  ns.initializeCT = function() {
    table["Object"] = new Class({
      name: "Object",
      methods: {
        initialize: function() {},

        "===": function(other) {
          return this === other;
        },

        "!==": function(other) {
          return this !== other;
        }
      }
    });
  };

  ns.declareClass = function(name, parent, ivars) {
    table[name] = new Class({
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

    return cls.init(args);
  };

  ns.setInstVar = function( instance, name, value ) {
    return table[instance._class].set(instance, name, value );
  };

  ns.getInstVar = function( instance, name ) {
    return table[instance._class].get( instance, name );
  };

  ns.send = function(instance, name){
    var args = [].slice.call(arguments, 2);

    // if there's a send to a primitive then we need to handle that
    if( isPrim(instance) ){
      return primSend(instance, name, args);
    }

    // since this is internal this check is purely for sanity
    checkClass(instance._class);

    return table[instance._class].send(instance, name, args);
  };

  ns.superSend = function(parent, instance, name) {
    checkClass(parent);

    var args = [].slice.call(arguments, 3);

    return table[parent].send(instance, name, args);
  };

  function checkClass(className) {
    if( !table[className] ){
      throw new Error( "Undefined class: " + className );
    }
  };

  function isPrim(e){
    if( typeof e === "number" || typeof e === "string" ){
      return true;
    }
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
