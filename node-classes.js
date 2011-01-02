var graphviz = require('graphviz');
var natives = process.binding('natives');
var moduleName;

var g = graphviz.digraph('G');
g.set('rankdir', 'LR');

var moduleAttr = {
  fontname: quote('FreeSans.ttf'),
  shape: 'record',
  peripheries: 2,
  fontsize: 24
};

var classAttr = {
  fontname: quote('FreeSans.ttf'),
  shape: 'record',
  fontsize: 20
};

var nodeAttr = {
  fontname: quote('FreeSans.ttf'),
  shape: 'record',
  fontsize: 20
};

var hasAttr = {
  dir: 'back',
  color: quote('#8CACBB'),
  fontsize: 20
};

var inheritAttr = {
  dir: 'back',
  color: quote('#8CACBB'),
  arrowtail: 'empty',
  fontsize: 20
};


//標準モジュールを検索
(function main() {
  for (moduleName in natives) {
    g.addNode(moduleName, moduleAttr);
    searchClass(moduleName, require(moduleName), null);
  }
  g.addNode('process', moduleAttr);
  searchClass('process', process, null);

  console.log(g.to_dot());
  g.output('png', 'node-classes.png');
})()

//モジュール配下のクラスを検索
function searchClass(targetName, targetObj) {
  var classObj, className;
  for (className in targetObj) {
    classObj = targetObj[className];
    if (typeof classObj === 'function' && isClass(classObj)) {
      var classFullName = targetName+'.'+className;
      if (!exists(g, classFullName)) {
        g.addNode(quote(classFullName), nodeAttr);
      }
      g.addEdge(quote(targetName), quote(classFullName), hasAttr)
      if (classObj.super_) {
        searchParent(classObj.super_, classFullName);
      }
    }
  }
}

//親クラスを再帰的に検索
function searchParent(obj, childName) {
  //var parentName = childName+'.'+obj.name;
  var parentName = normalize(childName, obj.name);
    if (!exists(g, parentName)) {
    g.addNode(quote(parentName), nodeAttr);
  }
  g.addEdge(quote(parentName), quote(childName), inheritAttr);

  if (obj.super_) searchParent(obj.super_, parentName);
}

function normalize(childName, parentName) {
  return ({
      'net.Server < EventEmitter': 'events.EventEmitter',
      'http.Server < Server': 'net.Server',
      'http.IncomingMessage < Stream': 'stream.Stream',
      'http.OutgoingMessage < Stream': 'stream.Stream',
      'http.ServerResponse < OutgoingMessage': 'http.OutgoingMessage',
      'http.ClientRequest < OutgoingMessage': 'http.OutgoingMessage',
      'http.Client < Stream': 'net.Stream'
  })[childName+' < '+parentName] || parentName;
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



