var express = require("express");//hola 
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

//2020 august START: user story 1 : token security
var jwt = require('jsonwebtoken'); //authentication 2020 August: user story 1 token
var config = require('./configs/config');//authentication 2020 August: user story 1 token
//2020 august START : user story 1 : token security.


var ObjectID = mongodb.ObjectID;


var BANWIRE_COTIZACIONES_COLLECTION = "banwirecotizaciones";

var BANWIRE_COTIZACIONES_BITACORA_COLLECTION = "banwirebitacoras";

var BANWIRE_COTIZACIONES_BITACORA_DESCUENTO_COLLECTION = "banwirebitacorasdescuento";
var BANWIRE_USUARIOS_COLLECTION = "banwireusuarios";


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

/*  "/banwireapi/traepdf"
 *    POST: creates a new robot
 */


//app.get("/banwireapi/traepdf/:cualcotizacion", function(req, res) {
app.get("/banwireapi/traepdf", function(req, res) {
  console.log("trae pdf 1 si");
  var query = { numero:"20200800007" };
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find(query).toArray(function(err, docs) {
     console.log("trae pdf 2 si");
  var cualvalue = parseInt(req.params.cualcotizacion);
//  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find({ "numero": cualvalue }, function(err, docs) {
    if (err) {
      handleError(res, err.message, "Fallo obtener cotizacion para pdf");
    } else {
        var PDFDocument = require('pdfkit');

        var pdf = new PDFDocument({        
          layout: 'landscape',
//          size: [210, 210], 
          size: [450, 350],           
          margin: 5,     
          info: {    
             Title: 'Cotizacion Banwire',
             Author: 'Youtochi 2020',
          }  
        });
      
      // Add another page//////////////////////////////////////////////////////////// Page 01
      // Scale proprotionally to the specified width
        pdf.image('si.jpg', 0, 15, {width: 300})
   .text('Proportional to width', 0, 0);
      
      
        // Add another page//////////////////////////////////////////////////////////// Page 02
        pdf.addPage()
           .fontSize(25)
           .text('Here is some vector graphics...', 100, 100);
      
            // Scale proprotionally to the specified width
        pdf.image(config.pdfpage01, 0, 15, {width: 300})
   .text('Proportional to width', 0, 0);

              // Add another page//////////////////////////////////////////////////////////// Page 02
        pdf.addPage()
           .fontSize(25)
           .text('Here is some vector graphics...', 100, 100);
      
            // Scale proprotionally to the specified width
        pdf.image(config.pdfpage02, 0, 15, {width: 300})
   .text('Proportional to width', 0, 0);

      
      // Add another page//////////////////////////////////////////////////////////// Page 03
        pdf.addPage()
           .fontSize(25)
           .text('Here is some vector graphics...', 100, 100);
      
         // Write stuff into PDF
        pdf.moveDown()
             .fillColor('black')
             .fontSize(7)
             .text('COTIZACION BANWIRE CLIENTE PLAN PREFERENCIAL', {
               align: 'center',
               indent: 2,
               height: 2,
               ellipsis: true
             });
         

        pdf.moveDown()
             .fillColor('black')
             .fontSize(7)
             .text('Cliente', {
               align: 'center',
               indent: 2,
               height: 2,
               ellipsis: true
             });
       //display a rectangle
          pdf.rect(45, 165, 240, 22).fillAndStroke('#ddd', '#000');
          pdf.fill('#F00').stroke();
          
            docs.forEach(function(doc) {
                console.log(doc.name + " is a " + doc.category_code + " company.");
              
               var nombre = doc.name;
               var ejecutivo = doc.ejecutivo;
               var status = doc.status;        
               pdf.moveDown()
                   .fillColor('black')
                   .fontSize(8)
                   .text('NOMBRE: '+nombre+' '+ ejecutivo +' '+ status , {
                     align: 'left',
                     indent: 2,
                     height: 2,
                     ellipsis: true
               });//pdf down
               pdf.moveDown()
                   .fillColor('black')
                   .fontSize(8)
                   .text('Ejecutivo: '+ ejecutivo +' ', {
                     align: 'left',
                     indent: 2,
                     height: 2,
                     ellipsis: true
               });//pdf down

               pdf.moveDown()
                   .fillColor('black')
                   .fontSize(8)
                   .text('Estatus Cotizacion: '+ status , {
                     align: 'left',
                     indent: 2,
                     height: 2,
                     ellipsis: true
               });//pdf down
                 //// table with the costos
                  var costosarray = [{"art":"A","count":"0"},{"art":"B","count":"1"}];      
                  costosarray = doc.costo;
               console.log(costosarray);
        /*              
              var objectKeysArray = Object.keys(doc.costo)
                  objectKeysArray.forEach(function(objKey) {
                      var objValue = yourJsonObj[objKey]
                      console.log(objValue);
                  })
                  */
              /*
                  costosarray.forEach(function(costito) {
                        console.log(costito.mediodepago + " is a " + costito.comisionvariable + " company." +costito.comisionvariabletipo);
                        console.log(costito.mediodepago + " is a " + costito.comisionfija + " company." +costito.comisionfijatipo);

                       var mediodepago = costito.mediodepago;
                       var variablo = costito.comisionvariable;
                                      
                       var fija = costito.comisionfija;     
                                   pdf.moveDown()
                                     .fillColor('black')
                                     .fontSize(8)
                                     .text('[: '+ mediodepago + '       '+ variablo + '    '+fija , {
                                       align: 'left',
                                       indent: 2,
                                       height: 2,
                                       ellipsis: true
                                 });//pdf down                    
                  });//for each costos
                  */
            });//for each  document/cotizacion

      
              // Add another page//////////////////////////////////////////////////////////// Page 04
          pdf.addPage()
             .fontSize(25)
             .text('Here is some vector graphics...', 100, 100);
      
            // Scale proprotionally to the specified width
          pdf.image(config.pdfpage04, 0, 15, {width: 300})
     .text('Proportional to width', 0, 0);
      
            pdf.pipe(res);
            pdf.end();

          //res.status(200).json(doc);
      }//end else
  }); //end db
  });//end app get
  



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
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET');

      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true); 


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

