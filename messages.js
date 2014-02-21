var mysql=require("mysql");
var url = require("url");


var db=mysql.createConnection({
	host:'awsdb.cpcqc8qelwdl.us-west-2.rds.amazonaws.com',
	user:'awsdb',
	password:'awsawsdb',
	database:'healthylinkx'
});

function taxonomy(request, response) {
	db.query("SELECT * FROM taxonomy", function(err,results,fields){		
		if (err){
			throw err;
		}
		response.writeHead(200, {"Content-Type": "text/plain"}); 
		response.write(JSON.stringify(results));
		response.end();
	});
}

function providers(request, response) {
	var query = url.parse(request.url,true).query; 
	response.writeHead(200, {"Content-Type": "text/plain"}); 
	response.write(JSON.stringify(query));

	var zipcode=query.zipcode;
	var gender=query.gender;
	var lastname1=query.lastname1;
	var lastname2=query.lastname2;
	var lastname3=query.lastname3;
	var specialty=query.specialty;
	var distance=query.distance;

	response.write('--');
	response.write(zipcode.toString());
	response.write('--');
	response.write(JSON.stringify(gender));
	response.write('--');
	//response.write(JSON.stringify(lastname1));
	response.write('--');
	//response.write(JSON.stringify(lastname2));
	response.write('--');
	//response.write(JSON.stringify(lastname3));
	response.write('--');
	//response.write(JSON.stringify(specialty));
	response.write('--');
	//response.write(JSON.stringify(distance));
	response.write('--');

	response.end();
}
function shortlist(request, response) {
	response.writeHead(200, {"Content-Type": "text/plain"}); 
	response.write("shortlist");
	response.end();
}
function transaction(request, response) {
	response.writeHead(200, {"Content-Type": "text/plain"}); 
	response.write("transaction");
	response.end();
}

exports.taxonomy=taxonomy;
exports.providers=providers;
exports.shortlist=shortlist;
exports.transaction=transaction;
