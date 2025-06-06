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
const e = require('express');
const { Upload } = require('@mui/icons-material');

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
    db.any(`
SELECT 
  p.*, 
  array_remove(array_agg(c.nombre), NULL) AS carreras,
  m.horas,
  CASE 
    WHEN osf.tipo = 'institucional' THEN osf_i.logo
    ELSE NULL
  END AS logo,
  q.id_pregunta,
  q.pregunta,
  (
    SELECT COUNT(*) 
    FROM postulacion pos 
    WHERE pos.id_proyecto = p.proyecto_id 
      AND pos.estado <> 'RECHAZADX' 
      AND pos.estado <> 'DECLINADX'
  ) AS num,
  periodo.nombre AS periodo_nombre,
  m.momento
FROM proyecto p
LEFT JOIN proyecto_carrera pc ON p.proyecto_id = pc.proyecto_id
LEFT JOIN carrera c ON pc.carrera_id = c.carrera_id
LEFT JOIN momentos_periodo m ON p.momento_id = m.momento_id 
LEFT JOIN osf ON osf.osf_id = p.osf_id
LEFT JOIN osf_institucional osf_i ON osf_i.osf_id = osf.osf_id
LEFT JOIN pregunta q ON q.id_proyecto = p.proyecto_id
LEFT JOIN periodo_academico periodo ON m.periodo_id = periodo.periodo_id
WHERE (p.estado <> 'pendiente') 
GROUP BY p.proyecto_id, m.horas, osf.tipo, osf_i.logo, q.id_pregunta, q.pregunta, periodo.nombre, m.momento
ORDER BY 
  CASE 
    WHEN p.estado = 'visible' THEN 1
    WHEN p.estado = 'lleno' THEN 2
    ELSE 3
  END,
  p.proyecto_id DESC;
    `)
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
})

app.get('/proyectos/alumnos/:alumno_id', (req, res) => {
  const { alumno_id } = req.params
  console.log(alumno_id)
    db.any(`
SELECT 
  p.*, 
  array_remove(array_agg(c.nombre), NULL) AS carreras,
  m.horas,
  CASE 
    WHEN osf.tipo = 'institucional' THEN osf_i.logo
    ELSE NULL
  END AS logo,
  q.id_pregunta,
  (
    SELECT COUNT(*) 
    FROM postulacion pos 
    WHERE pos.id_proyecto = p.proyecto_id 
      AND pos.estado <> 'RECHAZADX' 
      AND pos.estado <> 'DECLINADX'
  ) AS num,
  periodo.nombre AS periodo_nombre,
  m.momento,
  (
    SELECT infos.estado 
    FROM info_postulaciones infos 
    WHERE infos.id_proyecto = p.proyecto_id 
      AND infos.id_alumno = $1
    LIMIT 1
  ) AS estado_postulacion
FROM proyecto p
LEFT JOIN proyecto_carrera pc ON p.proyecto_id = pc.proyecto_id
LEFT JOIN carrera c ON pc.carrera_id = c.carrera_id
LEFT JOIN momentos_periodo m ON p.momento_id = m.momento_id 
LEFT JOIN osf ON osf.osf_id = p.osf_id
LEFT JOIN osf_institucional osf_i ON osf_i.osf_id = osf.osf_id
LEFT JOIN pregunta q ON q.id_proyecto = p.proyecto_id
LEFT JOIN periodo_academico periodo ON m.periodo_id = periodo.periodo_id
WHERE (p.estado = 'visible' OR p.estado = 'lleno')
GROUP BY p.proyecto_id, m.horas, osf.tipo, osf_i.logo, q.id_pregunta, periodo.nombre, m.momento
ORDER BY 
  CASE 
    WHEN (
      SELECT infos.estado 
      FROM info_postulaciones infos 
      WHERE infos.id_proyecto = p.proyecto_id 
        AND infos.id_alumno = $1
      LIMIT 1
    ) IS NOT NULL THEN 0
    WHEN p.estado = 'visible' THEN 1
    WHEN p.estado = 'lleno' THEN 2
    ELSE 3
  END,
  p.proyecto_id DESC
    `, [alumno_id])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
})

