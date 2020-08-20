var express = require("express");//hola
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

//2020 august START: user story 1 : token security
var jwt = require('jsonwebtoken'); //authentication 2020 August: user story 1 token
var config = require('./configs/config');//authentication 2020 August: user story 1 token
//2020 august START : user story 1 : token security.


var ObjectID = mongodb.ObjectID;

var ROBOTS_COLLECTION = "robots";
var MARTEROBOTS_COLLECTION = "marterobots";
var LUNAROBOTS_COLLECTION = "lunarobots";
var COMANDOSROBOTS_COLLECTION = "comandosrobots";
var ROBOTHISTORY_COLLECTION = "robothistory";
var ROBOTS_USUARIO = "usuarios";
var ROBOTS_TICKET_SALE_PRODSERV = "robots_ticket_prodserv";

var BANWIRE_COTIZACIONES_COLLECTION = "banwirecotizaciones";

var BANWIRE_COTIZACIONES_BITACORA_COLLECTION = "banwirebitacoras";

var BANWIRE_COTIZACIONES_BITACORA_DESCUENTO_COLLECTION = "banwirebitacorasdescuento";
var BANWIRE_USUARIOS_COLLECTION = "banwireusuarios";


//to use the api get/post for POS sale store
var POS_PAIS = "storesales_coountry";
var POS_TIENDA = "storesales_coontrystore";
var POS_USUARIO = "storesales_users";

var POS_PRODSERV = "storesales_coontryprodserv";

//to use the api get/post for POS loyalty points /sale store

var PAY_ISSUER_LOYALTYCARD = "loyal_IssuerBank_LoyaltyCard";

var app = express();

//2020 august : user story 1 : token security
// 1
app.set('llave', config.llave);
// 2
app.use(bodyParser.urlencoded({ extended: true }));

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

/*  "/autenticar"
 *    POST: hacer la autentication y generar el token para que los otros servicios 
 *          sean consumidos con el token  se esperan usuario y contrasena
 *    User Story 1: token
 *    2020 August
 */

app.post('/autenticar', (req, res) => {
    if(req.body.usuario === "asfo" && req.body.contrasena === "holamundo") {
  const payload = {
   check:  true
  };
  const token = jwt.sign(payload, app.get('llave'), {
   expiresIn: 1440
  });
  res.json({
   mensaje: 'AutentI saicación correcta',
   token: token
  });
    } else {
        res.json({ mensaje: "Usuario o contraseña incorrectos"})
    }
})


/*  "/autenticarusuario"
 *    POST: hacer la autentication y generar el token para que los otros servicios 
 *          sean consumidos con el token  se esperan usuario y contrasena
 *    User Story 1: token
 *    2020 August
 */

app.post('/autenticarusuario', (req, res) => {
  var resultado01 = handleCheckUsuario(res, req.body.usuario, req.body.contrasena)
  
   //if(req.body.usuario === "asfo" && req.body.contrasena === "holamundo") {
  if(resultado01 === "SI") {
       const payload = {
           check:  true
       };
       const token = jwt.sign(payload, app.get('llave'), {
           expiresIn: 1440
       });
       res.json({
           mensaje: 'AutentI saicación correcta',
           token: token
       });
    } else {
        res.json({ mensaje: "Usuario o contraseña incorrectos"})
    }
})


/*  rutasProtegidas
 *    definit las rutas y como se protegeran si es que se recibe el token de seguridad en el request
 *    User Story 1: token
 *    2020 August
 */

