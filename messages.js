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
	var params = url.parse(request.url,true).query; 

	var gender=params.gender;
	var lastname1=params.lastname1;
	var lastname2=params.lastname2;
	var lastname3=params.lastname3;
	var specialty=params.specialty;
	var distance=params.distance;
	var zipcode=params.zipcode;
 	var zipcodes;
 	
 	//check params
 	if(!zipcode && !lastname1 && !specialty){
		response.writeHead(204, {"Content-Type": "text/plain"}); 
		response.write('not enough parameters');
		response.end();
		return;
 	}

 	//in case we need to find zipcodes at a distance
 	if (distance && zipcode){
 		//lets get a few zipcodes
 		//var queryapi = "http://zipcodedistanceapi.redline13.com/rest/GFfN8AXLrdjnQN08Q073p9RK9BSBGcmnRBaZb8KCl40cR1kI1rMrBEbKg4mWgJk7/radius.json/" + zipcode + "/" + distance + "/mile";
 		var queryapi = "/rest/GFfN8AXLrdjnQN08Q073p9RK9BSBGcmnRBaZb8KCl40cR1kI1rMrBEbKg4mWgJk7/radius.json/" + zipcode + "/" + distance + "/mile";
		var responsestring;

		var options = {
  			host: "http://zipcodedistanceapi.redline13.com",
  			path: queryapi,
  			//method: 'POST'
		};

		var req = require("http").request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				responsestring += chunk;

			});

			res.on('error', function(e) {
				throw e;
			});

		});

		req.end();		

		req.on('end', function() {
			response.writeHead(200, {"Content-Type": "text/plain"}); 
			response.write(responsestring);
			response.end();
			return;
		});

  		if (!responsestring) {	
			response.writeHead(204, {"Content-Type": "text/plain"}); 
			response.write('error on zipcodedistanceapi');
			response.end();
			return;
 		}
/*	
 		//translate json from string to array
 		$responsejson = json_decode($responsestring,true);
 		if (!$responsejson)	
 			$this->response('unable to decode json',204); // "No Content" status
 	
 		//lets prep a where condition for zip codes
 		$count=count($responsejson['zip_codes']);
 		$zipcodes = "((Provider_Short_Postal_Code = '{$responsejson['zip_codes'][0]['zip_code']}')";
 		for ($i = 1; $i<$count; $i++)
 			$zipcodes .= " OR (Provider_Short_Postal_Code = '{$responsejson['zip_codes'][$i]['zip_code']}')";
 		$zipcodes .= ")";
*/
  	}

 	//building the query string
 	var query = "SELECT NPI,Provider_Full_Name,Provider_Full_Street,Provider_Full_City FROM npidata2 WHERE (";
 	if(lastname1)
 		query += "((Provider_Last_Name_Legal_Name = '" + lastname1 + "')";
 	if(lastname2)
 		query += " OR (Provider_Last_Name_Legal_Name = '" + lastname2 + "')";
 	if(lastname3)
 		query += " OR (Provider_Last_Name_Legal_Name = '" + lastname3 + "')";
 	if(lastname1)
 		query += ")";
 	if(gender)
 		if(lastname1)
 			query += " AND (Provider_Gender_Code = '" + gender + "')";
 		else
 			query += "(Provider_Gender_Code = '" + gender + "')";
 	if(specialty)
 		if(lastname1 || gender)
 			query += " AND (Classification = '" + specialty + "')";
 		else
 			query += "(Classification = '" + specialty + "')";
 	if(zipcode && !distance)
 		if(lastname1 || gender || specialty)
 			query += " AND (Provider_Short_Postal_Code = '"+ zipcode + "')";
 		else
 			query += "(Provider_Short_Postal_Code = '" + zipcode + "')";
 	if(zipcode && distance)
 		if(lastname1 || gender || specialty)
 			query += " AND " + zipcodes;
 		else
 			query += zipcodes;
 	query += ") limit 50";
 	
 	db.query(query, function(err,results,fields){		
		if (err){
			throw err;
		}
		response.writeHead(200, {"Content-Type": "text/plain"}); 
		response.write(JSON.stringify(results));
		response.end();
	});
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
