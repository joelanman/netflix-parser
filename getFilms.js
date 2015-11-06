var  request = require('request'),
	 url = require('url'),
	 $ = require('./lib/jquery'),
	 jsdom = require('jsdom'),
	 util = require('util'),
	 fs = require('fs'),
	 querystring = require('querystring'),
	 validator = require('validator');

sanitize = validator.sanitize;

if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

var files = fs.readdirSync("movies.netflix.com");

var movies = {};

var imgRegex =  /class=\"boxShotImg hideBobBoxshot\" alt=\"(.*?)\" src/g;
		
files.forEach(function(val, key, files){

	console.log(val);
	
	try{
		var fileData = fs.readFileSync("movies.netflix.com/" + val).toString();
	} catch (err) {
		console.log(err);
		return;
	}
	
	try{
		/*$body = $(fileData);
		
		$imgs = $body.find(".boxShotImg");
			
		console.log($imgs.length);
	
		$imgs.each(function(){
	
			$this = $(this);
		
			var name = $this.attr("alt");
		
			if(!movies[name]){
				movies[name] = 1;
			}
		
		});
		*/
		
		var match;
		
		while (match = imgRegex.exec(fileData))
		{
			var name = sanitize(match[1]).entityDecode();
			movies[name] = 1;
		}

	} catch (err) {
		console.log(err);
		return;
	}

});

movieArray = [];

for (name in movies){
	movieArray.push(name);
}

movieArray.sort();

data = movieArray.join("\n");

console.log(movieArray.length);

fs.writeFileSync("movies.txt", data);
