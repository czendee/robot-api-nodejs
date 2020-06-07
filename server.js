var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var ROBOTS_COLLECTION = "robots";

var app = express();
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.PROD_MONGODB, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
 
  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});


// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}



/*  "/api/robots"
 *    GET: finds all robots
 *    POST: creates a new robot
 */

app.get("/api/robots", function(req, res) {

  console.log("trayendo datos");
  db.collection(ROBOTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/api/robots", function(req, res) {
  var newRobot = req.body;

  console.log("guardando datos");
  if (!req.body.nombre) {
    handleError(res, "Ni le atinaste", "Manda su apelativo.", 400);
  }

  db.collection(ROBOTS_COLLECTION).insertOne(newRobot, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new robot.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});