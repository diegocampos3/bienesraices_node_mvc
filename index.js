import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuariosRoutes from './routes/usuariosRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js'

// Crea la app

const app = express();

// Habilitar lectura de datos de formulario
app.use ( express.urlencoded({ extended: true}));

// Habilitar Cookie Paser
app.use( cookieParser() );

// Habilitar CSRF
app.use( csrf({cookie: true }));

// Conexión a la base de datos

try {

    await db.authenticate();
    db.sync();
    console.log('Conexión Correcta a la Base de Datos');
    
} catch (error) {
    console.log(error);
}


// Habilitar Pug

app.set('view engine', 'pug');
app.set('views', './views');

// Carpeta Pública
app.use( express.static('public'));


// Routing 

app.use('/', appRoutes)
app.use('/auth', usuariosRoutes)
app.use('/', propiedadesRoutes)
app.use('/api', apiRoutes)


// Definir un puerto y arrancar el puerto

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`);
});