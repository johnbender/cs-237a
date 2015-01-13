var F = {};

F.grammar = ohm.namespace('ppls').getGrammar('F');

toAST = F.grammar.semanticAction({
  SeqExpr_seq:         function(x, _, y)               { return ['seq', toAST(x), toAST(y)]; },
  NoSeqExpr_let:       function(_, x, _, e1, _, e2)    { return ['let', toAST(x), toAST(e1), toAST(e2)]; },
  NoSeqExpr_fun:       function(_, args, _, body)      { return ['fun', toAST(args), toAST(body)]; },
  NoSeqExpr_if:        function(_, cond, _, tb, _, fb) { return ['if', toAST(cond), toAST(tb), toAST(fb)]; },
  NoSeqExpr_match:     function(_, e, _, _, pes)       { return ['match', toAST(e)].concat(toAST(pes)); },
  PatsAndExprs_cons:   function(pe, _, pes)            { return toAST(pe).concat(toAST(pes)); },
  PatsAndExprs_single: function(pe)                    { return toAST(pe); },
  PatAndExpr:          function(p, _, e)               { return [toAST(p), toAST(e)]; },
  Pat_cons:            function(p1, _, p2)             { return ['cons', toAST(p1), toAST(p2)]; },
  PriPat_list:         function(_, ps, _)              { return toAST(ps); },
  PriPat_wild:         function(x)                     { return ['_']; },
  PriPat_ident:        function(x)                     { return ['id', toAST(x)]; },
  PriPat_number:       function(n)                     { return toAST(n); },
  PriPat_null:         function(_)                     { return null; },
  PriPat_true:         function(_)                     { return true; },
  PriPat_false:        function(_)                     { return false; },
  Pats_cons:           function(x, _, xs)              { return ['cons', toAST(x), toAST(xs)]; },
  Pats_single:         function(x)                     { return ['cons', toAST(x), null]; },
  Pats_none:           function()                      { return null; },
  AssignExpr_set:      function(x, _, e)               { return ['set', toAST(x), toAST(e)]; },
  OrExpr_or:           function(x, _, y)               { return ['or', toAST(x), toAST(y)]; },
  AndExpr_and:         function(x, _, y)               { return ['and', toAST(x), toAST(y)]; },
  EqExpr_eq:           function(x, _, y)               { return ['=',  toAST(x), toAST(y)]; },
  EqExpr_neq:          function(x, _, y)               { return ['!=', toAST(x), toAST(y)]; },
  RelExpr_lt:          function(x, _, y)               { return ['<', toAST(x), toAST(y)]; },
  RelExpr_gt:          function(x, _, y)               { return ['>', toAST(x), toAST(y)]; },
  ConsExpr_cons:       function(x, _, y)               { return ['cons', toAST(x), toAST(y)]; },
  AddExpr_plus:        function(x, _, y)               { return ['+', toAST(x), toAST(y)]; },
  AddExpr_minus:       function(x, _, y)               { return ['-', toAST(x), toAST(y)]; },
  MulExpr_times:       function(x, _, y)               { return ['*', toAST(x), toAST(y)]; },
  MulExpr_divide:      function(x, _, y)               { return ['/', toAST(x), toAST(y)]; },
  MulExpr_modulus:     function(x, _, y)               { return ['%', toAST(x), toAST(y)]; },
  CallExpr_args:       function(f, args)               { return ['call', toAST(f)].concat(toAST(args)); },
  CallExpr_noArgs:     function(f, _, _)               { return ['call', toAST(f)]; },
  UnExpr_pos:          function(_, e)                  { return toAST(e); },
  UnExpr_neg:          function(_, e)                  { return ['-', 0, toAST(e)]; },
  UnExpr_delay:        function(_, e)                  { return ['delay', toAST(e)]; },
  UnExpr_force:        function(_, e)                  { return ['force', toAST(e)]; },
  PriExpr_paren:       function(_, e, _)               { return toAST(e); },
  PriExpr_listComp:    function(_, e, _, x, _, el,
                                _, ep, _)              { var node = ['listComp', toAST(e), toAST(x), toAST(el)];
                                                         if (toAST(ep)) {
                                                           node.push(toAST(ep));
                                                         }
                                                         return node; },
  PriExpr_list:        function(_, es, _)              { return toAST(es); },
  PriExpr_ident:       function(x)                     { return ['id', toAST(x)]; },
  PriExpr_number:      function(n)                     { return toAST(n); },
  PriExpr_null:        function(_)                     { return null; },
  PriExpr_true:        function(_)                     { return true; },
  PriExpr_false:       function(_)                     { return false; },
  NoSeqExprs_cons:     function(x, _, xs)              { return ['cons', toAST(x), toAST(xs)]; },
  NoSeqExprs_single:   function(x)                     { return ['cons', toAST(x), null]; },
  NoSeqExprs_none:     function()                      { return null; },
  ident:               function(_, _)                  { return this.interval.contents; },
  number:              function(_)                     { return parseFloat(this.interval.contents); },
  _terminal: ohm.actions.getValue,
  _list: ohm.actions.map,
  _default: ohm.actions.passThrough
});

F.fromString = function(str) {
  var cst = this.grammar.matchContents(str, 'Expr', true);
  return toAST(cst);
};

// F.evalAST is declared in evalAST.js

F.eval = function(str) {
  var ast = this.fromString(str);
  return this.evalAST(ast);
};

