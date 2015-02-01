window._ = "wildcard";

function when( pred ){
  return {
    pred: pred
  };
}

function isValue(e) {
  if( typeof e === "number" || typeof e === "string" ){
    return true;
  }
}

function matchArray(value, check, bindings) {
  // if both are empty return the bindings
  if( !value.length && !check.length ){
    return bindings;
  }

  // if the check still has elements but value doesn't, vice versa
  if( value.length !== check.length ){
    return false;
  }

  var v, c;

  v = value.shift();
  c = check.shift();

  // the clause was a when and the pred doesn't match
  // return no match
  if ( c.pred && !c.pred(v) ){
    return false;
  }

  // we're not looking at an array or object
  // c is not a predicate
  // c is not a wildcard
  // the value and check don't match
  // return no match
  if( isValue(v) && !c.pred && c !== v && c !== window._ ){
    return false;
  }

  // if it's a wild card add the binding regardless of value
  if( c === window._ ) {
    bindings.push(v);
  }

  // if we have a predicate and it matchs add the binding
  if( c.pred && c.pred(v) ){
    bindings.push(v);
  }

  // nested array should recurse with nested arrays and append the bindings
  if( Array.isArray(v) ){
    bindings.concat(matchArray(v, c, bindings));
  }

  // otherwise we assume a literal match and proceed with the rest
  return matchArray(value, check, bindings);
}

function match(value /* , pat1, fun1, pat2, fun2, ... */) {
  var clauses = [].slice.call(arguments, 1);
  var check, exec, bindings, wrappedV, wrappedC;

  while( clauses.length ){
    check = clauses.shift();
    exec = clauses.shift();

    if( !check || !exec ){
      throw new Error("clauses are mismatched");
    }

    // NOTE check is wrapped in concert with value
    wrappedV = !Array.isArray(value) ? [value] : value;
    wrappedC = !Array.isArray(value) ? [check] : check;

    // otherwise assume array
    bindings = matchArray(wrappedV, wrappedC, []);

    // if false wasn't returned use the bindings
    if( bindings ){
      return exec.apply(window, bindings);
    }
  }

  throw new Error("no match found");
}
