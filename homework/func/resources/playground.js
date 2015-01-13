function insertPlayground(lang, optSource) {
  var fromString = (lang.fromString || fail('language object must have a fromString method')).bind(lang);
  var evalAST = lang.evalAST ? lang.evalAST.bind(lang) : undefined;
  var transAST = lang.transAST ? lang.transAST.bind(lang) : undefined;
  if (!evalAST && !transAST) {
    fail('language object must have either an evalAST or a transAST method');
  }

  var syntaxHighlight = lang.grammar.semanticAction({
    number: function(_) {
      conc.doc.markText(
        conc.doc.posFromIndex(this.interval.startIdx),
        conc.doc.posFromIndex(this.interval.endIdx),
        { className: 'number' }
      );
    },
    ident: function(_, _) {
      conc.doc.markText(
        conc.doc.posFromIndex(this.interval.startIdx),
        conc.doc.posFromIndex(this.interval.endIdx),
        { className: 'ident' }
      );
    },
    keyword: function(_) {
      conc.doc.markText(
        conc.doc.posFromIndex(this.interval.startIdx),
        conc.doc.posFromIndex(this.interval.endIdx),
        { className: 'keyword' }
      );
    },
    comment: function(_) {
      conc.doc.markText(
        conc.doc.posFromIndex(this.interval.startIdx),
        conc.doc.posFromIndex(this.interval.endIdx),
        { className: 'comment' }
      );
    },
    _list: ohm.actions.map,
    _terminal: function() {},
    _default: ohm.actions.passThrough
  });

  var playground = toDOM(['table']);
  playground.className = 'playground';

  var scripts = document.getElementsByTagName('script');
  var thisScriptTag = scripts[scripts.length - 1];
  thisScriptTag.parentNode.appendChild(playground);

  function addEditor(label, width, height, optReadOnly) {
    var editorTd = toDOM(['td']);
    playground.appendChild(toDOM(['tr', ['td', label], editorTd]));
    var editor = CodeMirror(editorTd, {
      readOnly: optReadOnly,
      value: '',
      mode: 'text/plain',
      enterMode: 'flat',
      electricChars: false,
      lineNumbers: true,
      smartIndent: false,
      lineSpacing: 1.1
    });
    editor.setSize(width, height);
    return editor;
  }

  function clearEverythingElse() {
    abs.setValue('');
    if (transAST) {
      trans.setValue('');
    }
    res.setValue('');
  }
    
  var conc = addEditor('concrete syntax', 630, 300);
  var abs = addEditor('abstract syntax', 630, 200, true);
  var trans = transAST ? addEditor('translation', 630, 200, true) : undefined;
  var res = addEditor('result', 630, 100, true);

  conc.on('change', function() { haveSource(conc.getValue()); });
  if (optSource) {
    conc.setValue(optSource);
  }

  var parseErrorWidget;
  function haveSource(src) {
    if (parseErrorWidget) {
      conc.removeLineWidget(parseErrorWidget);
      parseErrorWidget = undefined;
    }
    conc.getAllMarks().forEach(function(mark) { mark.clear(); });

    var src = conc.getValue();
    syntaxHighlight(lang.grammar.matchContents(src, 'tokens'));
    if (src.trim().length === 0) {
      clearEverythingElse();
      return;
    }
    var ast;
    try {
      ast = lang.fromString(src);
    } catch (e) {
      if (e instanceof ohm.error.MatchFailure) {
        showSyntaxError(e, src);
      } else {
        clearEverythingElse();
        abs.setValue(e.hasOwnProperty('stack') ? e.stack : e.toString());
      }
      return;
    }
    haveAST(ast);
  }

  function haveAST(ast) {
    abs.setValue(prettyPrintAST(lang, ast));
    if (transAST) {
      var code;
      try {
        code = transAST(ast);
        trans.setValue(prettyPrintJS(code));
      } catch (e) {
        trans.setValue(e.stack);
        return;
      }
      haveTrans(code);
    } else {
      try {
        haveResult(lang.evalAST(ast));
      } catch (e) {
        res.setValue(e.stack);
      }
    }
  }

  function haveTrans(code) {
    try {
      haveResult(eval(code));
    } catch (e) {
      res.setValue(e.stack);
    }
  }

  function haveResult(value) {
    res.setValue(prettyPrintValue(lang, value));
  }

  function showSyntaxError(e, src) {
    setTimeout(
      function() {
        if (conc.getValue() === src && !parseErrorWidget) {
          function repeat(x, n) {
            var xs = [];
            while (n-- > 0) {
              xs.push(x);
            }
            return xs.join('');
          }
          var msg = 'Expected: ' + e.getExpectedText();
          var pos = conc.doc.posFromIndex(e.getPos());
          var error = toDOM(['parseError', repeat(' ', pos.ch) + '^\n' + msg]);
          parseErrorWidget = conc.addLineWidget(pos.line, error);
          $(error).hide().slideDown();
        }
      },
      2500
    );
  }

  function fail(msg) {
    throw new Error(msg);
  }
}

// insertPlayground('6 * 7')

