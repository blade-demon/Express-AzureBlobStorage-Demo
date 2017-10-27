var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var azure = require('azure-storage');
process.env.AZURE_STORAGE_ACCOUNT = "storeapp";
process.env.AZURE_STORAGE_ACCESS_KEY = "cwzlYfEC+rSZRmt2ywr4GqVKytXsMvh/a6bIgH2zzlYLu5BLa2fvqMw1fHHkrEEugUlLlhBmik+GRQG4TpUtpQ==";
process.env.AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=storeapp;AccountKey=cwzlYfEC+rSZRmt2ywr4GqVKytXsMvh/a6bIgH2zzlYLu5BLa2fvqMw1fHHkrEEugUlLlhBmik+GRQG4TpUtpQ==;EndpointSuffix=core.chinacloudapi.cn";

var blobSvc = azure.createBlobService();

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);


// https://storeapp.blob.core.chinacloudapi.cn/images/bjork-live.jpg
doSomething();


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


function doSomething() {
    createContainer(function(error, result) {
        if (!error) {
            console.log(result);
        }
    });
}

function createContainer(cb) {
    blobSvc.createContainerIfNotExists('images', { publicAccessLevel: 'blob' }, function(error, result, response) {
        if (!error) {
            if (result) {
                cb(null, "容器已创建");
            } else {
                cb(null, "容器已存在");
            }
        } else {
            cb(error);
        }
    });
}

// 上传文件
function UploadFile(container, blobname, filename) {
    blobSvc.createBlockBlobFromLocalFile(container, blobname, filename, function(error, result, response) {
        if (!error) {
            // file uploaded
            console.log("uploaded", result.isSuccessful);
        }
    });
}

// 删除文件
function deleteFile(container, blobname) {
    blobSvc.deleteBlob(container, blobname, function(error, result) {
        if (!error) {
            console.log("Blob deleted result:", result.statusCode);
        } else {
            console.log({ errCode: error.statusCode, errMsg: error.message });
        }
    });
}

module.exports = app;