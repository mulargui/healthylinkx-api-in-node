var messages = require("./messages"); 

var handle = {}
handle["/taxonomy"] = messages.taxonomy;
handle["/providers"] = messages.providers;
handle["/shortlist"] = messages.shortlist;
handle["/transaction"] = messages.transaction;

var http = require("http"); 
var url = require("url");

http.createServer(function (request, response) {
	//only GET queries
	if (request.method != 'GET'){
		response.writeHead(406, {"Content-Type": "text/plain"});
		response.write("406 Not Acceptable");
		response.end();
		return;
	}

	var pathname = url.parse(request.url).pathname; 
	if (typeof handle[pathname] === 'function') {
		handle[pathname](request, response); 
	} else {
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	} 
}).listen(8080);




