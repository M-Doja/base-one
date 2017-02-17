const express = require('express');
const bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();
var routes = require('./router/index');

// MongoDB localhost Connection
// mongoose.connect("mongodb://localhost:27017/bookworm");

// MongoDB Production Connection
mongoose.connect(process.env.MONGOLAB_URI, function(err) {
  if (err) {
    console.log(process.env.MONGOLAB_URI);
    return console.log("Error database");
  }
  console.log("Database Connected");
});

const db = mongoose.connection;

// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// MIDDLEWARE
// * use for tracking pages
app.use(session({
  secret: "this can be whatever here",
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

/// make user ID available in templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(port, function () {
  console.log('Express app listening on port 3000');
});