app.get('/proyectos/revisar', (req, res) => {
  const { osf_id } = req.params
    db.any(`
SELECT 
  p.*, 
  array_remove(array_agg(c.nombre), NULL) AS carreras,
  m.horas,
  CASE 
    WHEN osf.tipo = 'institucional' THEN osf_i.logo
    ELSE NULL
  END AS logo,
  q.id_pregunta,
  q.pregunta,
  (
    SELECT COUNT(*) 
    FROM postulacion pos 
    WHERE pos.id_proyecto = p.proyecto_id 
      AND pos.estado <> 'RECHAZADX' 
      AND pos.estado <> 'DECLINADX'
  ) AS num,
  periodo.nombre AS periodo_nombre,
  m.momento
FROM proyecto p
LEFT JOIN proyecto_carrera pc ON p.proyecto_id = pc.proyecto_id
LEFT JOIN carrera c ON pc.carrera_id = c.carrera_id
LEFT JOIN momentos_periodo m ON p.momento_id = m.momento_id 
LEFT JOIN osf ON osf.osf_id = p.osf_id
LEFT JOIN osf_institucional osf_i ON osf_i.osf_id = osf.osf_id
LEFT JOIN pregunta q ON q.id_proyecto = p.proyecto_id
LEFT JOIN periodo_academico periodo ON m.periodo_id = periodo.periodo_id
WHERE (p.estado = 'pendiente') 
GROUP BY p.proyecto_id, m.horas, osf.tipo, osf_i.logo, q.id_pregunta, q.pregunta, periodo.nombre, m.momento
ORDER BY 
  CASE 
    WHEN p.estado = 'visible' THEN 1
    WHEN p.estado = 'lleno' THEN 2
    ELSE 3
  END,
  p.proyecto_id DESC;
    `)
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
})

app.get('/proyectos/:osf_id', (req, res) => {
  const { osf_id } = req.params
    db.any(`
SELECT 
  p.*, 
  array_remove(array_agg(c.nombre), NULL) AS carreras,
  m.horas,
  CASE 
    WHEN osf.tipo = 'institucional' THEN osf_i.logo
    ELSE NULL
  END AS logo,
  q.id_pregunta,
  q.pregunta,
  (
    SELECT COUNT(*) 
    FROM postulacion pos 
    WHERE pos.id_proyecto = p.proyecto_id 
      AND pos.estado <> 'RECHAZADX' 
      AND pos.estado <> 'DECLINADX'
  ) AS num,
  periodo.nombre AS periodo_nombre,
  m.momento
FROM proyecto p
LEFT JOIN proyecto_carrera pc ON p.proyecto_id = pc.proyecto_id
LEFT JOIN carrera c ON pc.carrera_id = c.carrera_id
LEFT JOIN momentos_periodo m ON p.momento_id = m.momento_id 
LEFT JOIN osf ON osf.osf_id = p.osf_id
LEFT JOIN osf_institucional osf_i ON osf_i.osf_id = osf.osf_id
LEFT JOIN pregunta q ON q.id_proyecto = p.proyecto_id
LEFT JOIN periodo_academico periodo ON m.periodo_id = periodo.periodo_id
WHERE (p.estado = 'visible' OR p.estado = 'lleno' OR p.estado = 'pendiente') AND p.osf_id = $1
GROUP BY p.proyecto_id, m.horas, osf.tipo, osf_i.logo, q.id_pregunta, q.pregunta, periodo.nombre, m.momento
ORDER BY 
  CASE 
    WHEN p.estado = 'visible' THEN 1
    WHEN p.estado = 'lleno' THEN 2
    ELSE 3
  END,
  p.proyecto_id DESC;
    `, [osf_id])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
})

app.get('/proyectos/:id', (req, res) => {
  const proyectoId = req.params.id;
  db.oneOrNone('SELECT * FROM proyecto WHERE proyecto_id = $1', [proyectoId])
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: 'Proyecto no encontrado' });
      }
    })
    .catch((error) => {
      console.log('ERROR:', error);
      res.status(500).json({ error: 'Error en la base de datos' });
    });
});

app.get('/proyectos/preguntas/:id', (req, res) => {
  const proyectoId = req.params.id;
  db.oneOrNone('SELECT * FROM pregunta WHERE id_proyecto = $1', [proyectoId])
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.status(400).json({error: 'Error en la DB'})
      }
    })
})

// fetch a todas las carreras
app.get('/carreras', (req, res) => {
    db.any('SELECT * FROM carrera')
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
})

