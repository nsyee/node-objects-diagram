var graphviz = require('graphviz');
var fs = require('fs');
var path = require('path');
var natives = process.binding('natives');
var moduleName;
var NODE_SRC_DIR = '/Users/nsy/Documents/src/node/lib';
var regexStr = 'util\\.inherits\\(([a-zA-Z.]+), \\s*([a-zA-Z.]+)\\)';
var regex = new RegExp(regexStr);
var regexG = new RegExp(regexStr, 'g');


var moduleAttr = {
  shape: 'box',
  fontsize: 12,
  style: 'bold'
};

var classAttr = {
  shape: 'box',
  fontsize: 24,
  style: 'bold'
};

var hasAttr = {
  dir: 'back',
  color: quote('#0D3349'),
  fontsize: 20
};

var inheritAttr = {
  dir: 'back',
  color: quote('#0D3349'),
  arrowtail: 'empty',
  fontsize: 20
};


//標準モジュールを検索
(function main() {
  var graph = graphviz.digraph('G');
  graph.set('rankdir', 'LR');

  for (moduleName in natives) {
    graph.addNode(moduleName, moduleAttr);
    searchClass(graph, moduleName, require(moduleName), null);
    searchParent(graph, moduleName);
  }
  graph.addNode('process', moduleAttr);
  searchClass(graph, 'process', process, null);

  //console.log(graph.to_dot());
  graph.output('png', 'node-classes.jpg');
})()

//モジュール配下のクラスを検索
function searchClass(graph, targetName, targetObj) {
  var classObj, className;
  for (className in targetObj) {
    classObj = targetObj[className];
    if (typeof classObj === 'function' && isClass(classObj)) {
      var classFullName = targetName+'.'+className;
      if (!exists(graph, classFullName)) {
        graph.addNode(quote(classFullName), classAttr);
      }
      graph.addEdge(quote(targetName), quote(classFullName), hasAttr)
    }
  }
}

//モジュール内のinherits宣言を検索して継承関係を取得
function searchParent(graph, moduleName) {
  var data = fs.readFileSync(path.join(NODE_SRC_DIR, moduleName+'.js'), 'utf-8');
  var results = data.match(regexG);
  if (results && results.length > 0) {
    results.forEach(function(result) {
      //console.log(moduleName+': '+result);
      var res = result.match(regex);
      if (res.length == 3) {
        var child = res[1].indexOf('.') > -1 ? res[1] : moduleName+'.'+res[1];
        var parent = res[2].indexOf('.') > -1        ? res[2]  :
                           'Error' === res[2]        ? 'Error' :
                           'Stream' === res[2]       ? 'stream.Stream' :
                           'EventEmitter' === res[2] ? 'events.EventEmitter' :
                           moduleName+'.'+res[2];
        if (!exists(graph, child)) {
          graph.addNode(quote(child), classAttr);
        }
        if (!exists(graph, parent)) {
          graph.addNode(quote(parent), classAttr);
        }
        graph.addEdge(quote(parent), quote(child), inheritAttr)
      }
    });
  }
}

function isClass(classObj) {
  return classObj.name && classObj.name.match(/^[A-Z].+$/);
}

function exists(graph, node) {
  var nodes = graph.nodes.items;
  nodes.forEach(function(i, n) {
    if (n === node) return true;
  });
  return false;
}

function quote(str) {
  return '"'+str+'"';
}



