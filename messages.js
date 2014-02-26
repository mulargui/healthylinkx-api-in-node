var mysql=require("mysql");
var url = require("url");
var constants = require("./constants.js");

var db=mysql.createConnection({
	host:constants.host,
	user:constants.user,
	password:constants.password,
	database:constants.database
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
	var calculate_distance=0;
 	if (distance && zipcode){

		calculate_distance=1;

 		//lets get a few zipcodes
 		//var queryapi = "http://zipcodedistanceapi.redline13.com/rest/GFfN8AXLrdjnQN08Q073p9RK9BSBGcmnRBaZb8KCl40cR1kI1rMrBEbKg4mWgJk7/radius.json/" + zipcode + "/" + distance + "/mile";
 		var queryapi = "/rest/GFfN8AXLrdjnQN08Q073p9RK9BSBGcmnRBaZb8KCl40cR1kI1rMrBEbKg4mWgJk7/radius.json/" + zipcode + "/" + distance + "/mile";
		var responsestring="";

		var options = {
  			host: "zipcodedistanceapi.redline13.com",
  			path: queryapi
 		};

		var req = require("http").request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				responsestring += chunk;
			});

			res.on('error', function(e) {
				throw e;
			});
			

			res.on('end', function() {
				calculate_distance=0;

				//no data
  				if (!responsestring) {	
					response.writeHead(200, {"Content-Type": "text/plain"}); 
					response.write('error on zipcodedistanceapi');
					response.end();
					return;
 				}

		 		//translate json from string to array
				var responsejson = JSON.parse(responsestring);
				response.writeHead(200, {"Content-Type": "text/plain"}); 
				response.write("length:"+responsejson.zip_codes.length+ "----");
				response.write("first:"+responsejson.zip_codes[0].zip_code+ "----");
				response.write(JSON.stringify(responsejson));
				response.end();
/*
 		zipcodes = "((Provider_Short_Postal_Code = '"+zipcode+"')";
  		zipcodes += ")";

 		//lets prep a where condition for zip codes
 		$count=count($responsejson['zip_codes']);
 		zipcodes = "((Provider_Short_Postal_Code = '{$responsejson['zip_codes'][0]['zip_code']}')";
 		zipcodes = "((Provider_Short_Postal_Code = '"+zipcode+"')";
 		for ($i = 1; $i<$count; $i++)
 			zipcodes += " OR (Provider_Short_Postal_Code = '{$responsejson['zip_codes'][$i]['zip_code']}')";
  		zipcodes += ")";
*/
			});
		}).end();		
  	}

	//wait till the distance rest api responds
	if (calculate_distance) return;
 	
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

function transaction(request, response) {
	var params = url.parse(request.url,true).query; 
	var id=params.id;
 
 	//check params
 	if(!id){
		response.writeHead(204, {"Content-Type": "text/plain"}); 
		response.write('no ID');
		response.end();
		return;
 	}

	//retrieve the providers
	var query = "SELECT * FROM transactions WHERE (id = '"+id+"')";
 	db.query(query, function(err,results,fields){		
		if (err){
			throw err;
		}

		if (results.length <= 0){
			response.writeHead(204, {"Content-Type": "text/plain"}); 
			response.write('no ID records');
			response.end();
			return;
 		}

		//get the providers
		var npi1 = results[0].NPI1;
		var npi2 = results[0].NPI2;
		var npi3 = results[0].NPI3;
	
		//get the details of the providers
		query = "SELECT NPI,Provider_Full_Name,Provider_Full_Street, Provider_Full_City, Provider_Business_Practice_Location_Address_Telephone_Number FROM npidata2 WHERE ((NPI = '"+npi1+"')";
		if(npi2)
			query += "OR (NPI = '"+npi2+"')";
		if(npi3)
			query += "OR (NPI = '"+npi3+"')";
		query += ")";

 		db.query(query, function(err,results,fields){		
			if (err){
				throw err;
			}
			response.writeHead(200, {"Content-Type": "text/plain"}); 
			response.write(JSON.stringify(results));
			response.end();
		});
	});
}

function shortlist(request, response) {
	var params = url.parse(request.url,true).query; 
	var npi1 = params.NPI1;
	var npi2 = params.NPI2;
	var npi3 = params.NPI3;

 
 	//check params
 	if(!npi1){
		response.writeHead(204, {"Content-Type": "text/plain"}); 
		response.write('no NPI');
		response.end();
		return;
 	}
	
	//save the selection
	var query = "INSERT INTO transactions VALUES (DEFAULT,DEFAULT,'"+ npi1 +"','"+ npi2 +"','"+npi3 +"')";
 	db.query(query, function(err,results,fields){		
		if (err){
			throw err;
		}

		var reply=[{transaction: results.insertId}];
			
		//return detailed data of the selected providers
		query = "SELECT NPI,Provider_Full_Name,Provider_Full_Street, Provider_Full_City, Provider_Business_Practice_Location_Address_Telephone_Number FROM npidata2 WHERE ((NPI = '"+npi1+"')";
		if(npi2)
			query += "OR (NPI = '"+npi2+"')";
		if(npi3)
			query += "OR (NPI = '"+npi3+"')";
		query += ")";

 		db.query(query, function(err,results,fields){		
			if (err){
				throw err;
			}
			
			reply.push(results);
			
			response.writeHead(200, {"Content-Type": "text/plain"}); 
			response.write(JSON.stringify(reply));
			response.end();
		});
	});
}

exports.taxonomy=taxonomy;
exports.providers=providers;
exports.shortlist=shortlist;
exports.transaction=transaction;
