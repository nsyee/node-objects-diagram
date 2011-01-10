Node.js Object Diagram Generator.

# Requirements

* node v0.3.4+
* [Node.js GraphViz](https://github.com/glejeune/node-graphviz) (this depends on [GraphViz](http://www.graphviz.org/). You need install it previously.)

# Installation and How to generate a diagram.

	$git clone git://github.com/nsyee/node-objects-diagram.git
	$cd node-objects-diagram
	# set a path to sourcecode. then this outputs class objects on diagram (node-objects.png)
	$node node-objects-diagram.js /Users/nsy/node/src/0.3.4/lib
	# outputs all properties in public (node-objects-all.png)
	$node node-objects-diagram.js /Users/nsy/node/src/0.3.4/lib -a

# License
This application is licensed under the MIT license exclude above modules and libraries.

# TODO
show properties of class objects. clean up dirty and silly codes.
