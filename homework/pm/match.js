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


  // wildcard binding
  if( isValue(v) && c === window._ ) {
    bindings.push(v);
  } else if ( c.pred && !c.pred(v) ){
    return false;
  } else if( isValue(v) && !c.pred && c !== v ){
    return false;
  }

  if( c.pred && c.pred(v) ){
    bindings.push(v);
  }

  // nested array should recurse with nested arrays and append the bindings
  if( Array.isArray(v) ){
    bindings.concat(matchArray(v, c, bindings));
  }

  // otherwise we assume a match and proceed
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

    wrappedV = !Array.isArray(value) ? [value] : value;
    wrappedC = !Array.isArray(check) ? [check] : check;

    // otherwise assume array
    bindings = matchArray(wrappedV, wrappedC, []);

    // if false wasn't returned use the bindings
    if( bindings ){
      return exec.apply(window, bindings);
    }
  }

  throw new Error("no match found");
}
