window._ = "placeholder";

function isValue(e) {
  debugger;
  if( typeof e === "number" ){
    return true;
  }
}

function match(value /* , pat1, fun1, pat2, fun2, ... */) {
  var clauses = [].slice.call(arguments, 1);
  var check, exec;

  while( clauses.length ){
    check = clauses.shift();
    exec = clauses.shift();

    if( !check || !exec ){
      throw new Error("clauses are mismatched");
    }

    if( isValue(value) && check === window._ ) {
      return exec(value);
    }

    // match
    // invoke with
  }
}
