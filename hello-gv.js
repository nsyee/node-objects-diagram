var graphviz = require('graphviz');

var g = graphviz.digraph('G');

var n1 = g.addNode('Hello', {'color': 'blue'});
n1.set('style', 'filled');

g.addNode('World');

var e = g.addEdge(n1, 'World');
e.set('color', 'red');

console.log(g.to_dot());

g.output('png', 'node-gv.png');
