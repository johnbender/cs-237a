// Poor man's test harness

var jsEval = eval;

function tests(/* testCase1, testCase2, ... */) {
  var numTests = arguments.length;
  var numPasses = 0;
  var tests = toDOM(['testCases']);

  for (var idx = 0; idx < arguments.length; idx++) {
    var testCase = arguments[idx];
    var actualValue;
    var exception = undefined;
    try {
      actualValue = jsEval(testCase.code);
    } catch (e) {
      exception = e;
    }
    var node = toDOM(
      ['testCase',
        ['details',
          ['summary', testCase.name],
          ['syntax', ['conc', testCase.code]],
          exception ?
            ['exception', ['conc', prettyPrintValue(exception.toString())]] :
            ['actual',    ['conc', prettyPrintValue(actualValue)]],
          ['expected',
             testCase.shouldThrow ?
               ['span', 'an exception'] :
               ['conc', prettyPrintValue(testCase.expected)]]]]
    );
    tests.appendChild(node);
    if (exception && testCase.shouldThrow ||
        !exception && !testCase.shouldThrow && equals(actualValue, testCase.expected)) {
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