app.use(express.json({
  type: ['application/json', 'text/plain']
}))

app.post("/banwireapi/cotizaciones", function(req, res) {
  var newCotiza = req.body;
  
  console.log("guardando datos cotizaciones 1.1");
  var quemando = JSON.stringify(newCotiza);
  console.log("guardando datos cotizaciones 1.2");
  console.log("guardando datos cotizaciones 1.3:"+quemando);
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
          
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true); 

            console.log("guardando datos cotizacion 4.4.1");  
            res.sendStatus(200);
//            res.status(200).json(doc.ops[0]);
            console.log("guardando datos cotizacion 4.4.2");    
         
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
 
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find({ "name": req.params.name }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo obtener cotizacion");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.get("/banwireapi/cotizaciones/:numero", function(req, res) {
  console.log("consulta cotizaciones por numero 1 si");
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find({ "numero": req.params.numero }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Fallo obtener cotizacion");
    } else {
      res.status(200).json(doc);
    }
  });
});

    app.get("/banwireapi/cotizacionesbynumero2/:numero/:name/:ejecutivo", function(req, res) {
      console.log("consulta cotizaciones por numero 1 si");
      var query = {};
      var algo=0;
      if(req.params.numero  !='NADA'){
         query.numero =  req.params.numero;
        console.log("consulta cotizaciones sera 1 :"+req.params.numero );
        algo =1;
      }
      if(req.params.name  !='NADA'){
         query.name =  req.params.name;
        console.log("consulta cotizaciones sera 2 :"+req.params.name);
            algo =1;
      } 
      if(req.params.ejecutivo  !='NADA'){
         query.ejecutivo =  req.params.ejecutivo;
        console.log("consulta cotizaciones sera 3 :"+req.params.ejecutivo );
            algo =1;
      } 
      if (algo ==1){
        
        var strquery =JSON.stringify(query);
        console.log("consulta cotizaciones filtrara por :"+strquery );
        db.collection(BANWIRE_COTIZACIONES_COLLECTION).find(query).toArray(function(err, docs) {
            if (err) {
              handleError(res, err.message, "Fallo obtener cotizaciones.");
            } else {
              console.log("consulta cotizaciones filtro y ok" );
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true); 

              res.status(200).json(docs);
            }
        });

      }else{
        handleError(res, "NO se pasaron filtros", "No parameters passed.");
      }

 
  
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


/*  "/banwireapi/cotizaciones"
 *    GET: finds all cotizaciones
 *    POST: creates a new cotizacion
 */

app.get("/banwireapi/cotizaciones101", function(req, res) {
  db.collection(BANWIRE_COTIZACIONES_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Fallo obtener cotizaciones.");
    } else {

          // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET');

      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true);      
      res.status(200).json(docs);
    }
  });
});