const rutasProtegidas = express.Router(); 
rutasProtegidas.use((req, res, next) => {
    const token = req.headers['access-token'];
 
    if (token) {
      jwt.verify(token, app.get('llave'), (err, decoded) => {      
        if (err) {
          return res.json({ mensaje: 'Token invalida' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      res.send({ 
          mensaje: 'Token no proveida.' 
      });
    }
 });


app.get('/datos', rutasProtegidas, (req, res) => {
 const datos = [
  { id: 1, nombre: "Asfo" },
  { id: 2, nombre: "Denisse" },
  { id: 3, nombre: "Carlos" }
 ];
 
 res.json(datos);
});

/*  "/api/robots"
 *    GET: finds all robots
 *    POST: creates a new robot
 */

app.get("/api/robots", function(req, res) {
  db.collection(ROBOTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      //res.status(200).json({"estatus": "si funciona"});
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

app.get("/api/robotscambialonlat/:nombre/:lat/:lon", function(req, res) {
  var updateDoc = req.body;


  db.collection(ROBOTS_COLLECTION).updateOne({name: req.params.nombre}, {$set:{ lat: req.params.lat, lon:req.params.lon}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robots lon and lat");
    } else {
      updateDoc.nombre = req.params.nombre;
      res.status(200).json(updateDoc);
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


//-----------------------------------------------ROBOTHISTORY_COLLECTION
/*  "/api/robothistory"
 *    GET: finds all robothistory
 *    POST: creates a new robothistory
 */

app.get("/api/robothistory", function(req, res) {
  db.collection(ROBOTHISTORY_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get robot history.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/robothistorypendientes/:nombre", function(req, res) {

  var query = { nombre:req.params.nombre};
  db.collection(ROBOTHISTORY_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get ROBOTHISTORY.");
    } else {
      res.status(200).json(docs);
    }
  });
});



app.post("/api/robothistory", function(req, res) {
  var newRobotHistory = req.body;
  var uno=1;
  var dos=1;
  console.log("guardando datos robotHistory 11 si");
  if (!req.body.nombre) {
    handleError(res, "Ni le atinaste", "Manda su apelativo suyo del robot.", 400);
  }
  console.log("guardando datos robotHistory 4");

  db.collection(ROBOTHISTORY_COLLECTION).insertOne(newRobotHistory, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new robotHistory.");
    } else {
     //res.status(201).json(doc.ops[0]);
    }
  });

       //ahora actualizar el lat lon del robot,para que se despliegue en la posicion correcta en el mapa

      db.collection(ROBOTS_COLLECTION).updateOne({name: req.body.nombre}, {$set:{ lat: req.body.lat, lon:req.body.lon}}, function(err, doc) {
      if (err) {
          handleError(res, err.message, "Failed to update robots lon and lat");
       } else {
         // updateDoc.nombre = req.params.nombre;
         // res.status(200).json(updateDoc);
       }
      });

   res.status(201).json(doc.ops[0]);


});

/*  "/api/robothistory/:id"
 *    GET: find robothistory by id
 *    PUT: update robothistory by id
 *    DELETE: deletes robothistory by id
 */

app.get("/api/robothistory/:id", function(req, res) {
  db.collection(ROBOTHISTORY_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get robotHistory");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/api/robothistory/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(ROBOTHISTORY_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robot history");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.get("/api/robothistorycambiaposicion/:id/:nombre/:tipo/:comandoprevio/:lat/:lon/:ano/:mes/:dia/:hora/:minuto/:segundo", function(req, res) {
  var updateDoc = req.body;






  db.collection(ROBOTHISTORY_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, {nombre:req.params.nombre,tipo: req.params.tipo,comandoprevio: req.params.comandoprevio, lat: req.params.lat, lon:req.params.lon,ano:req.params.ano, mes:req.params.mes, dia:req.params.dia, hora:req.params.hora, minuto:req.params.minuto, segundo: req.params.segundo}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robotHistory");
    } else {
      updateDoc._id = req.params.id;



      res.status(200).json(updateDoc);
    }
  });


});

app.post("/api/robothistorycambiaposicion02/", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc.id;

  db.collection(ROBOTHISTORY_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update ROBOTHISTORY");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/api/robothistory/:id", function(req, res) {
  db.collection(ROBOTHISTORY_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete ROBOTHISTORY");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});



//------------------------------------------USARIOS
/*  "/api/urobots_traetodos"
 *    GET: finds all usuarios
 *    POST: creates a new usuarios
 */

app.get("/api/urobots_traetodos", function(req, res) {
  db.collection(ROBOTS_USUARIO).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get usuarios info.");
    } else {
      res.status(200).json(docs);
    }
  });
});

//------------------------------------------ USUARIOS robots
/*  "/api/urobots_quiensoy/:id"
 
 *    GET: find quiensoy by id
 *    PUT: update quiensoy by id
 *    DELETE: deletes quiensoy by id
 */

app.get("/api/urobots_quiensoy/:id", function(req, res) {
  db.collection(ROBOTS_USUARIO).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get quiensoy");
    } else {
      res.status(200).json(doc);
    }
  });
});



//-----------------------------------------------POS COOUNTRY
/*  "/api/pos_country"
 *    GET: finds all pos_country
 *    POST: creates a new pos_country
 */

app.get("/api/pos_country", function(req, res) {
  db.collection(POS_PAIS).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get country info.");
    } else {
      res.status(200).json(docs);
    }
  });
});

//------------------------------------------POS COOUNTRY STORE
/*  "/api/pos_countrystore"
 *    GET: finds all pos_countrystore
 *    POST: creates a new pos_countrystore
 */

app.get("/api/pos_countrystore", function(req, res) {
  db.collection(POS_TIENDA).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get store info.");
    } else {
      res.status(200).json(docs);
    }
  });
});

//------------------------------------------POS USARIOS
/*  "/api/pos_traetodos"
 *    GET: finds all pos_usuarios
 *    POST: creates a new pos_usuarios
 */

app.get("/api/pos_traetodos", function(req, res) {
  db.collection(POS_USUARIO).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get usuarios info.");
    } else {
      res.status(200).json(docs);
    }
  });
});

