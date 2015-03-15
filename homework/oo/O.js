var g = ohm.grammar("O");
var toAST = g.synthesizedAttribute({
  Program:               function(parts, optE)               { var ast = ["program"].concat(toAST(parts));
                                                               if (toAST(optE)) {
                                                                 ast.push(["exprStmt", toAST(optE)]);
                                                               }
                                                               return ast; },
  ClassDecl:             function(_, c, _, s, ivs, _)        { return ["classDecl",
                                                                   toAST(c),
                                                                   toAST(s) || "Object",
                                                                   toAST(ivs)]; },
  InstVarDecls_some:     function(_, n, _, ns)               { return [toAST(n)].concat(toAST(ns)); },
  InstVarDecls_none:     function()                          { return []; },
  MethodDecl_nary1:      function(_, c, _, n, fs, b)         { return ["methodDecl",
                                                                 toAST(c),
                                                                 toAST(n),
                                                                 toAST(fs),
                                                                 toAST(b)]; },
  MethodDecl_nary2:      function(_, c, ss, fs, b)           { return ["methodDecl",
                                                                 toAST(c),
                                                                 toAST(ss).reduce(
                                                                   function(n, s) {
                                                                     return n +
                                                                       s.charAt(0).toUpperCase() + 
                                                                       s.slice(1); }),
                                                                 toAST(fs),
                                                                 toAST(b)]; },
  MethodDecl_binary:     function(_, c, m, f, b)             { return ["methodDecl",
                                                                 toAST(c),
                                                                 toAST(m),
                                                                 [toAST(f)],
                                                                 toAST(b)]; },
  MethodBody_expr:       function(_, e, _)                   { return [["return", toAST(e)]]; },
  MethodBody_stmt:       function(_, ss, optE, _)            { var ast = toAST(ss);
                                                               if (toAST(optE)) {
                                                                 ast.push(["exprStmt", toAST(optE)]);
                                                               }
                                                               return ast; },
  Stmt_varDecls:         function(_, p, _, ps, _)            { return ["varDecls", toAST(p)].concat(toAST(ps)); },
  Stmt_return:           function(_, e, _)                   { return ["return", toAST(e)]; },
  Stmt_instVarAssign:    function(_, _, n, _, e, _)          { return ["setInstVar", toAST(n), toAST(e)]; },
  Stmt_varAssign:        function(n, _, e, _)                { return ["setVar", toAST(n), toAST(e)]; },
  Stmt_expr:             function(e, _)                      { return ["exprStmt", toAST(e)]; },
  VarDeclPart_init:      function(x, _, e)                   { return [toAST(x), toAST(e)]; },
  VarDeclPart_noInit:    function(x)                         { return [toAST(x), ["null"]]; },
  WSendExpr_super:       function(_, ss, as)                 { return ["super",
                                                                 toAST(ss).reduce(
                                                                   function(n, s) {
                                                                     return n +
                                                                       s.charAt(0).toUpperCase() +
                                                                       s.slice(1); })].concat(toAST(as)); },
  WSendExpr_send:       function(r, ss, as)                 { return ["send",
                                                                 toAST(r),
                                                                 toAST(ss).reduce(
                                                                   function(n, s) {
                                                                     return n +
                                                                       s.charAt(0).toUpperCase() +
                                                                       s.slice(1); })].concat(toAST(as)); },
  EqExpr_eq:             function(x, op, y)                  { return ["send", toAST(x), toAST(op), toAST(y)]; },
  OrExpr_or:             function(x, op, y)                  { return ["send", toAST(x), toAST(op), toAST(y)]; },
  AndExpr_and:           function(x, op, y)                  { return ["send", toAST(x), toAST(op), toAST(y)]; },
  RelExpr_rel:           function(x, op, y)                  { return ["send", toAST(x), toAST(op), toAST(y)]; },
  AddExpr_add:           function(x, op, y)                  { return ["send", toAST(x), toAST(op), toAST(y)]; },
  MulExpr_mul:           function(x, op, y)                  { return ["send", toAST(x), toAST(op), toAST(y)]; },
  DotExpr_super:         function(_, _, m, xs)               { return ["super", toAST(m)].concat(toAST(xs)); },
  DotExpr_send:          function(r, _, m, xs)               { return ["send", toAST(r), toAST(m)].concat(toAST(xs)); },
  DotExpr_instVarAccess: function(_, _, n)                   { return ["getInstVar", toAST(n)]; },
  UnExpr_pos:            function(_, x)                      { return ["send", toAST(x), "unaryPlus"]; },
  UnExpr_neg:            function(_, x)                      { return ["send", toAST(x), "unaryMinus"]; },
  PriExpr_paren:         function(_, e, _)                   { return toAST(e); },
  PriExpr_block:         function(_, fs, ss, optE, _)        { var ast = ["block", toAST(fs)];
                                                               var ss = toAST(ss);
                                                               if (toAST(optE)) {
                                                                 ss.push(["exprStmt", toAST(optE)]);
                                                               }
                                                               ast.push(ss);
                                                               return ast; },
  PriExpr_new:           function(_, c, xs)                  { return ["new", toAST(c)].concat(toAST(xs)); },
  PriExpr_str:           function(s)                         { return ["string", toAST(s)]; },
  PriExpr_ident:         function(n)                         { return ["getVar", toAST(n)]; },
  PriExpr_number:        function(_)                         { return ["number", parseFloat(this.interval.contents)]; },
  PriExpr_this:          function(_)                         { return ["this"]; },
  PriExpr_true:          function(_)                         { return ["true"]; },
  PriExpr_false:         function(_)                         { return ["false"]; },
  PriExpr_null:          function(_)                         { return ["null"]; },
  Actuals_none:          function(_, _)                      { return []; },
  Actuals_some:          function(_, e, _, es, _)            { return [toAST(e)].concat(toAST(es)); },
  Formals_none:          function(_, _)                      { return []; },
  Formals_some:          function(_, x, _, xs, _)            { return [toAST(x)].concat(toAST(xs)); },
  BFormals_none:         function()                          { return []; },
  BFormals_some:         function(x, _, xs, _)               { return [toAST(x)].concat(toAST(xs)); },
  ident:                 function(_, _)                      { return this.interval.contents; },
  className:             function(_, _)                      { return this.interval.contents; },
  string:                function(_, cs, _)                  { var chars = [];
                                                               var idx = 0;
                                                               cs = toAST(cs);
                                                               while (idx < cs.length) {
                                                                 var c = cs[idx++];
                                                                 if (c === "\\" && idx < cs.length) {
                                                                   c = cs[idx++];
                                                                   switch (c) {
                                                                     case "n": c = "\n"; break;
                                                                     case "t": c = "\t"; break;
                                                                     default: idx--;
                                                                   }
                                                                 }
                                                                 chars.push(c);
                                                               }
                                                               return chars.join(""); },
  _list:                 ohm.actions.map,
  _terminal:             ohm.actions.getValue,
  _default:              ohm.actions.passThrough
});

var O = new Translator(g, "Program", toAST);

// O.transAST is declared in oo.js
// O.prettyPrintAST is declared in prettyPrint.js

