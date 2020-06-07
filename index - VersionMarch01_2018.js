var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var ROBOTS_COLLECTION = "robots";
var COMANDOSROBOTS_COLLECTION = "comandosrobots";


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
  db.collection(ROBOTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/robots01", function(req, res) {

  var query = { tipo: "muchasbolas" };
  db.collection(ROBOTS_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

 
app.post("/api/robots", function(req, res) {
  var newRobot = req.body;
  console.log("guardando datos 10 si");
  if (!req.body.name) {
    handleError(res, "Ni le atinaste", "Manda su apelativo.", 400);
  }
  console.log("guardando datos 3");

  db.collection(ROBOTS_COLLECTION).insertOne(newRobot, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new robot.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});


/*  "/api/robots/:id"
 *    GET: find robot by id
 *    PUT: update robot by id
 *    DELETE: deletes robot by id
 */

app.get("/api/robots/:name", function(req, res) {
  console.log("consulta uno 12 si");
  db.collection(ROBOTS_COLLECTION).find({ "name": "balderillas" }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get robot");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/api/robots/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(ROBOTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robot");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/api/robots/:id", function(req, res) {
  db.collection(ROBOTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete robot");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

//-----------------------------------------------COMANDOSROBOTS_COLLECTION
/*  "/api/comandosrobots"
 *    GET: finds all comandosrobots
 *    POST: creates a new comandorobot
 */

app.get("/api/comandosrobots", function(req, res) {
  db.collection(COMANDOSROBOTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/comandosrobotspendientes/:nombrerobot", function(req, res) {

  var query = { nombrerobot:req.params.nombrerobot, status:"creado" };
  db.collection(COMANDOSROBOTS_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/comandosrobots01", function(req, res) {

  var query = { nombrerobot: "balderillas" };
  db.collection(COMANDOSROBOTS_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/api/comandosrobots", function(req, res) {
  var newRobot = req.body;
  console.log("guardando datos comandosrobot 11 si");
  if (!req.body.nombrerobot) {
    handleError(res, "Ni le atinaste", "Manda su apelativo suyo del robot.", 400);
  }
  console.log("guardando datos comaandorobot 4");

  db.collection(COMANDOSROBOTS_COLLECTION).insertOne(newRobot, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new comandorobot.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/api/comnadosrobots/:id"
 *    GET: find comandosrobots by id
 *    PUT: update comandosrobots by id
 *    DELETE: deletes comandosrobots by id
 */

app.get("/api/comandosrobots/:id", function(req, res) {
  db.collection(COMANDOSROBOTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get comandosrobot");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/api/comandosrobots/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(COMANDOSROBOTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robot");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.get("/api/comandosrobotscambiaestatus/:id/:nombrerobot/:seq/:comando/:tiempo/:status", function(req, res) {
  var updateDoc = req.body;


  db.collection(COMANDOSROBOTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, {nombrerobot:req.params.nombrerobot,secuencia: req.params.seq,comando: req.params.comando, tiempo: req.params.tiempo, status:req.params.status}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update comandorobot");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.post("/api/comandosrobotscambiaestatus02/", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc.id;

  db.collection(COMANDOSROBOTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update comandorobot");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/api/comandosrobots/:id", function(req, res) {
  db.collection(COMANDOSROBOTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete comandosrobot");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});