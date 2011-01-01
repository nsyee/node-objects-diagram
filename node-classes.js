var graphviz = require('graphviz');

var g = graphviz.digraph('G');

var nodeAttr = {
  fontname: '"FreeSans.ttf"',
  shape: 'record',
  fontsize: 24
};

var edgeAttr = {
  dir: 'back',
  color: '"#8CACBB"',
  fontsize: 24
};

g.addNode('EventEmitter', nodeAttr);
g.addNode('Stream', nodeAttr);
g.addNode('ReadableStream', nodeAttr);
g.addNode('WritableStream', nodeAttr);
g.addNode('Buffer', nodeAttr);

g.addEdge('EventEmitter', 'Stream', edgeAttr)
g.addEdge('Stream', 'ReadableStream', edgeAttr)
g.addEdge('Stream', 'WritableStream', edgeAttr)
g.addEdge('ReadableStream', 'Buffer', edgeAttr)
g.addEdge('WritableStream', 'Buffer', edgeAttr)

console.log(g.to_dot());

g.output('png', 'node-gv.png');
