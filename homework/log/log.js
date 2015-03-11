// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------

var globalVarCounter = 0;

Rule.prototype.makeCopyWithFreshVarNames = function() {
  var s = {}, newHead, newBody;

  newHead = this.head.rewrite(s);

  newBody = this.body.map(function(clause) {
    return clause.rewrite(s);
  });

  return new Rule(newHead, newBody);
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
  var newName;

  // if we've already seen this variable use the mapping
  if( subst[this.name] ){
    return new Var(subst[this.name]);
  }

  // fresh var
  newName = this.name + "_" + (globalVarCounter++);

  // keep track of the mapping
  subst[this.name] = newName;

  return new Var(newName);
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