//------------------------------------------POS USARIOS
/*  "/api/pos_quiensoy/:id"
 
 *    GET: find quiensoy by id
 *    PUT: update quiensoy by id
 *    DELETE: deletes quiensoy by id
 */

app.get("/api/pos_quiensoy/:id", function(req, res) {
  db.collection(POS_USUARIO).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get quiensoy");
    } else {
      res.status(200).json(doc);
    }
  });
});

//------------------------------------------POS PRODSERV
/*  "/api/pos_prodservtodos"
 *    GET: finds all pos_prodserv
 *    POST: creates a new pos_proserv
 */

app.get("/api/pos_prodservtodos", function(req, res) {
  db.collection(POS_PRODSERV).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get productoss and servicios info.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/pos_prodservtipo/:eltipo", function(req, res) {

  var query = { tipo:req.params.eltipo, readyforsale:"yes" };
  db.collection(POS_PRODSERV).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get prodserv de tipo.");
    } else {
      res.status(200).json(docs);
    }
  });
});

//-----------------------------ROBOT TICKET -Sale 
// PRODSERV   sale of robots and services
/*  "/api/robot_prodservtodos"
 *    GET: finds all pos_prodserv
 *    POST: creates a new pos_proserv
 */

app.get("/api/robot_prodservtodos", function(req, res) {
  db.collection(ROBOTS_TICKET_SALE_PRODSERV).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get productoss and servicios info.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/robot_prodservtipo/:eltipo", function(req, res) {

  var query = { tipo:req.params.eltipo, readyforsale:"yes" };
  db.collection(ROBOTS_TICKET_SALE_PRODSERV).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get prodserv de tipo.");
    } else {
      res.status(200).json(docs);
    }
  });
});


/*  "/api/marterobots"
 *    GET: finds all robots in marte
 *    POST: creates a new robot in marte
 */

