// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------

var globalVarCounter = 0;

Rule.prototype.makeCopyWithFreshVarNames = function() {
  var env = {}, newHead, newBody;

  newHead = this.head.__freshen(env);

  newBody = this.body.map(function(clause) {
    return clause.__freshen(env);
  });

  return new Rule(newHead, newBody);
};

Clause.prototype.__freshen = function(env) {
  var newArgs = [];

  if(this.args){
    newArgs = this.args.map(function( arg ) {
      return arg.__freshen(env);
    });
  }

  return new Clause(this.name, newArgs);
};

Var.prototype.__freshen = function(env) {
  var newName;

  // if we've already seen this variable use the mapping
  if( env[this.name] ){
    return new Var(env[this.name]);
  }

  // fresh var
  newName = this.name + "_" + (globalVarCounter++);

  // keep track of the mapping
  env[this.name] = newName;

  return new Var(newName);
};



Clause.prototype.rewrite = function(subst) {
  var newArgs = [];

  if(this.args){
    newArgs = this.args.map(function( arg ) {
      return arg.rewrite(subst);
    });
  }

  return new Clause(this.name, newArgs);
};

Var.prototype.rewrite = function(subst) {

  if( subst.lookup(this.name) ){
    return subst.lookup(this.name);
  }

  return this;
};

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------

Subst.prototype.unify = function(term1, term2) {
  if( term1.constructor == Var && term2.constructor == Var ){
    if( term1.name !== term2.name ){
      this.bind(term1.name, term2);
    }
  }

  if( term1.constructor == Var && term2.constructor == Clause ){
    this.bind(term1.name, term2);
  }

  if( term1.constructor == Clause && term2.constructor == Var ){
    this.bind(term2.name, term1);
  }

  if( term1.constructor == Clause && term2.constructor == Clause ){
    if( term1.args.length !== term2.args.length || term1.name !== term2.name ){
      throw new Error( 'unification failed' );
    }

    term1.args.forEach(function( clause1, i ) {
      var clause2 = term2.args[i];

      clause1.rewrite(this);
      clause2.rewrite(this);

      this.unify(clause1, clause2);
    }.bind(this));
  }

  // go back and make sure to substitute on the right hand side
  for( var b in this.bindings ){
    this.bindings[b] = this.bindings[b].rewrite(this);
  }

  return this; // throw new TODO("Subst.prototype.unify not implemented");
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

Program.prototype.solve = function() {
  throw new TODO("Program.prototype.solve not implemented");
};
