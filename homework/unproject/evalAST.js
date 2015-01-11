C.evalAST = function(ast) {
  return evalExpr(ast, {});
};

function evalExpr(expr, env){
  var l,r;

  if( !expr || typeof expr == "number" || typeof expr == "string" ){
    return expr;
  }

  l = evalExpr(expr[1], env);
  r = evalExpr(expr[2], env);

  switch(expr[0]){
  case '+':
    return l + r;
  case '-':
    return l - r;
  case '*':
    return l * r;
  case '/':
    return l / r;
  case '^':
    return Math.pow(l, r);
  case 'seq':
    return r;
  case 'id':
    return env[l] || 0;
  case 'set':
    return env[l] = r;
  }

  throw new Error("unsupported op: " + expr[0]);
}