app.get("/api/marterobots", function(req, res) {
  db.collection(MARTEROBOTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/marterobots01", function(req, res) {

  var query = { tipo: "muchasbolas" };
  db.collection(MARTEROBOTS_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

 
app.post("/api/marterobots", function(req, res) {
  var newRobot = req.body;
  console.log("guardando datos 10 si");
  if (!req.body.name) {
    handleError(res, "Ni le atinaste", "Manda su apelativo.", 400);
  }
  console.log("guardando datos 3");

  db.collection(MARTEROBOTS_COLLECTION).insertOne(newRobot, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new robot.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});


/*  "/api/marterobots/:id"
 *    GET: find robot by id
 *    PUT: update robot by id
 *    DELETE: deletes robot by id
 */

app.get("/api/marterobots/:name", function(req, res) {
  console.log("consulta uno 12 si");
  db.collection(MARTEROBOTS_COLLECTION).find({ "name": "balderillas" }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get robot");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/api/marterobots/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(MARTEROBOTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robot");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/api/marterobots/:id", function(req, res) {
  db.collection(MARTEROBOTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete robot");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

app.get("/api/marterobotscambialonlat/:nombre/:lat/:lon", function(req, res) {
  var updateDoc = req.body;


  db.collection(MARTEROBOTS_COLLECTION).updateOne({name: req.params.nombre}, {$set:{ lat: req.params.lat, lon:req.params.lon}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robots lon and lat");
    } else {
      updateDoc.nombre = req.params.nombre;
      res.status(200).json(updateDoc);
    }
  });
});


//////////////////////////luna


/*  "/api/linarobots"
 *    GET: finds all robots in luna
 *    POST: creates a new robot un luna
 */

app.get("/api/lunarobots", function(req, res) {
  db.collection(LUNAROBOTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/lunarobots01", function(req, res) {

  var query = { tipo: "muchasbolas" };
  db.collection(LUNAROBOTS_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

 
app.post("/api/lunarobots", function(req, res) {
  var newRobot = req.body;
  console.log("guardando datos 10 si");
  if (!req.body.name) {
    handleError(res, "Ni le atinaste", "Manda su apelativo.", 400);
  }
  console.log("guardando datos 3");

  db.collection(LUNAROBOTS_COLLECTION).insertOne(newRobot, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new robot.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});


/*  "/api/lunarobots/:id"
 *    GET: find robot by id
 *    PUT: update robot by id
 *    DELETE: deletes robot by id
 */

app.get("/api/lunarobots/:name", function(req, res) {
  console.log("consulta uno 12 si");
  db.collection(LUNAROBOTS_COLLECTION).find({ "name": new ObjectID(req.params.name) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get robot");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/api/lunarobots/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(LUNAROBOTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robot");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/api/lunarobots/:id", function(req, res) {
  db.collection(LUNAROBOTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete robot");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

app.get("/api/lunarobotscambialonlat/:nombre/:lat/:lon", function(req, res) {
  var updateDoc = req.body;


  db.collection(LUNAROBOTS_COLLECTION).updateOne({name: req.params.nombre}, {$set:{ lat: req.params.lat, lon:req.params.lon}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update robots lon and lat");
    } else {
      updateDoc.nombre = req.params.nombre;
      res.status(200).json(updateDoc);
    }
  });
});



//////////////////////////payment modules: 
///////////////////COUNTER/ACQ/PAYSCHEMA/ISSSUER


/*  "/api/pau_loyaltycard"
 *    GET: finds all loyalty carda 
 *    POST: creates a loyalty card
*/

app.get("/api/pay_loyaltycard", function(req, res) {
  db.collection(PAY_ISSUER_LOYALTYCARD).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/api/pay_loyaltycard01", function(req, res) {

  var query = { tipo: "lealtad" };
  db.collection(PAY_ISSUER_LOYALTYCARD).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

 //available:{ $subtract: [ available, req.params.monto]    }


app.get("/api/pay_card_authorizepayment/:cuenta/:expyear/:expmonth/:monto/:reference", function(req, res) {
  var updateDoc = req.body;

  db.collection(PAY_ISSUER_LOYALTYCARD).updateOne({cardnumber: req.params.cuenta}, {$set:{ available: req.params.monto}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update amount");
    } else {
      updateDoc.nombre = "OK AUTHORIZED";
      res.status(200).json(updateDoc);
    }
  });
});

app.get("/api/pay_card_authorizedeposit/:cuenta/:expyear/:expmonth/:monto/:reference", function(req, res) {
  var updateDoc = req.body;

  db.collection(PAY_ISSUER_LOYALTYCARD).updateOne({cardnumber: req.params.cuenta}, {$set:{ available: req.params.monto}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update amount");
    } else {
      updateDoc.nombre = "OK AUTHORIZED with";
      res.status(200).json(updateDoc);
    }
  });
});
 
app.get("/api/pay_card_authorizewithdrawal/:cuenta/:expyear/:expmonth/:monto/:reference", function(req, res) {
  var updateDoc = req.body;

     var resultado=  handleCurrentBalance(res, "Balance", "disponible", req.params.cuenta, req.params.monto);


     var resultado=  handleSetNewAmount(res, "Balance", "disponible", req.params.cuenta, req.params.monto);

      updateDoc.nombre = "OK AUTHORIZED with06:"+resultado;
      res.status(200).json(updateDoc);


});


// Generic check the amount available in the account.
function handleCurrentBalance(res, reason, message, cuenta, monto,code) {

  var query = { cardnumber: cuenta, available: { $gt: monto }};
  db.collection(PAY_ISSUER_LOYALTYCARD).find(query).toArray(function(err, docs) {
    if (err) {
        return "NO";
    } else {
      return "SI";
    }
  });

    return "SI";



}

// Generic update  amount available in the account.
function handleSetNewAmount(res, reason, message, cuenta, monto,code) {


db.collection(PAY_ISSUER_LOYALTYCARD).updateOne({cardnumber: cuenta}, {$set:{ available: monto}}, function(err, doc) {
    if (err) {
      return "NO";
    } else {

      return "SI";
    }
  });

return "SI"


}

app.post("/api/pay_card_withdrawal", function(req, res) {

     var resultado=  handleCurrentBalance(res, "Balance", "disponible", req.body.cardnumber, req.body.available);


     var resultado=  handleSetNewAmount(res, "Balance", "disponible", req.body.cardnumber, req.body.available);

      updateDoc.nombre = "OK AUTHORIZED with06:"+resultado;
      res.status(200).json(updateDoc);

  console.log("pronabo lapotp fd x si");
  
});

/////////////////////////////////////////////////////////////////////77
//////////// BANWIRE cotizaciones
//////////////////////////////////////////////////////////////////////777
//     BANWIRE_COTIZACIONES_COLLECTION
//////////////////////////luna


/*  "/banwireapi/cotizaciones"
 *    GET: finds all cotizaciones
 *    POST: creates a new cotizacion
 */

app.get("/banwireapi/cotizaciones", function(req, res) {
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Fallo obtener cotizaciones.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/banwireapi/cotizaciones01", function(req, res) {

  var query = { mediopago: "OXXO" };
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Fallo obtener cotizaciones.");
    } else {
      res.status(200).json(docs);
    }
  });
});

 
app.post("/banwireapi/cotizaciones", function(req, res) {
  var newCotiza = req.body;
  console.log("guardando datos cotizaciones 1");
  if (!req.body.name) {
    handleError(res, "Ni le atinaste", "Manda su apelativo.", 400);
    console.log("guardando datos cotizacion 2: no se recibio el dato name, ni ningun otro");
  }else{
    console.log("guardando datos cotizacion 3.1");
    var obj = {
  	"attr1": "value1",
  	"attr2": "value2"
   };
    console.log("guardando datos cotizacion 3.2");
   newCotiza.atributo3 = obj;
    console.log("guardando datos cotizacion 3.3");
    db.collection(BANWIRE_COTIZACIONES_COLLECTION).insertOne(newCotiza, function(err, doc) {
      console.log("guardando datos cotizacion 4.1");
      if (err) {
        handleError(res, err.message, "Fallo crear nueva cotizacion.");
      } else {
        console.log("guardando datos cotizacion 4.2");
        //crete bitacora entry in the db for new cotizacion
        var resultado=  handleSetNewBitacoraEntry(res, newCotiza.numero,"NUEVACOTIZACION", "TODOS", "Nada","NUEVO");
        var newDatoscostos = newCotiza.datosdecostos;
        //var resultadodescuentofijo = handleSetNewBitacoraDescuentoEntry(res, newCotiza.numero, newCotiza.name,"FIJO", newDatoscostos.descuentovariabletipo, newDatoscostos.descuentovariable);
        var resultadodescuentofijo = handleSetNewBitacoraDescuentoEntry(res, newCotiza.numero, newCotiza.name,"FIJO", "PORCENTAJE", "2.5");
        
        
          
        //var resultadodescuentovariable = handleSetNewBitacoraDescuentoEntry(res, newCotiza.numero, newCotiza.name, "VARIABLE", newDatoscostos.descuentofijotipo, newDatoscostos.descuentofijo);
        var resultadodescuentovariable = handleSetNewBitacoraDescuentoEntry(res, newCotiza.numero, newCotiza.name, "VARIABLE", "MONTO", "3");
        
        //function handleSetNewBitacoraDescuentoEntry(res, paridregistro, parusuario, parfijovar, partipo,  parnuevo) {
          
        console.log("guardando datos cotizacion 4.3");
        if (resultado === "NO") {
             handleError(res, err.message, "Fallo crear bitacora nueva cotizacion.");
        } else {//success
            res.status(201).json(doc.ops[0]);
         
        }
      console.log("guardando datos cotizacion 4.5");

      }
    });
    
  }//end else
});



/*  "/banwireapi/cotizaciones"
 *    GET:  :name  finds all cotizaciones filtered by name
 *    GET:  :id  finds all cotizaciones filtered by id
 *    GET:  :id  finds all cotizaciones filtered by id
 *    POST: creates a new cotizacion
 */


app.get("/banwireapi/cotizaciones/:name", function(req, res) {
  console.log("consulta cotizaciones por nombre 1 si");
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find({ "name": new ObjectID(req.params.name) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo obtener cotizacion");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.get("/banwireapi/cotizaciones/:numero", function(req, res) {
  console.log("consulta cotizaciones por numero 1 si");
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find({ "name": new ObjectID(req.params.numero) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo obtener cotizacion");
    } else {
      res.status(200).json(doc);
    }
  });
});
//update 

app.put("/banwireapi/cotizaciones/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(BANWIRE_COTIZACIONES_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo actualizar cotizacion");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/banwireapi/cotizaciones/:id", function(req, res) {
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Fallo borrar cotizaciones");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

app.get("/banwireapi/cotizacionescambiadosdatos/:nombre/:lat/:lon", function(req, res) {
  var updateDoc = req.body;


  db.collection(BANWIRE_COTIZACIONES_COLLECTION).updateOne({name: req.params.nombre}, {$set:{ lat: req.params.lat, lon:req.params.lon}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo actualizar  lon and lat");
    } else {
      updateDoc.nombre = req.params.nombre;
      res.status(200).json(updateDoc);
    }
  });
});

//////////////////////////////////////////////////////////////////////777
//     BANWIRE_COTIZACIONES_BITACORA
//////////////////////////luna




// Generic add new bitacora entry.
function handleSetNewBitacoraEntry(res, paridregistro, partipo, campo,paranterior, parnuevo) {


   console.log("guardando datos cotizacion bitacora 1");
    var objbitacora = {
            "idregistro": "20200800003",
            "idcamporegistro": "numero",
            "registrocambiado": "COTIZACION",
            "fechahora": "90000",
            "tipoevento": "creacion",
            "usuario": "yotest01",
            "idcampomodificado": "TODOS",
            "valoranterior": "nada",
            "valornuevo": "nuevo"
   };
   console.log("guardando datos cotizacion bitacora 2");  
  objbitacora.idregistro = paridregistro;
  objbitacora.idcampomodificado = campo;
  objbitacora.tipoevento = partipo;
  objbitacora.valoranterior = paranterior;
  objbitacora.valornuevo = parnuevo;
  

   
  console.log("guardando datos cotizacion bitacora 3");
    db.collection(BANWIRE_COTIZACIONES_BITACORA_COLLECTION).insertOne(objbitacora, function(err, doc) {
      if (err) {
//           handleError(res, err.message, "Fallo crear bitacora nueva cotizacion.");
        return "NO";
      } else {

        return "SI";
      }
    });

return "SI"


}

/*  "/banwireapi/bitacoras"
 *    GET: finds all bitacoras
 */

app.get("/banwireapi/bitacoras", function(req, res) {
  db.collection(BANWIRE_COTIZACIONES_BITACORA_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Fallo obtener bitacoras.");
    } else {
      res.status(200).json(docs);
    }
  });
});


/*  "/banwireapi/bitacoras"
 *    GET:  :name  finds all bitacoras filtered by idregistro
 *    GET:  :id  finds all bitacoras filtered by registrocambiado
 */



app.get("/banwireapi/bitacoras/:idregistro", function(req, res) {
  console.log("consulta bitacoras por registrocambiado 1 si");
  db.collection(BANWIRE_COTIZACIONES_BITACORA_COLLECTION).find({ "idregistro": new ObjectID(req.params.idregistro) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo obtener bitacora");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.get("/banwireapi/bitacoras/:registrocambiado", function(req, res) {
  console.log("consulta bitacoras por registrocambiado 1 si");
  db.collection(BANWIRE_COTIZACIONES_BITACORA_COLLECTION).find({ "registrocambiado": new ObjectID(req.params.registrocambiado) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo obtener bitacoras");
    } else {
      res.status(200).json(doc);
    }
  });
});




//////////////////////////////////////////////////////////////////////777
//     BANWIRE_COTIZACIONES_BITACORA_DESCUENTO_COLLECTION
//////////////////////////luna



// Generic add new bitacora descuentos entry.
function handleSetNewBitacoraDescuentoEntry(res, paridregistro, parusuario, parfijovar, partipo,  parnuevo) {


     console.log("guardando datos cotizacion descuento bitacora 1");
      var objbitacora = {
              "idregistro": "20200800003",
              "fechahora": "90000",
              "usuario": "test01",
              "tipo": "PORCENTAJE",
              "usuario": "yotest01",
              "tipofijovariable": "FIJO",
              "valornuevo": "nuevo"
     };
     console.log("guardando datos cotizacion bitacora descuento 2");  
    objbitacora.idregistro = paridregistro;
    objbitacora.usuario = parusuario;
    objbitacora.tipo = partipo;
    objbitacora.tipofijovariable = parfijovar;
    objbitacora.valornuevo = parnuevo;


   
    console.log("guardando datos cotizacion bitacora  descuento 3");
    db.collection(BANWIRE_COTIZACIONES_BITACORA_DESCUENTO_COLLECTION).insertOne(objbitacora, function(err, doc) {
      if (err) {
//           handleError(res, err.message, "Fallo crear bitacora nueva cotizacion.");
        return "NO";
      } else {

        return "SI";
      }
    });

    return "SI"


}

/*  "/banwireapi/bitacorasdescuento"
 *    GET: finds all bitacoras de descuentos
 */

app.get("/banwireapi/bitacorasdescuento", function(req, res) {
  db.collection(BANWIRE_COTIZACIONES_BITACORA_DESCUENTO_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Fallo obtener bitacoras descuento.");
    } else {
      res.status(200).json(docs);
    }
  });
});



/////////////////////////////////////////////////////////////////////77
//////////// BANWIRE usuarios
//////////////////////////////////////////////////////////////////////777
//     BANWIRE_USUARIOS_COLLECTION
//////////////////////////luna


/*  "/banwireapi/usuarios"
 *    GET: finds all usuarios
 *    POST: creates a new usuario
 */

app.get("/banwireapi/usuarios", function(req, res) {
  db.collection(BANWIRE_USUARIOS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Fallo obtener usuarios.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get("/banwireapi/usuariosactivos", function(req, res) {

  var query = { estatus: "ACTIVO" };
  db.collection(BANWIRE_USUARIOS_COLLECTION).find(query).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Fallo obtener usuarios.");
    } else {
      res.status(200).json(docs);
    }
  });
});

 
app.post("/banwireapi/usuarios", function(req, res) {
  var newCotiza = req.body;
  console.log("guardando datos usuario 1");
  if (!req.body.name) {
    handleError(res, "Ni le atinaste", "Manda su apelativo.", 400);
    console.log("guardando datos cotizacion 2: no se recibio el dato name, ni ningun otro");
  }else{
    console.log("guardando datos usuario 3.1");
    db.collection(BANWIRE_USUARIOS_COLLECTION).insertOne(newCotiza, function(err, doc) {
      console.log("guardando datos usuario 4.1");
      if (err) {
        handleError(res, err.message, "Fallo crear nueva usuario.");
      } else {
            res.status(201).json(doc.ops[0]);        
      }
    });
    
  }//end else
});



/*  "/banwireapi/usuarios"
 *    GET:  :numero  finds all usuarios filtered by name
 */


app.get("/banwireapi/cotizaciones/:usuario", function(req, res) {
  console.log("consulta usuario por numero 1 si");
  db.collection(BANWIRE_USUARIOS_COLLECTION).find({ "usuario": new ObjectID(req.params.usuario) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo obtener usuario");
    } else {
      res.status(200).json(doc);
    }
  });
});


// Generic add new bitacora entry.
function handleCheckUsuario(res, userio, contrasena) {

   var respuesta ="NO";
   console.log("handleCheckUsuario 1");
   console.log("handleCheckUsuario  usuario:"+userio);
   console.log("handleCheckUsuario pass:"+contrasena);
    db.collection(BANWIRE_USUARIOS_COLLECTION).find({ "usuario": userio  }, function(err, doc) {
      console.log("handleCheckUsuario 2");
      if (err) {
        console.log("handleCheckUsuario 3 no");
        respuesta = "NO";
      } else {
        console.log("handleCheckUsuario 4  si");
        respuesta = "SI";
      }
  });
console.log("handleCheckUsuario 5");
return respuesta;


}
