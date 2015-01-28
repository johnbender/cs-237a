function prettyPrintAST(L, ast) {
  return L.prettyPrintAST ?
    L.prettyPrintAST(ast) :
    stringify(ast);
}
    
function prettyPrintValue(L, ast) {
  return L.prettyPrintValue ?
    L.prettyPrintValue(ast) :
    stringify(ast);
}

function prettyPrintJS(code) {
  return js_beautify(code);
} 

function stringify(value) {
  if (value === undefined) {
    return 'undefined';
  } else if (Number.isNaN(value)) {
    return 'NaN';
  } else {
    return JSON.stringify(value);
  }
}

function arrayEquals(xs, ys) {
  if (!(xs instanceof Array && ys instanceof Array) || xs.length !== ys.length) {
    return false;
  } else {
    for (var idx = 0; idx < xs.length; idx++) {
      if (!(equals(xs[idx], ys[idx]))) {
        return false;
      }
    }
    return true;
  }
}

function equals(x, y) {
  return x instanceof Array ? arrayEquals(x, y) : x === y;
}

function toDOM(x) {
  if (x instanceof Node) {
    return x;
  } else if (x instanceof Array) {
    var xNode = document.createElement(x[0]);
    x.slice(1).
      map(function(y) { return toDOM(y); }).
      forEach(function(yNode) { xNode.appendChild(yNode); });
    return xNode;
  } else {
    return document.createTextNode(x);
  }
}

// TODO: make this cross-browser
function load(url) {
  var req = new XMLHttpRequest();
  req.open('GET', url, false);
  try {
    req.send();
    if (req.status === 0 || req.status === 200) {
      return req.responseText;
    }
  } catch (e) {}
  throw new Error('unable to load url ' + url);
}

function loadScript(url) {
  var src = load(url);
  jQuery.globalEval(src);
}

