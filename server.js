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

var MAX_UPLOAD_SIZE=1460000;
http.createServer(function(req, res) {
    if(req.url=='/'){
      fs.exists('TTFRender/char.txt', function(exists){
        res.writeHead(200, {
          'content-type': 'text/html'
        });
        res.end(
          '<span>Someone is generating. Wait for 1 minute maybe?</span>'
        );
      });
    }
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
/*
      form.on('error', function(message) {
        console.log('throw error now!'+message);
        res.writeHead(200,{'content-type':'text/html'});
        res.end('Upload too large');
        
      });

      form.on('progress', function(bytesReceived, bytesExpected) {
        if (bytesReceived > MAX_UPLOAD_SIZE) {
            this.emit('error'); 
          res.writeHead(200,{'content-type':'text/html'});
          res.end('Upload too large');
	}
      });
    form.on('close', function(){
        res.writeHead(413,{'content-type':'text/html'});
        res.end('Upload too large');
    });
*/
        form.parse(req, function(err, fields, files) {
          if(err) {
            throw err;
          }
          var demo = fields.demo;
          var file = files.upload;
          if(file==null)
            return;
          var input = files.input;
          fs.rename(file.path, 'TTFRender/fonts/current.ttf', function (err) {
            if (err) {
              throw err;
            }
	
            //shrink ttf based on input. write the string to char.txt, read it from python run.py
            fs.rename(input.path, 'TTFRender/char.txt', function (err) {
              if(err){
                throw err;
              }
              console.log('renamed complete');

              var pychild =exec('python run.py',function(error,stdout,stderr){
                console.log(stdout);
                if ( error ) {
                  throw stderr;
                }
                //gulp after python
                var child = exec('gulp '+jobType, function( error, stdout, stderr){
                  if ( error ) {
                    throw stderr;
                  }
                  console.log('done gulping');
                  //save the font for later use
                  var time = new Date().getTime();
                  fs.rename('TTFRender/fonts/current.ttf', 'TTFRender/fonts/'+time+'.ttf', function (err,data) {
                    if (err) {
                      throw err;
                    }
                    fs.renameSync('TTFRender/char.txt','TTFRender/'+time+'.txt');
                    res.writeHead(200, {
                      'content-type': 'text/html'
                    });
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
        '<span>content file (pure text file that includes all characters you want to make font for) 包含需美化字符的纯文本文件：</span><input type="file" name="input" multiple="multiple"><br>'+
        '<span>TTF file TTF格式字体文件：</span><input type="file" name="upload" multiple="multiple"><br>'+
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
