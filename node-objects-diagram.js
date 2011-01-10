var graphviz = require('graphviz');
var fs = require('fs');
var path = require('path');
var natives = process.binding('natives');
var moduleName;
var NODE_SRC_DIR = process.argv[2]; // path to target source code like '/Users/nsy/node/src/HEAD/lib'
var regexStr = 'util\\.inherits\\(([a-zA-Z.]+), \\s*([a-zA-Z.]+)\\)';
var regex = new RegExp(regexStr);
var regexG = new RegExp(regexStr, 'g');
var withAllProperties = process.argv[3] === '-a'; //outputs all properties in public, not only Classes
var fileFormat = 'png';
var fileName = (withAllProperties ? 'node-objects-all' : 'node-objects') +'.'+fileFormat;

var moduleAttr = {
  shape: 'box',
  fontsize: 12,
  style: 'bold'
};

var classAttr = {
  shape: 'box',
  fontsize: 20,
  style: 'bold'
};

var funcAttr = {
  shape: 'plaintext',
  fontsize: 12,
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
    searchObject(graph, moduleName, require(moduleName));
    searchParent(graph, moduleName);
  }
  graph.addNode('process', moduleAttr);
  searchObject(graph, 'process', process);

  //console.log(graph.to_dot());
  graph.output(fileFormat, fileName);
})()

//モジュール配下のオブジェクトと関数を検索
function searchObject(graph, targetName, targetObj) {
  var obj, objName;

  for (objName in targetObj) {
    if (targetObj.hasOwnProperty(objName)) {
      var attr = null;
      obj = targetObj[objName];
      if (typeof obj === 'function' && isClass(objName)) {
        attr = classAttr;
      }
      else if (withAllProperties && isPublic(objName)) {
        if (typeof obj === 'function') {
          attr = funcAttr;
          objName += '()';
        }
        else {
          attr = funcAttr;
        }
      }
      if (attr) {
        var classFullName = targetName+'.'+objName;
        if (!exists(graph, classFullName)) {
          graph.addNode(quote(classFullName), attr);
        }
        graph.addEdge(quote(targetName), quote(classFullName), hasAttr)
      }
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
        //hack
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

//親クラスを再帰的に検索
/** super_だと親クラス名だけでmodule名が取得できないので断念
    super_ has only its parent class name. not sure how to get "moduleName.parentClassName".
function searchParent(obj, childName) {
  //var parentName = childName+'.'+obj.name;
  var parentName = normalize(childName, obj.name);
    if (!exists(g, parentName)) {
    g.addNode(quote(parentName), nodeAttr);
  }
  g.addEdge(quote(parentName), quote(childName), inheritAttr);

  if (obj.super_) searchParent(obj.super_, parentName);
}
**/

function isClass(objName) {
  return objName.match(/^[A-Z][a-z].+$/);
}

function isPublic(objName) {
  return !objName.match(/^_.+$/);
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
