var express = require('express');
var fs = require('fs');
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


http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.uploadDir = "uploaded";
    form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
      
      var file = files.upload;
      console.log('to gulp:'+file.path);
      
      fs.rename(file.path, 'uploaded/current.ttf', function (err) {
        if (err) throw err;
        console.log('renamed complete');
      });
            
      var child = exec('gulp '+jobType, function( error, stdout, stderr) 
     {
         if ( error != null ) {
              console.log(stderr);
              // error handling & exit
         }
        console.log('done gulping');
        res.write('done gulping'); 
  
     });
    });

    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
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
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}