var OO = {};

(function( ns ) {
  var table = {};

  function Class( config ) {
    this._ivars = config.ivars || [];

    // object
    this._methods = config.methods || {};
    this._name = config.name;
  }

  Class.prototype.def = function(selector, fn) {
    this._methods[selector] = fn;
  };

  Class.prototype.send = function(instance, name, args) {
   // add the instance to the args
    args.unshift(instance);

    console.log(this._methods);
    return this._methods[name].apply(instance, args);
  };

  Class.prototype.init = function(args) {
    var instance = {};

    // let the constructor do something if it wants
    this.send(instance, "initialize", args);

    instance.class = this._name;

    return instance;
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

  ns.declareMethod = function(className, selector, fn) {
    if( !table[className] ){
      throw new Error( "attempt to add method to undeclared class: " + className );
    }

    table[className].def(selector, fn);
  };

  ns.instantiate = function(className) {
    var args = [].slice.call(arguments, 1);
    var cls = table[className];

    return cls.init(args);
  };

  ns.send = function(instance, name){
    var args = [].slice.call(arguments, 2);

    return table[instance.class].send(instance, name, args);
  };
})(OO);
