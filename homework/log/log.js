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
  throw new TODO("Subst.prototype.unify not implemented");
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

Program.prototype.solve = function() {
  throw new TODO("Program.prototype.solve not implemented");
};
