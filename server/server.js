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
const e = require('express');

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
    database: 'serviv4',
    user: 'postgres',
    password: '3166',
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
  // console.log(req.session)
  res.json({ message: 'TEST DE SESIÓN :D, SI VES ESTO HAY UNA SESIÓN ACTIVA, LA SESIÓN EXPIRARÁ EN '+req.session.cookie.expires.getHours()+" HORAS",
    tipo: req.session.tipo,
    correo: req.session.correo,
    user_id: req.session.user_id,
    expires: req.session.cookie.expires,
    info: req.session.info
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

// fetch a los periodos
app.get('/periodos', (req, res) => {
  db.any(`
SELECT 
  a.*, 
  p.nombre,
  p.img,
  p.tipo 
FROM 
  momentos_periodo a
JOIN 
  periodo_academico p ON p.periodo_id = a.periodo_id
WHERE a.fecha_inicio > NOW()
`)
  .then((data) => res.json(data))
  .catch((error) => console.log('ERROR:', error));
})

// login
app.post('/login', upload.none(), async (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password)
  try {
    const data = await db.oneOrNone("SELECT * FROM public.user WHERE correo=$1", [username]);
    if (!data) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }
    if (data.contrasena !== password) {
      return res.status(401).send({ message: 'Invalid email/password' });
    }
    req.session.user_id = data.user_id;
    req.session.tipo = data.tipo;
    req.session.correo = data.correo;
    req.session.message = 'Session created!';
    if (req.session.tipo === 'osf') {
      const osf = await db.oneOrNone(`SELECT * FROM osf WHERE user_id = $1`, [data.user_id]);
      if (osf) {
        if (osf.tipo === 'institucional') {
          const info = await db.oneOrNone(`SELECT osf_id FROM osf_institucional WHERE osf_id = $1`, [osf.osf_id]);
          req.session.info = info;
        } else if (osf.tipo === 'alumno') {
          // Aquí puedes agregar lógica para osf tipo alumno si es necesario
        }
      }
    }
    req.session.save(function (err) {
      if (err) return next(err);
      res.send(req.session);
    });
  } catch (error) {
    console.log('ERROR: ', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

app.post('/projects/newProject', upload.none(), async (req, res) => {
  try {
    if (!req.session.info || !req.session.info.osf_id) {
      return res.status(401).json({ error: 'No OSF session info found' });
    }
    const raw = req.body;
    const osf = req.session.info.osf_id;
    const proyecto = {
      nombre_coordinador: raw.nombre_coordinador,
      numero_coordinador: raw.numero_coordinador,
      nombre: raw.nombre,
      problema_social: raw.problema_social,
      tipo_vulnerabilidad: raw.tipo_vulnerabilidad,
      rango_edad: JSON.parse(raw.rango_edad),
      zona: raw.zona,
      num_beneficiarios: Number(raw.num_beneficiarios),
      objetivo_general: raw.objetivo_general,
      ods: JSON.parse(raw.ods),
      lista_actividades_alumnos: raw.lista_actividades_alumnos,
      producto_a_entregar: raw.producto_a_entregar,
      entregable_desc: raw.entregable_desc,
      medida_impacto_social: raw.medida_impacto_social,
      modalidad: raw.modalidad,
      modalidad_desc: raw.modalidad_desc,
      carreras: JSON.parse(raw.carreras),
      competencias: raw.competencias,
      direccion: raw.direccion,
      enlace_maps: raw.enlace_maps,
      valor_promueve: raw.valor_promueve,
      surgio_unidad_de_formacion: raw.surgio_unidad_de_formacion,
      pregunta_descarte: raw.pregunta_descarte,
      notificaciones: raw.notificaciones,
      momentos: JSON.parse(raw.momentos),
      // periodos: JSON.parse(raw.periodos),
    };
    console.log(proyecto)
    // Validación básica de datos
    if (Object.entries(proyecto).length < 0) {
      return res.status(400).json({ error: 'No hay momentos para el proyecto' });
    }
    // Ejecutar todos los inserts en paralelo y esperar a que terminen
    const inserts = Object.values(proyecto.momentos).map(e => {
      const cupo = Number(e.num);
      return db.none(`
        CALL insertar_proyecto(
          $1, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6::TEXT, $7::int4range, $8::TEXT, $9,
          $10::TEXT, $11, $12::TEXT, $13::TEXT, $14::TEXT, $15::TEXT, $16::TEXT,
          $17::TEXT, $18, $19::TEXT, $20, $21::TEXT, $22::TEXT, $23::TEXT,
          $24::TEXT, $25::TEXT, $26, $27
        );
      `, [
        osf,
        proyecto.nombre_coordinador,
        proyecto.numero_coordinador,
        proyecto.nombre,
        proyecto.problema_social,
        proyecto.tipo_vulnerabilidad,
        JSON.stringify(proyecto.rango_edad),
        proyecto.zona,
        proyecto.num_beneficiarios,
        proyecto.objetivo_general,
        proyecto.ods,
        proyecto.lista_actividades_alumnos,
        proyecto.producto_a_entregar,
        proyecto.entregable_desc,
        proyecto.medida_impacto_social,
        proyecto.modalidad,
        proyecto.modalidad_desc,
        proyecto.carreras,
        proyecto.competencias,
        cupo,
        proyecto.direccion,
        proyecto.enlace_maps,
        proyecto.valor_promueve,
        proyecto.surgio_unidad_de_formacion,
        proyecto.pregunta_descarte,
        Boolean(proyecto.notificaciones),
        e.momento_id
      ]);
    });
    await Promise.all(inserts);
    res.status(200).send('Insert exitoso');
  } catch (error) {
    console.error('Error en insert:', error);
    res.status(500).send('Error al insertar');
  }
})

app.get('/test', upload.none(), (req, res) => {
  db.any("INSERT INTO test (nombre, arreglo, arreglo_int) VALUES ('backendTest', $1, $2);", [["hola", "lol"], [1,2,3]])
  .then(() => res.status(200).send("no se rompió lol"))
  .catch((error) => console.log(error))
})

app.post('/users/alumnoNuevo', upload.none(), function(req, res){
  console.log(req.body)
  const {nombre, matricula, carrera, password, numero} = req.body;
  db.none("CALL registrar_alumno($1, $2, $3, $4, $5);", [matricula, carrera, nombre, numero, password])
  .then(() => res.status(200).send('Usuario creado'))
  .catch((error) => console.log('ERROR: ', error));
});

app.get('/users/checkMatricula/:matricula', (req, res) => {
  const {matricula} = req.params;
  db.oneOrNone("SELECT * FROM alumno WHERE alumno_id=$1", [matricula])
  .then((data) => {
      if (data != null){
          res.status(200).send(true);
      }else{
          res.status(200).send(false);
      }
  })
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
