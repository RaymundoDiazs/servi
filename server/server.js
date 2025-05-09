const express = require('express');
const app = express();
const PORT = 8000;
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

app.use(cors({origin: 'http://localhost:5173', credentials: true}));
app.use(express.json());
const multer = require('multer');
const { data } = require('react-router');

const storage = multer.diskStorage({
  destination: '../src/assets',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
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

// fetch de los ods :$
app.get('/ods', (req, res) => {
  db.any('SELECT * FROM objetivos_desarrollo_sostenible')
  .then((data) => res.json(data))
  .catch((error ) => console.log('ERROR:', error))
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
              req.session.message = 'Session created!';
              res.send(req.session);
          }else{
              res.status(401).send({message: 'Invalid email/password'});
          }
      }else{
          res.status(401).send({message: 'Invalid credentials'});
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

const fileFields = upload.fields([
    { name: 'logo_institucion', maxCount: 1 },
    { name: 'fotos_instalaciones', maxCount: 3 },
    { name: 'comprobante_domicilio', maxCount: 1 },
    { name: 'RFC', maxCount: 1 },
    { name: 'acta_constitutiva', maxCount: 1 },
    { name: 'ine_encargado', maxCount: 1 },
]);

app.post('/users/osfNuevo', fileFields, function (req, res) {
    console.log('Processing /users/osfNuevo request...');
    // console.log('Body:', req.body);
    // console.log('Files:', req.files);

    // // Validate required files
    // if (!req.files.logo_institucion || req.files.logo_institucion.length === 0) {
    //     return res.status(400).json({ error: 'Logo de la institución es requerido.' });
    // }
    // if (!req.files.fotos_instalaciones || req.files.fotos_instalaciones.length < 2) {
    //     return res.status(400).json({ error: 'Se requieren al menos 2 fotos de las instalaciones.' });
    // }

    const { correo, contrasena, subtipo, nombre, mision, vision, objetivo, ods, poblacion, num_beneficiarios, nombre_responsable, puesto_responsable, correo_responsable,
      telefono, direccion, horario, pagina_web_redes, correo_registro, nombre_encargado, puesto_encargado, telefono_encargado, correo_encargado} = req.body;

    const logoFileName = req.files.logo_institucion[0].filename;
    const fotosFileNames = req.files.fotos_instalaciones.map(file => file.filename);
    const comprobanteFileName = req.files.comprobante_domicilio ? req.files.comprobante_domicilio[0].filename : null;
    const rfcFileName = req.files.RFC ? req.files.RFC[0].filename : null;
    const actaFileName = req.files.acta_constitutiva ? req.files.acta_constitutiva[0].filename : null;
    const ineFileName = req.files.ine_encargado ? req.files.ine_encargado[0].filename : null;

    
    db.any(
      'SELECT registrar_osf_institucional($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28);',
    [correo, contrasena, nombre, subtipo, mision, vision, objetivo, ods, poblacion, num_beneficiarios, nombre_responsable,
      puesto_responsable, correo_responsable, telefono, direccion, horario, pagina_web_redes, correo_registro, logoFileName, 
      comprobanteFileName, rfcFileName, actaFileName, fotosFileNames, nombre_encargado, puesto_encargado, telefono_encargado,
      correo_encargado, ineFileName
    ])
        .then(() => res.status(200).send('Usuario OSF creado'))
        .catch(error => {
            console.log('ERROR: ', error);
            res.status(500).send('Error al registrar el OSF.');
        });
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
