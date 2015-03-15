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

Rule.prototype.toString = function() {
  return this.head.toString() + (this.body.length? " :- " + this.body.join(", "): "");
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

function uBind(subst, name, term) {
  if( subst.lookup(name) && subst.lookup(name).toString() !== term.toString() ){
    throw new Error( 'unification failed' );
  }

  subst.bind(name, term);
}

Subst.prototype.toString = function(){
  var str = "";
  for( var b in this.bindings ) {
    str += b + ": " + this.bindings[b].toString() + "\n";
  }
  return str;
};

Subst.prototype.unify = function(term1, term2) {
  if( term1.constructor == Var && term2.constructor == Var ){
    if( term1.name !== term2.name ){
      this.bind(term1.name, term2);
    }
  }

  if( term1.constructor == Var && term2.constructor == Clause ){
    uBind(this, term1.name, term2);
  }

  if( term1.constructor == Clause && term2.constructor == Var ){
    uBind(this, term2.name, term1);
  }

  if( term1.constructor == Clause && term2.constructor == Clause ){
    if( term1.args.length !== term2.args.length || term1.name !== term2.name ){
      throw new Error( 'unification failed' );
    }

    term1.args.forEach(function( clause1, i ) {
      var clause2 = term2.args[i];

      this.unify(clause1.rewrite(this), clause2.rewrite(this));
    }.bind(this));
  }

  // go back and make sure to substitute on the right hand side
  for( var b in this.bindings ){
    // todo must not substitute x for itself
    this.bindings[b] = this.bindings[b].rewrite(this);
  }

  return this;
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

Program.prototype.solve = function() {
  return new Solution(this.rules, this.query);
};

var Solution = function( rules, query ) {
  this._rules = rules;
  this._query = query;
  this._skip = [];
};

// TODO  restrict the rules that can be used for further subst
Solution.prototype.next = function( skip ) {
  var subst = new Subst();
  var i = 0, j, clause, rule, success, substClone, used = [], rules, query, result, skip;

  // dupe the rules, query
  rules = this._rules;
  query = this._query.slice();
  skip = skip || this._skip.slice();

  while(clause = query[i]){
    success = false;
    j = 0;

    while(rule = rules[j]){
      j++;
      substClone = subst.clone();

      try {
        var fresh = rule.makeCopyWithFreshVarNames();
        // try to unify, record on success
        result = substClone.unify(clause, fresh.head);


        var path = used.slice();

        path.push(rule);

        if( skip.find(path) ){
          continue;
        }

        subst = result;

        query = query.concat(fresh.body);

        // update everything else with the new binding, this forces
        // any query considered later to respect the bindings found here
        // query = query.map(function( q ) {
        //   return q.__freshen({});
        // });

        // if the unification doesn't throw an exception
        success = true;
        // store rules used
        used.push(rule);

        // move on to the next query
        break;
      } catch (e) {
        // if unification fails for this this rule, move on
        continue;
      }
    }

    // if we were unable to find a rule which unified with
    // the current query and it's the first rule
    // then fail, there are no solutions
    if( ! success && i == 0 ){
      return false;
    }

    // if we were unable to find a rule which unified with
    // the current query and we had some success, start over
    // but with the first rule used appended to the end of the rules
    if( ! success && i >= 1 ){
      if( used.length ){
        skip.push(used);
      }

      return this.next( skip );
    }

    i++;
  }

  // on success remove the first used rule, so that next
  // will find some new solution
  this._skip.push(used);

  return subst;
};

Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array)
    return false;

  // compare lengths - can save a lot of time
  if (this.length != array.length)
    return false;

  for (var i = 0, l=this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i]))
        return false;
    }
    else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}

Array.prototype.find = function( element ) {
  var it = false;
  this.forEach(function( e ) {
    if( e.equals(element)) { it = true; }
  });

  return it;
};

Array.prototype.toString = function() {
  return this.join( "; ");
};
