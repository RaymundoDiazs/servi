const express = require('express');
const app = express();
const PORT = 5000;
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

app.use(cors({origin: 'http://localhost:5173', credentials: true}));
app.use(express.json());
const multer = require('multer');

const storage = multer.diskStorage({
  destination: '../client/src/assets',
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
    tipo: req.session.tipo
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
