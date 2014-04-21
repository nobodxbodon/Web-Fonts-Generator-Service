var express = require('express');
var fs = require('fs');
var utf8 = require('utf8');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var app = express();

//file handler
var formidable = require('formidable'),
http = require('http'),
util = require('util');
    
//convertor: ttf->woff
var gulp = require('gulp');
var ttf2woff = require('gulp-ttf2woff');
    
//run gulp
var jobType='ttf2woff';
var exec = require('child_process').exec;

app.use(bodyParser());
app.use(methodOverride());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

app.use(express.static(__dirname+'/TTFRender/fonts'));


http.createServer(function(req, res) {
    if(req.url=='/download'){
        fs.readFile('TTFRender/fonts/new_current.woff', function (err,data) {
        res.writeHead(200);
        res.write(data,"binary");
        res.end();
        })
        return;
    }
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();
        form.uploadDir = "TTFRender/fonts/";
        form.keepExtensions = true;
        form.parse(req, function(err, fields, files) {
            
            var demo = fields.demo;
            var file = files.upload;
            var input = files.input;
            fs.rename(file.path, 'TTFRender/fonts/current.ttf', function (err) {
                if (err) throw err;
	
                //shrink ttf based on input. write the string to char.txt, read it from python run.py
                fs.rename(input.path, 'TTFRender/char.txt', function (err) {
                    if(err){
                        console.log(err);
                    }
                    console.log('renamed complete');

                    var pychild =exec('python run.py',function(error,stdout,stderr){
                        console.log(stdout);
                        if ( error != null ) {
                            console.log(stderr);
                        // error handling & exit
                        }
                        //gulp after python
                        var child = exec('gulp '+jobType, function( error, stdout, stderr)
                        {
                            if ( error != null ) {
                                console.log(stderr);
                            // error handling & exit
                            }
                            console.log('done gulping');
                            fs.readFile('TTFRender/char.txt', 'utf8', function (err,data) {
                              if (err) {
                                return console.log(err);
                              }
                              res.writeHead(200, {
                                    'content-type': 'text/html'
                                });
                                //res.write('received upload:\n\n');
                                res.end('<div>Woff file generated:</div>'+
                                    '<a href="/download">rename after download</div>'
                                );
                            });
                            
	  
                        });
                    });
	
                });
            });
            
      

        });

        return;
    }

    // show a file upload form
    res.writeHead(200, {
        'content-type': 'text/html'
    });
    res.end(
        '<form action="/upload" enctype="multipart/form-data" method="post">'+
        '<span>content file:</span><input type="file" name="input" multiple="multiple"><br>'+
        '<span>ttf file:</span><input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
        );
}).listen(3000);

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, {
            error: 'Something blew up!'
        });
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', {
        error: err
    });
}
