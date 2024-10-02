import express from 'express'
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado, mostrarPropiedad, enviarMensaje, verMensajes } from '../controllers/propiedadesController.js'
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirimagen.js'
import identificarUsuario from "../middleware/identificarUsuario.js"
const router = express.Router();

router.get('/mis-propiedades', protegerRuta, admin);
router.get('/propiedades/crear', protegerRuta, crear);
router.post('/propiedades/crear', protegerRuta, 
    body('titulo').notEmpty().withMessage('El título del Anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ir vacía')
        .isLength({ max: 200 }).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Seleccione una categoría'),
    body('precio').isNumeric().withMessage('Seleccione un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Seleccione la cantidad de Habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Seleccione la cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Seleccione la cantidad de Baños'),
    body('lat').notEmpty().withMessage('Ubique la Propiedad en el mapa'),
    guardar);

router.get('/propiedades/agregar-imagen/:id', 
    protegerRuta, 
    agregarImagen
)

router.post('/propiedades/agregar-imagen/:id',
    
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/propiedades/editar/:id',
    protegerRuta,
    editar
)


router.post('/propiedades/editar/:id', protegerRuta, 
    body('titulo').notEmpty().withMessage('El título del Anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ir vacía')
        .isLength({ max: 200 }).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Seleccione una categoría'),
    body('precio').isNumeric().withMessage('Seleccione un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Seleccione la cantidad de Habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Seleccione la cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Seleccione la cantidad de Baños'),
    body('lat').notEmpty().withMessage('Ubique la Propiedad en el mapa'),
    guardarCambios);

router.post('/propiedades/eliminar/:id',
    protegerRuta,
    eliminar 
)

router.put('/propiedades/:id', 
    protegerRuta,
    cambiarEstado
)

// Área pública 
// No utiliza proteger ruta

router.get('/propiedad/:id',
    identificarUsuario,
    mostrarPropiedad
) 

// Almacenar los mensajes

router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({min: 10}).withMessage('El Mensaje no puede ir vacio o es muy corto'),
    enviarMensaje
) 

router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
)
export default router