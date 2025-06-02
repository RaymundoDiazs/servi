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

// Needed for the endpoints to work with Google API
const { google } = require('googleapis');
const fs = require('fs');

// Needed for the endpoints to work with SendGrid API
// const { sendWelcomeEmail } = require('./emailService');

// Needed for the endpoints to work with Gmail API
const { sendWelcomeEmail } = require('./gmailService');

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
    password: 'yahelito346',
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
    correo: req.session.correo,
    user_id: req.session.user_id,
    expires: req.session.cookie.expires,
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

// app.post('/users/alumnoNuevo', upload.none(), function(req, res){
//   console.log(req.body)
//   const {nombre, matricula, carrera, password, numero} = req.body;
//   db.none("CALL registrar_alumno($1, $2, $3, $4, $5);", [matricula, carrera, nombre, numero, password])
//   .then(() => res.status(200).send('Usuario creado'))
//   .catch((error) => console.log('ERROR: ', error));
// });

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

// Endpoint to export projects to Google Sheets in Nacional Sheet format
app.post('/sheets/export', async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: '../env/ss-dashboard-461116-680a882160af.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1lMG8Gk2_RUWxE94hqO-d57jLc6iLqf7tWgJ5YrqhhMQ';
    const sheetName = 'Archivo Nacional';

    const exportData = await db.any(`
      SELECT 
        p.proyecto_id,
        p.nombre_proyecto,
        p.problema_social,
        p.tipo_vulnerabilidad,
        p.rango_edad,
        p.zona,
        p.numero_beneficiarios,
        p.objetivo_general,
        p.lista_actividades_alumno,
        p.producto_a_entregar,
        p.entregable_desc,
        p.medida_impacto_social,
        p.modalidad,
        p.modalidad_desc,
        p.competencias,
        p.cantidad,
        p.direccion,
        p.enlace_maps,
        p.valor_promueve,
        p.surgio_unidad_formacion,
        osf.nombre AS osf_nombre,
        oi.mision,
        oi.vision,
        oi.objetivos,
        oi.poblacion,
        oi.num_beneficiarios,
        oi.nombre_responsable,
        oi.puesto_responsable,
        oi.correo_responsable,
        oi.telefono,
        oi.pagina_web_redes,
        array_agg(DISTINCT ods.nombre) AS ods,
        array_agg(DISTINCT c.nombre_completo) AS carreras,
        mp.horas,
        mp.fecha_inicio,
        mp.fecha_final,
        pa.nombre AS periodo_nombre,
        mp.momento
      FROM proyecto p
      JOIN osf ON p.osf_id = osf.osf_id
      JOIN osf_institucional oi ON osf.osf_id = oi.osf_id
      LEFT JOIN proyecto_ods pod ON p.proyecto_id = pod.proyecto_id
      LEFT JOIN objetivos_desarrollo_sostenible ods ON pod.ods_id = ods.ods_id
      LEFT JOIN proyecto_carrera pc ON p.proyecto_id = pc.proyecto_id
      LEFT JOIN carrera c ON pc.carrera_id = c.carrera_id
      LEFT JOIN momentos_periodo mp ON p.momento_id = mp.momento_id
      LEFT JOIN periodo_academico pa ON mp.periodo_id = pa.periodo_id
      GROUP BY 
        p.proyecto_id, osf.nombre, oi.mision, oi.vision, oi.objetivos, oi.poblacion, 
        oi.num_beneficiarios, oi.nombre_responsable, oi.puesto_responsable, oi.correo_responsable, 
        oi.telefono, oi.pagina_web_redes, mp.horas, mp.fecha_inicio, mp.fecha_final, pa.nombre, mp.momento;
    `);

    const rows = exportData.map(project => {
  const periodoTipo = project.periodo_nombre.includes('Invierno') || project.periodo_nombre.includes('Verano') ? 'Intensivo' : 'Regular';
  const pmt = project.momento ? `PMT${project.momento}` : "";
  const claveMap = {
    'Intensivo': ['1069', '1070', '1071'],
    'Regular': ['1065', '3041', '1066', '1067', '1068', '1058']
  };
  const clave = claveMap[periodoTipo][(project.momento || 1) - 1] || '';
  const claveMateria = `WA${clave}`;
  const fechaImplementacion = `${new Date(project.fecha_inicio).toLocaleDateString('es-MX')} al ${new Date(project.fecha_final).toLocaleDateString('es-MX')}`;
  const modalidadMap = {
    'presencial': 'PSP | Proyecto Solidario Presencial',
    'en línea': 'CLIN | Proyecto Solidario Línea',
    'mixto': 'CLIP | Proyecto Solidario Mixto'
  };
  const nomenclatura = `PS ${project.momento || ""} ${project.nombre_proyecto} - ${project.osf_nombre} ${project.periodo_nombre}`;

  return [
    "aramirez.lobaton@tec.mx", // Email
    "Centro-Occidente",        // Región
    "PUE",                     // Campus
    "", "",                    // CRN, Grupo
    claveMateria,              // Clave de la materia
    periodoTipo+" "+project.periodo_nombre, // Todo el periodo del año
    pmt,    // Periodo
    fechaImplementacion,       // Fecha de implementación
    project.osf_nombre,        // OSF
    `${project.mision || ""} ${project.vision || ""} ${project.objetivos || ""}`, // Misión, visión, objetivos
    project.poblacion || "",   // Población
    project.num_beneficiarios || "", // Beneficiarios OSF
    Array.isArray(project.ods) ? project.ods.filter(Boolean).join(", ") : "", // ODS OSF
    `${project.nombre_responsable || ""}, ${project.telefono || ""}, ${project.correo_responsable || ""}, ${project.puesto_responsable || ""}`, // Datos del representante
    project.correo_responsable || "", // Contacto general
    project.pagina_web_redes || "",   // Link OSF
    project.nombre_proyecto || "",    // Nombre del proyecto
    nomenclatura,                     // Nomenclatura
    "",                               // Diagnóstico previo
    project.problema_social || "",    // Problema social
    project.tipo_vulnerabilidad || "",
    project.rango_edad || "",
    "", "",                           // Otro tipo de vulnerabilidad, otro rango
    project.zona || "",
    project.numero_beneficiarios || "",
    project.objetivo_general || "",
    "",                               // Enfoque del proyecto
    Array.isArray(project.ods) ? project.ods.filter(Boolean).join(", ") : "", // ODS del proyecto
    "",                               // Otro ODS
    project.lista_actividades_alumno || "",
    project.producto_a_entregar || "",
    project.entregable_desc || "",
    project.medida_impacto_social || "",
    "", "",                           // Días de la semana, horario
    Array.isArray(project.carreras) ? project.carreras.filter(Boolean).join(", ") : "",
    project.competencias || "",
    project.cantidad || "",
    modalidadMap[project.modalidad] || "",
    project.direccion+"\n"+project.enlace_maps || "",
    "",
    `${project.horas || ""} horas`,
    project.valor_promueve || "",
    project.surgio_unidad_formacion || "",
    project.periodo_nombre || ""
  ];
});


    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!C4`,
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    res.status(200).json({
      message: '✅ Exported to Google Sheets successfully!',
      totalProjects: exportData.length,
      periods: [...new Set(exportData.map(p => p.periodo_nombre))],
      preview: exportData.slice(0, 2).map(project => ({
        nombre_proyecto: project.nombre_proyecto,
        osf_nombre: project.osf_nombre,
        modalidad: project.modalidad,
        cantidad: project.cantidad,
        periodo: project.periodo_nombre,
        zona: project.zona
      }))
    });

  } catch (error) {
    console.error('❌ Error exporting to Google Sheets:', error);
    res.status(500).json({ error: 'Failed to export to Google Sheets' });
  }
});

// Endpoint to send information to Google Sheets on Programación sheet
app.post('/sheets/export-programacion', async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: '../env/ss-dashboard-461116-680a882160af.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1lMG8Gk2_RUWxE94hqO-d57jLc6iLqf7tWgJ5YrqhhMQ';
    const sheetName = 'Programación';

    const exportData = await db.any(`
      SELECT 
        p.proyecto_id,
        p.nombre_proyecto,
        p.modalidad,
        osf.nombre AS osf_nombre,
        mp.horas,
        mp.momento,
        pa.nombre AS periodo_nombre,
        pa.tipo AS periodo_tipo
      FROM proyecto p
      JOIN osf ON p.osf_id = osf.osf_id
      JOIN momentos_periodo mp ON p.momento_id = mp.momento_id
      JOIN periodo_academico pa ON mp.periodo_id = pa.periodo_id
      ORDER BY p.proyecto_id;
    `);

    const modalidadIrisMap = {
      'presencial': '--',
      'mixto': 'CLIP',
      'en línea': 'CLIN'
    };

    const modalidadLabelMap = {
      'presencial': 'Presencial',
      'mixto': 'Mixto',
      'en línea': 'En línea'
    };

    const claveMap = {
      'Intensivo': ['1069', '1070', '1071'],
      'Regular': ['1065', '3041', '1066', '1067', '1068', '1058']
    };

    const rows = exportData.map((project, index) => {
      const periodoTipo = project.periodo_nombre.includes('Invierno') || project.periodo_nombre.includes('Verano') ? 'Intensivo' : 'Regular';
      const curso = claveMap[periodoTipo]?.[project.momento - 1] || '';
      const clave = `WA${curso}`;
      const pmt = `PMT${project.momento}`;
      const modalidadIris = modalidadIrisMap[project.modalidad] || '';
      const subcategoria = modalidadLabelMap[project.modalidad] || '';

      return [
        `${project.horas} Hrs`, // Horas
        'WA',                   // Bloque/Materia
        curso,                 // Curso
        clave,                 // Clave
        index + 1,             // Numeración
        '', '', '',                // #-Interno, CRN, GRUPO
        pmt,                   // PMT
        modalidadIris,         // Información adicional para IRIS
        subcategoria,          // Subcategoría
        project.osf_nombre,    // OSF
        project.nombre_proyecto // Proyecto
      ];
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A12`,
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    res.status(200).json({
      message: '✅ Exported to Programación sheet successfully!',
      totalProjects: exportData.length,
      preview: exportData.slice(0, 2).map((p, i) => ({
        proyecto: p.nombre_proyecto,
        osf: p.osf_nombre,
        modalidad: p.modalidad,
        horas: p.horas,
        numeracion: i + 1,
        pmt: `PMT${p.momento}`
      }))
    });

  } catch (error) {
    console.error('❌ Error exporting to Programación sheet:', error);
    res.status(500).json({ error: 'Failed to export to Programación sheet' });
  }
});

// Endpoint to register a new student and send a welcome email
app.post('/users/alumnoNuevo', upload.none(), async function(req, res){
  const { nombre, matricula, carrera, password, numero } = req.body;
  try {
    await db.none("CALL registrar_alumno($1, $2, $3, $4, $5);", [matricula, carrera, nombre, numero, password]);

    const email = `${matricula}@tec.mx`;
    await sendWelcomeEmail(email, nombre);
    // await sendWelcomeEmail('dextroc346.d3@gmail.com', nombre);

    res.status(200).send('Usuario creado y correo enviado');
  } catch (error) {
    console.log('ERROR: ', error);
    res.status(500).send('Error al registrar al alumno');
  }
});
