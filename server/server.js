const express = require('express');
const app = express();
const PORT = 8000;
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

app.use(cors({origin: 'http://localhost:5173', credentials: true}));
app.use(express.json());
const multer = require('multer');

const storage = multer.diskStorage({
  destination: '../src/assets',
  filename: function (req, file, cb){
  cb(null, file.originalname)
  }
  });
  

const upload = multer({storage: storage});

/* CONEXIÓN A LA DB */
const pgp = require('pg-promise')();
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'servi',
    user: 'postgres',
    password: 'postgres',
    allowExitOnIdle: true
}
const db = pgp(cn);


// SESSION
app.use(session({
  store: new pgSession({
      pgPromise: db,
  }),
  secret: 'hola',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24*60*60*1000, secure: false},
}));

const authenticateSession = (req, res, next) => {
  if (req.session.user_id) {
      next();
      // res.json({message: "HOLAAA :D"})
  } else {
      res.sendStatus(401);
  }
};

app.use(express.json());

/* ENDPOINTS WUUUUUU */


// endpoint de testing para sesión :D
app.get('/session/detail', authenticateSession, (req, res) => {
  res.json({ message: 'TEST DE SESIÓN :D, SI VES ESTO HAY UNA SESIÓN ACTIVA, LA SESIÓN EXPIRARÁ EN '+req.session.cookie.expires.getHours()+" HORAS",
    tipo: req.session.tipo,
    correo: req.session.correo
  });
  // res.json({ message: String(req.session.cookie.expires.getHours())});
  // console.log( req.session.cookie.expires.getSeconds())
  // console.log(req.session)
});

// fetch a todos los proyectos
app.get('/proyectos', (req, res) => {
    db.any('SELECT * FROM proyecto')
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
})

// fetch a todas las carreras
app.get('/carreras', (req, res) => {
    db.any('SELECT * FROM carrera')
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
})

// fetch de las carreras asociadas con un proyecto :$
app.get('/proyecto_carrera/:proyecto_id', (req, res) => {
    db.any('SELECT c.nombre FROM proyecto_carrera pc JOIN carrera c ON pc.carrera_id = c.carrera_id WHERE pc.proyecto_id = $1;', [req.params.proyecto_id])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
})

// login
app.post('/login', upload.none(), (req, res) => {
  const {username, password} = req.body;
  db.oneOrNone("SELECT * FROM public.user WHERE correo=$1", [username])
  .then((data) => {
    // console.log(data);
      if (data != null){
        // console.log(data.correo, username, data.contrasena, password)
          if(data.contrasena == password){
              req.session.user_id = data.user_id;
              req.session.tipo = data.tipo;
              req.session.correo = data.correo;
              req.session.save(function (err) {
                  if (err) return next(err)
              })
              res.send(req.session);
          }else{
              res.status(401).send('Invalid email/password');
          }
      }else{
          res.status(401).send('Invalid credentials');
      }
  })
  .catch((error) => console.log('ERROR: ', error));
});

app.post('/users/alumnoNuevo', upload.none(), function(req, res){
  console.log(req.body)
  const {nombre, matricula, carrera, password, numero} = req.body;
  db.none("CALL registrar_alumno($1, $2, $3, $4, $5);", [matricula, carrera, nombre, numero, password])
  .then(() => res.status(200).send('Usuario creado'))
  .catch((error) => console.log('ERROR: ', error));
});

app.post('/users/osfNuevo', upload.array("fotos",3), function(req, res) {
  console.log(req.body);
  console.log("DEBERÍA DE HABER COSAS ACÁ")
  // console.log(req.files); // Aquí estarán los archivos subidos

  // const { nombre, matricula, carrera, password, numero } = req.body;

  // Verificar si los archivos se subieron correctamente
  // if (!req.files || req.files.length !== 3) {
  //   return res.status(400).send('Se requieren 3 fotos de las instalaciones.');
  // }

  // Obtener las rutas de los archivos subidos
  // const fotos = req.files.map(file => file.path);

  // Aquí puedes guardar las rutas de las fotos en la base de datos junto con los demás datos
  // db.none(
  //   "CALL registrar_osf($1, $2, $3, $4, $5, $6, $7, $8);",
  //   [matricula, carrera, nombre, numero, password, fotos[0], fotos[1], fotos[2]]
  // )
  // console.log("acá va algo")
  //   .then(() => res.status(200).send('Usuario OSF creado'))
  //   .catch(error => {
  //     console.log('ERROR: ', error);
  //     res.status(500).send('Error al registrar el OSF.');
  //   });
});

// logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Failed to destroy session, for some reason');
      }
      res.send('Session destroyed');
  });
});


app.listen(PORT, () => {
  console.log(`servidor escuchando en http://localhost:${PORT}`);
});


//RAY endpoints
// Actualizar proyecto: modalidad y horas


// ✅ ÚNICO endpoint válido
app.put('/api/proyectos/:id', (req, res) => {
  const proyectoId = req.params.id;
  const { modalidad, horas } = req.body;

  const modalidadesValidas = ["presencial", "en linea", "mixto"];
  if (!modalidadesValidas.includes(modalidad.toLowerCase())) {
    return res.status(400).json({ error: "Modalidad no válida" });
  }

  db.none('UPDATE proyecto SET modalidad = $1, horas = $2 WHERE proyecto_id = $3', [modalidad, horas, proyectoId])
    .then(() => res.status(200).json({ message: "Proyecto actualizado correctamente" }))
    .catch((err) => {
      console.error("❌ Error al actualizar el proyecto:", err);
      res.status(500).json({ error: "Error en la base de datos" });
    });
});
