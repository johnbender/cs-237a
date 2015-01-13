// Poor man's test harness

function tests(L /* , testCase1, testCase2, ... */) {
  var numTests = arguments.length - 1;
  var numPasses = 0;
  var tests = toDOM(['testCases']);

  for (var idx = 1; idx < arguments.length; idx++) {
    var testCase = arguments[idx];
    var expr;
    var actualValue;
    try {
      expr = L.fromString(testCase.code);
      actualValue = L.evalAST(expr);
    } catch (e) {
      console.log('uh-oh while running test case "' + testCase.name + '":');
      console.log('  ', e.message);
      console.log('  ', e);
      actualValue = e.toString();
    }
    var node = toDOM(
      ['testCase',
        ['details',
          ['summary', testCase.name],
          ['syntax', ['conc', testCase.code]],
          ['ast', prettyPrintAST(L, expr)],
          ['actual', ['conc', prettyPrintValue(L, actualValue)]],
          ['expected', ['conc', prettyPrintValue(L, testCase.expected)]]]]
    );
    tests.appendChild(node);
    if (!equals(actualValue, testCase.expected)) {
      node.className = 'failed';
    } else {
      numPasses++;
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

