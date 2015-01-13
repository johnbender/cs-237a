// Poor man's test harness

function TODO(message) {
  var e = new Error(message);
  this.message = message;
  Object.defineProperty(this, "stack", {
    get: function() { return e.stack; }
  });
}

TODO.prototype = Object.create(Error.prototype);
TODO.prototype.name = "TODO";

function tests(L /* , testCase1, testCase2, ... */) {
  var numTests = arguments.length - 1;
  var numPasses = 0;
  var tests = toDOM(['testCases']);

  for (var idx = 1; idx < arguments.length; idx++) {
    var testCase = arguments[idx];
    var expr;
    var actualValue;
    var exception = undefined;
    try {
      expr = L.fromString(testCase.code);
      actualValue = L.evalAST(expr);
    } catch (e) {
      exception = e;
    }
    var node = toDOM(
      ['testCase',
        ['details',
          ['summary', testCase.name],
          ['syntax', ['conc', testCase.code]],
          ['ast', prettyPrintAST(L, expr)],
          exception ?
            ['exception', ['conc', prettyPrintValue(L, exception.toString())]] :
            ['actual',    ['conc', prettyPrintValue(L, actualValue)]],
          ['expected',
             testCase.shouldThrow ?
               ['span', 'an exception'] :
               ['conc', prettyPrintValue(L, testCase.expected)]]]]
    );
    tests.appendChild(node);
    if (exception && testCase.shouldThrow && !(exception instanceof TODO) ||
        !exception && equals(actualValue, testCase.expected)) {
      numPasses++;
    } else {
      node.className = 'failed';
    }
  }

  tests.insertBefore(
    toDOM(
      ['testStats',
        ['numPasses', numPasses],
        ['numTests', numTests]]
    ),
    tests.firstChild
  );

  var scripts = document.getElementsByTagName( 'script' );
  var thisScriptTag = scripts[ scripts.length - 1 ];
  thisScriptTag.parentNode.appendChild(tests);
}

