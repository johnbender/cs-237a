window._ = "wildcard";

function when( pred ){
  return {
    pred: pred
  };
}

function many( pred ){
  // a `when` is used as the predicate
  if( pred.pred ){
    pred = pred.pred;
  }

  if( Array.isArray(pred) ){
    pred = function( value ) {
      return matchArray(pred, value, []);
    };
  }

  return {
    many: pred
  };
}

function isValue(e) {
  if( typeof e === "number" || typeof e === "string" ){
    return true;
  }
}

function matchMany(values, pred) {
  var result = {
    binding: [],
    rest: values
  };

  while(values.length) {
    var v = values.shift();

    if( pred(v) ){
      result.binding.push(v);
      result.rest.unshift();
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
  if( !c.many && Array.isArray(v) ){
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

    // if bindings were returned we have a match, invoke
    if( bindings ){
      return exec.apply(window, bindings);
    }
  }

  throw new Error("no match found");
}
