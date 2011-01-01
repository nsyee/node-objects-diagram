var graphviz = require('graphviz');
var natives = process.binding('natives');
var moduleObj, moduleName, classObj, className;

var g = graphviz.digraph('G');

var nodeAttr = {
//  fontname: '"FreeSans.ttf"',
  shape: 'record',
  fontsize: 24
};

var inheritAttr = {
  dir: 'back',
  color: '"#8CACBB"',
  fontsize: 24
};

for (moduleName in natives) {
  g.addNode(moduleName, nodeAttr);
  var moduleObj = require(moduleName);
  //モジュール配下のクラスを検索
  for (className in moduleObj) {
    classObj = moduleObj[className];
    if (typeof classObj === 'function' && isClass(classObj)) {
      className = '"'+moduleName+'.'+className+'"';
      g.addNode(className, nodeAttr);
      g.addEdge(moduleName, className, inheritAttr)
    }
  }
}

function isClass(classObj) {
  return classObj.name && classObj.name.match(/^[A-Z].+$/);
}


console.log(g.to_dot());

g.output('png', 'node-classes.png');
