
var mysql=require("mysql");
var url = require("url");
var constants = require("./constants.js");
var dns = require('dns');
var wait=require('wait.for');

// a utility function to write header info
function reply(response, code, results) {
	response.writeHead(code, {"Content-Type": "application/json"}); 
	response.write(JSON.stringify(results));
	response.end();
	console.log("%d", code);
}

/*
function connectdb(){
	var dbhost;
	dns.lookup(constants.host, function(err,addresses){	
		if (err) dbhost="127.0.0.1";
		else dbhost= addresses;
		db = mysql.createConnection({
			host:dbhost,
			user:constants.user,
			password:constants.password,
			database:constants.database
		});
	});
}
*/

function connectdb(){
	var dbhost;
	try{
		dbhost = wait.for(dns.lookup,constants.host);
	} catch(err){
		dbhost='127.0.0.1';
	}

	return mysql.createConnection({
		host:dbhost,
		user:constants.user,
		password:constants.password,
		database:constants.database
	});
}

function taxonomy(request, response) {
	var db=connectdb();
	db.query("SELECT * FROM taxonomy", function(err,results,fields){		
		if (err) throw err;
		reply(response, 200, results);
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
 	
 	//check params
 	if(!zipcode && !lastname1 && !specialty){
		reply(response, 204, '');
		return;
 	}

	//building the query
	var db=connectdb();

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

 	//case 1: no need to calculate zip codes at a distance
 	if (!distance || !zipcode){
 		if(zipcode)
 			if(lastname1 || gender || specialty)
 				query += " AND (Provider_Short_Postal_Code = '"+ zipcode + "')";
 			else
 				query += "(Provider_Short_Postal_Code = '" + zipcode + "')";
		query += ") limit 50";
 		
		db.query(query, function(err,results,fields){		
			if (err) throw err;
			reply(response, 200, results);
		});
		return;
	}

 	//case 2:we need to find zipcodes at a distance

 	//lets get a few zipcodes
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

			//no data
  			if (!responsestring) {	
				reply(response, 204, '');
				return;
 			}

		 	//translate json from string to array
			var responsejson = JSON.parse(responsestring);
			var length=responsejson.zip_codes.length;

			//complete the query
 			if(lastname1 || gender || specialty)
 				query += " AND ((Provider_Short_Postal_Code = '"+responsejson.zip_codes[0].zip_code+"')";
 			else
 				query += "((Provider_Short_Postal_Code = '"+responsejson.zip_codes[0].zip_code+"')";
			for (var i=1; i<length;i++){
 				query += " OR (Provider_Short_Postal_Code = '"+ responsejson.zip_codes[i].zip_code +"')";
			}
  			query += ")) limit 50";

			db.query(query, function(err,results,fields){		
				if (err) throw err;
				reply(response, 200, results);
			});
		});
	}).end();		
}

function transaction(request, response) {
	var params = url.parse(request.url,true).query; 
	var id=params.id;
 
 	//check params
 	if(!id){
		reply(response, 204, '');
		return;
 	}

	//retrieve the providers
	var query = "SELECT * FROM transactions WHERE (id = '"+id+"')";
 	var db=connectdb();
	db.query(query, function(err,results,fields){		
		if (err) throw err;

		if (results.length <= 0){
			reply(response, 204, '');
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
			if (err) throw err;
			reply(response, 200, results);
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
		reply(response, 204, '');
		return;
 	}
	
	//save the selection
	var query = "INSERT INTO transactions VALUES (DEFAULT,DEFAULT,'"+ npi1 +"','"+ npi2 +"','"+npi3 +"')";
	var db=connectdb();
 	db.query(query, function(err,results,fields){		
		if (err) throw err;

		//keep the transaction number
		var transactionid= results.insertId;
			
		//return detailed data of the selected providers
		query = "SELECT NPI,Provider_Full_Name,Provider_Full_Street, Provider_Full_City, Provider_Business_Practice_Location_Address_Telephone_Number FROM npidata2 WHERE ((NPI = '"+npi1+"')";
		if(npi2)
			query += "OR (NPI = '"+npi2+"')";
		if(npi3)
			query += "OR (NPI = '"+npi3+"')";
		query += ")";

 		db.query(query, function(err,results,fields){		
			if (err) throw err;
			
			var info=[{Transaction: transactionid}];
			info.push(results);
			reply(response, 200, info);
		});
	});
}

exports.taxonomy=taxonomy;
exports.providers=providers;
exports.shortlist=shortlist;
exports.transaction=transaction;