app.get('/osf_institucional/:osf_id', async (req, res) => {
  const { osf_id } = req.params;
  try {
    // Query ajustada según el esquema real
    const data = await db.oneOrNone(`
      SELECT 
        u.user_id, u.correo, u.contrasena,
        o.osf_id, o.tipo, o.nombre AS nombre_oficial,
        oi.subtipo, oi.mision, oi.vision, oi.objetivos, oi.ods_id, oi.poblacion, oi.num_beneficiarios, oi.nombre_responsable, oi.puesto_responsable, oi.correo_responsable, oi.telefono, oi.direccion, oi.horario, oi.pagina_web_redes, oi.correo_registro, oi.logo, oi.comprobante_domicilio, oi.rfc, oi.acta_constitutiva, oi.fotos_instalaciones,
        e.nombre AS nombre_encargado, e.puesto AS puesto_encargado, e.telefono AS telefono_encargado, e.correo AS correo_encargado, e.ine AS ine_encargado
      FROM osf_institucional oi
      JOIN osf o ON oi.osf_id = o.osf_id
      JOIN "user" u ON o.user_id = u.user_id
      LEFT JOIN osf_institucional_encargado e ON oi.osf_id = e.osf_id
      WHERE oi.osf_id = $1
    `, [osf_id]);
    if (!data) {
      return res.status(404).json({ error: 'OSF no encontrado' });
    }
    // Estructura el resultado para el frontend
    const result = {
      user: {
        user_id: data.user_id,
        correo: data.correo,
        contrasena: data.contrasena
      },
      osf: {
        osf_id: data.osf_id,
        tipo: data.tipo,
        nombre: data.nombre_oficial
      },
      institucional: {
        subtipo: data.subtipo,
        mision: data.mision,
        vision: data.vision,
        objetivos: data.objetivos,
        ods_id: data.ods_id,
        poblacion: data.poblacion,
        num_beneficiarios: data.num_beneficiarios,
        nombre_responsable: data.nombre_responsable,
        puesto_responsable: data.puesto_responsable,
        correo_responsable: data.correo_responsable,
        telefono: data.telefono,
        direccion: data.direccion,
        horario: data.horario,
        pagina_web_redes: data.pagina_web_redes,
        correo_registro: data.correo_registro,
        logo: data.logo,
        comprobante_domicilio: data.comprobante_domicilio,
        rfc: data.rfc,
        acta_constitutiva: data.acta_constitutiva,
        fotos_instalaciones: data.fotos_instalaciones
      },
      encargado: {
        nombre_encargado: data.nombre_encargado,
        puesto_encargado: data.puesto_encargado,
        telefono_encargado: data.telefono_encargado,
        correo_encargado: data.correo_encargado,
        ine_encargado: data.ine_encargado
      }
    };
    res.json(result);
  } catch (error) {
    console.log('ERROR:', error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// PATCH para actualizar OSF institucional y sus datos relacionados
app.patch('/osf_institucional/:osf_id', upload.none(), async (req, res) => {
  const { osf_id } = req.params;
  // const { user, osf, institucional, encargado } = req.body;
  const user = JSON.parse(req.body.user || '{}');
  const osf = JSON.parse(req.body.osf || '{}');
  const encargado = JSON.parse(req.body.encargado || '{}');
  const institucional = JSON.parse(req.body.institucional || '{}');
  console.log(osf, user, encargado)
  const dbOps = [];
  try {
    // Actualizar user
    if (user && Object.keys(user).length > 0) {
      const keys = Object.keys(user);
      const values = Object.values(user);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      dbOps.push(db.none(`UPDATE "user" SET ${sets} WHERE user_id = (SELECT user_id FROM osf WHERE osf_id = $${keys.length + 1})`, [...values, osf_id]));
    }
    // Actualizar osf
    if (osf && Object.keys(osf).length > 0) {
      const keys = Object.keys(osf);
      const values = Object.values(osf);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      console.log(`UPDATE osf SET ${sets} WHERE osf_id = $${keys.length + 1}`, [...values, osf_id])
      dbOps.push(db.none(`UPDATE osf SET ${sets} WHERE osf_id = $${keys.length + 1}`, [...values, osf_id]));
    }
    // Actualizar osf_institucional
    if (institucional && Object.keys(institucional).length > 0) {
      const keys = Object.keys(institucional);
      const values = Object.values(institucional);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      dbOps.push(db.none(`UPDATE osf_institucional SET ${sets} WHERE osf_id = $${keys.length + 1}`, [...values, osf_id]));
    }
    // Actualizar o insertar encargado
    if (encargado && Object.keys(encargado).length > 0) {
      // Verificar si ya existe encargado
      const exists = await db.oneOrNone('SELECT 1 FROM osf_institucional_encargado WHERE osf_id = $1', [osf_id]);
      const keys = Object.keys(encargado);
      const values = Object.values(encargado);
      if (exists) {
        const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        dbOps.push(db.none(`UPDATE osf_institucional_encargado SET ${sets} WHERE osf_id = $${keys.length + 1}`, [...values, osf_id]));
      } else {
        const cols = keys.join(', ');
        const params = keys.map((_, i) => `$${i + 2}`).join(', ');
        dbOps.push(db.none(`INSERT INTO osf_institucional_encargado (osf_id, ${cols}) VALUES ($1, ${params})`, [osf_id, ...values]));
      }
    }
    await Promise.all(dbOps);
    res.status(200).json({ message: 'OSF actualizado correctamente' });
  } catch (error) {
    console.error('ERROR PATCH /osf_institucional:', error);
    res.status(500).json({ error: 'Error al actualizar OSF' });
  }
});


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
    } else if(req.session.tipo === 'alumno') {
        const alumno = await db.oneOrNone(`SELECT alumno_id FROM alumno WHERE user_id = $1`, [data.user_id]);
        req.session.info = alumno
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

app.post('/postulaciones/newPostulacion', upload.none(), (req, res) => {
  console.log(req.body)
  console.log(req.session)
  const form = req.body
  if (form.id_pregunta !== 'null') {
    db.none(`
      CALL insertar_postulacion($1, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6)
      `,[
        Number(form.id_proyecto),
        req.session.info.alumno_id,
        form.confirmacion_lectura,
        form.respuesta_habilidades,
        form.respuesta_descarte,
        Number(form.id_pregunta)
      ])
      .then(() => res.status(200).send('Postulación creada!'))
      .catch((error) => {
        res.status(400).send(error)
        console.log(error)
    })
  } else {
    db.none(`
      CALL insertar_postulacion($1, $2::TEXT, $3::TEXT, $4::TEXT, NULL, NULL)
      `,[
        Number(form.id_proyecto),
        req.session.info.alumno_id,
        form.confirmacion_lectura,
        form.respuesta_habilidades,
        form.respuesta_descarte,
        Number(form.id_pregunta)
      ])
      .then(() => res.status(200).send('Postulación creada!'))
      .catch((error) => {
        res.status(400).send(error)
        console.log(error)
    })  }

})

app.get('/postulaciones', upload.none(), (req, res) => {
  db.any(`
    SELECT 
    p.*, 
    a.*,
    c.nombre AS carrera,
    pr.nombre_proyecto AS proyecto,
    pr.estado AS estado_proyecto,
    r.respuesta AS respuesta_descarte,
    pre. id_pregunta,
    m.momento,
    periodo.nombre AS periodo
    FROM postulacion p
    LEFT JOIN alumno a ON a.alumno_id=p.id_alumno
    LEFT JOIN carrera c ON a.carrera_id=c.carrera_id
    LEFT JOIN proyecto pr ON p.id_proyecto=pr.proyecto_id
    LEFT JOIN respuesta r ON p.id_postulacion=r.id_postulacion
    LEFT JOIN pregunta pre ON pre.id_proyecto=p.id_proyecto
    LEFT JOIN momentos_periodo m ON pr.momento_id = m.momento_id
    LEFT JOIN periodo_academico periodo ON periodo.periodo_id = m.periodo_id
    `)
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR', error))
})

app.get('/postulaciones/alumno/:alumno_id', upload.none(), (req, res) => {
  const {alumno_id} = req.params
  db.any(`
SELECT * FROM postulacion WHERE id_alumno = $1;    
    `,[alumno_id])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR', error))
  })

app.get('/postulaciones/:osf_id', upload.none(), (req, res) => {
  const {osf_id} = req.params
  db.any(`
    SELECT 
    p.*, 
    a.*,
    c.nombre AS carrera,
    pr.nombre_proyecto AS proyecto,
    r.respuesta AS respuesta_descarte,
    pre. id_pregunta,
    m.momento,
    periodo.nombre AS periodo
    FROM postulacion p
    LEFT JOIN alumno a ON a.alumno_id=p.id_alumno
    LEFT JOIN carrera c ON a.carrera_id=c.carrera_id
    LEFT JOIN proyecto pr ON p.id_proyecto=pr.proyecto_id
    LEFT JOIN respuesta r ON p.id_postulacion=r.id_postulacion
    LEFT JOIN pregunta pre ON pre.id_proyecto=p.id_proyecto
    LEFT JOIN momentos_periodo m ON pr.momento_id = m.momento_id
    LEFT JOIN periodo_academico periodo ON periodo.periodo_id = m.periodo_id
    WHERE pr.osf_id = $1    
    `,[osf_id])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR', error))
})

app.patch('/postulaciones/update', upload.none(), async (req, res) => {
  const postulacion = JSON.parse(req.body.postulacion)
  const alumno = JSON.parse(req.body.alumno)
  const respuesta = req.body.respuesta_descarte
  const toChange = JSON.parse(req.body.toChange)

  const promises = [];

  if (Object.entries(postulacion).length > 0) {
    const keys = Object.keys(postulacion)
    const values = Object.values(postulacion)
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    promises.push(
      db.none(`UPDATE postulacion SET ${sets} WHERE id_postulacion = $${keys.length + 1}`,
        [...values, toChange.id_postulacion]
      )
    );
  }

  if (Object.entries(alumno).length > 0) {
    const keys = Object.keys(alumno)
    const values = Object.values(alumno)
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    promises.push(
      db.none(`UPDATE alumno SET ${sets} WHERE alumno_id = $${keys.length + 1}`,
        [...values, toChange.alumno_id]
      )
    );
  }

  if (respuesta !== 'null') {
    promises.push(
      db.none(`UPDATE respuesta SET respuesta = $1 WHERE id_postulacion = $2`,
        [respuesta, toChange.id_postulacion]
      )
    );
  }

  await Promise.all(promises);

  res.status(200).send('ok')
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




//Endpoint rey

app.put('/api/proyectos/:id/detalles', async (req, res) => {
  try {
    const proyectoId = req.params.id;
    const {
      zona, tipo_vulnerabilidad, numero_beneficiarios, producto_a_entregar,
      medida_impacto_social, competencias, direccion, carreras, enlace_maps,
      problema_social, valor_promueve, rango_edad,
      lista_actividades_alumno, modalidad_desc,
      objetivo_general, estado, cantidad,
    } = req.body;

    console.log(" Backend recibió:", req.body);

    await db.tx(async t => {
      console.log(" Actualizando proyecto...");

      await t.none(`
        UPDATE proyecto SET
          zona = $1,
          tipo_vulnerabilidad = $2,
          numero_beneficiarios = $3,
          producto_a_entregar = $4,
          medida_impacto_social = $5,
          competencias = $6,
          direccion = $7,
          enlace_maps = $8,
          problema_social = $9,
          valor_promueve = $10,
          rango_edad = int4range($11, $11 + 1),
          lista_actividades_alumno = $12,
          modalidad_desc = $13,
          objetivo_general = $14,
          estado = $15,
          cantidad = $16
        WHERE proyecto_id = $17
      `, [
        zona, tipo_vulnerabilidad, numero_beneficiarios, producto_a_entregar,
        medida_impacto_social, competencias, direccion, enlace_maps,
        problema_social, valor_promueve, rango_edad,
        lista_actividades_alumno, modalidad_desc,
        objetivo_general, estado,cantidad ,proyectoId
      ]);

      console.log("Proyecto actualizado");

      console.log("🔁 Borrando carreras actuales");
      await t.none('DELETE FROM proyecto_carrera WHERE proyecto_id = $1', [proyectoId]);
      console.log("Carreras borradas");

      console.log("➕ Insertando nuevas carreras");
      const inserts = carreras.map(nombre =>
        t.none(`
          INSERT INTO proyecto_carrera (proyecto_id, carrera_id)
          SELECT $1, carrera_id FROM carrera WHERE nombre = $2
        `, [proyectoId, nombre])
      );

      await t.batch(inserts);
      console.log("Carreras insertadas");
    });

    console.log(" Todo correcto, enviando respuesta");
    res.status(200).json({ message: "Detalles actualizados correctamente" });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Error al actualizar detalles del proyecto" });
  }
});






// ÚNICO endpoint válido
app.put('/api/proyectos/:id', (req, res) => {
  const proyectoId = req.params.id;
  //const { modalidad, horas } = req.body;
  const { modalidad } = req.body;


  const modalidadesValidas = ["presencial", "en linea", "mixto"];
  if (!modalidadesValidas.includes(modalidad.toLowerCase())) {
    return res.status(400).json({ error: "Modalidad no válida" });
  }

  //db.none('UPDATE proyecto SET modalidad = $1, horas = $2 WHERE proyecto_id = $3', [modalidad, horas, proyectoId])
  db.none('UPDATE proyecto SET modalidad = $1 WHERE proyecto_id = $2', [modalidad, proyectoId])

    .then(() => res.status(200).json({ message: "Proyecto actualizado correctamente" }))
    .catch((err) => {
      console.error(" Error al actualizar el proyecto:", err);
      res.status(500).json({ error: "Error en la base de datos" });
    });
});

//endpoint recibir alumno 
// Endpoint para obtener datos del alumno por user_id
app.get('/alumnos/user/:user_id', (req, res) => {
  db.oneOrNone('SELECT * FROM alumno WHERE user_id = $1', [req.params.user_id])
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: 'Alumno no encontrado para ese user_id' });
      }
    })
    .catch((error) => {
      console.log('ERROR:', error);
      res.status(500).json({ error: 'Error en la base de datos' });
    });
});




//Fin endpoins Rey








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
