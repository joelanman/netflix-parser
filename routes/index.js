var  request = require('request'),
	 url = require('url'),
	 $ = require('../lib/jquery'),
	 jsdom = require('jsdom'),
	 util = require('util'),
	 fs = require('fs'),
	 querystring = require('querystring');

if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

/*
 * GET home page.
 */

var genres = {};

exports.index = function(req, res){

	var signIn = function(body){
		var $body = $(body);

		var authURL = $body.find('input[name="authURL"]').val();
		console.log("authURL: " + authURL);

		var postData = querystring.stringify({
			authURL:  authURL,
			email:    "joelanman@gmail.com",
			password: "mineral5"
		});
		
		console.log("postData: " + postData);
		
		var loginUrl = 'https://signup.netflix.com/Login';
		console.log("url: " + loginUrl);
		
		var headers = {
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"Accept-Charset": "UTF-8,*;q=0.5",
			"Accept-Encoding": "gzip,deflate,sdch",
			"Accept-Language": "en-GB,en-US;q=0.8,en;q=0.6",
			"Cache-Control":"max-age=0",
			"Connection":"keep-alive",
			"Content-Length":"102",
			"Content-Type":"application/x-www-form-urlencoded",
			"Host":"signup.netflix.com",
			"Origin":"https://signup.netflix.com",
			"Referer":"https://signup.netflix.com/Login",
			"User-Agent":"Mozilla/5.0 (X11; Linux i686) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.56 Safari/536.5"
		};

		console.log("logging in...");
		
		request.post({ uri: loginUrl, body: postData, headers: headers}, function (error, response, body) {
			console.log(error);
			console.log(response.statusCode);
			
			if(response.statusCode == 302){
			
				console.log("...success!");
				setTimeout(function(){
					getGenres();
				}, 3000);
			} else {
				console.log("...failed to log in");
				res.render('index', { body: "failed to log in" })
			}

		});
	};

	var getGenres = function(){
		var url = 'http://movies.netflix.com/WiHome';
		console.log("url: " + url);

		request(url, function (error, response, body) {
			console.log(error);
			console.log(response.statusCode);
			console.log(typeof(body));
	
			if (body.indexOf('<input type="hidden" name="authURL"') != -1){
	
				signIn(body);
				
			} else {
			
				$body = $(body);
				var $genreLinks = $body.find('#nav-edgenre .subnav-wrap a');
				
				console.log("getting genres...");
					
				$genreLinks.each(function(){
				
					$this = $(this);
					var name = $this.text();
					var href = $this.attr('href');
					var index = href.indexOf("agid=");
					if(index == -1){
						console.log("no id found");
						return;
					}
					var id = href.substring(index) +5;
					genres[name] = {
						id : id
					}
					console.log(name);
					console.log(id);
					
				});
				
				setTimeout(function(){
					getFilms();
				}, 3000);
			}
			
		})

	};
	
	var getFilms = function(){
	
		var genreURLs = [];
	
		for (genre in genres){
		
			var genreURL = 'http://movies.netflix.com/WiAltGenre?agid=' + genres[genre].id;
			
			genreURLs.push(genreURL);
					
		}
		var getGenrePage = function(i){
		
			var genreURL = genreURLs[i];
			
			console.log("url: " + genreURL);
			
					
			var headers = {
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				"Accept-Charset": "UTF-8,*;q=0.5",
				"Accept-Language": "en-GB,en-US;q=0.8,en;q=0.6",
				"Cache-Control":"max-age=0",
				"Connection":"keep-alive",
				"Host":"movies.netflix.com",
				"User-Agent":"Mozilla/5.0 (X11; Linux i686) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.56 Safari/536.5",
				"Pragma":"no-cache",
				"Referer":"http://movies.netflix.com/"
			};


			request({ uri: genreURL, headers: headers}, function (error, response, body) {
		
				//console.log(body);
				console.log(response.statusCode);
				
			
				/*
				var $body = $(body);
				
				var $movies = $body.find('.agMovie');
				
				console.log($movies.length);
				$movies.each(function(){
				
					var $this = $(this);
					
					console.log($this.text());
					
					var title = $this.find('.title').text();
					
					console.log(title);
				
				});
				*/
			
				setTimeout(function(){
					i += 1;
					//getGenrePage(i);
				}, 3000);
				
				res.render('index', {'body':body});
				
			});
		
		};
		
		getGenrePage(0);
	
	}
	
	getGenres();
};
