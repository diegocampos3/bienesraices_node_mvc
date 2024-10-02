import { check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuarios.js'
import { generarId, generarJWT } from '../helpers/token.js'
import { emailRegistro, emailOlvidePassword}  from '../helpers/emails.js'


const formularioLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken(),
    })
}

const autenticar = async (req, res) => {
    await check('email').isEmail().withMessage('El Email es Obligatorio').run(req)
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req)
    let resultado = validationResult(req);
    
    // Verificar que el resultado este vacio

    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const { email, password } = req.body;

    const usuario = await Usuario.findOne({where: { email }})
    // Comprobar si el usuario existe
    if(!usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario no existe'}]
        })
    }

    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Tu cuenta no ha sido Confirmada'}]
        })
    }

    // Revisar el Password

    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El password es Incorrecto'}]
        })
    }

    // Autenticar al usuario

    const token = generarJWT( { id: usuario.id, nombre: usuario.nombre});
    console.log(token);

    // Almacenar en un cookie

    return res.cookie('_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: true
    }).redirect('/mis-propiedades')

}

const cerrarSesion = (req, res) => {
    
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}


const formularioRegistro = (req, res) =>{


    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    // Validación
    await check('nombre').notEmpty().withMessage('Por favor ingrese el nombre de usuario').run(req)
    await check('email').isEmail().withMessage('Correo electrónico inválido').run(req)
    await check('password').isLength({ min: 8}).withMessage('El password debe ser de al menos 8 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los password no son iguales').run(req)
    
    let resultado = validationResult(req);
    
    // Verificar que el resultado este vacio

    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    // Extraer datos

    const { nombre, email, password} = req.body;

    // Verificar que el usuario no este duplicado

    const existeUsuario = await Usuario.findOne( { where: { email }});

    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario ya se encuentra Registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }
    
    // Almacenar un usuario

    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // Enviar email de confirmación

    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token:  usuario.token
    })

    // Mostrar mensaje de confirmación

    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un Email de Confirmación, presiona en el enlace'
    })
}


// Función que comprueba una cuenta

const confirmar = async (req, res) => {
    
    const { token } = req.params;

    // Verificar si el token es válido
    const usuario = await Usuario.findOne( {where: {token}});
    
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirma tu cuenta',
            mensaje: 'Hubo un eror al confirmar tu cuenta, intentalo de nuevo',
            error: true
        })
    }

    // Confirmar cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente',
    })


}


const formularioOlvidePassword = (req, res) =>{
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a bienes raices',
        csrfToken: req.csrfToken(),
    })
}

const resetPassword =  async (req, res) => {

       // Validación
    await check('email').isEmail().withMessage('Correo electrónico inválido').run(req)

    let resultado = validationResult(req);
    
    // Verificar que el resultado este vacio

    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a bienes raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            
            
        })
    } 

    // Buscar el usuario

    const { email } = req.body;
    const usuario = await Usuario.findOne( { where: { email }})
    
    if(!usuario){
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a bienes raices',
            csrfToken: req.csrfToken(),
            errores: [ {msg: 'El Email no Pertenece a ningún usuario'}],
            
        })
    } 

    // Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    // Enviar un email

    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })


    // Renderizar un mensaje

    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })

}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const usuario = await Usuario.findOne( {where: {token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirma tu cuenta',
            mensaje: 'Hubo un error al validar tu información, intentalo de nuevo',
            error: true
        })
    }

    // Mostrar formulario para modificar el password

    res.render('auth/reset-password', {
        pagina: 'Reestablece Tu Password',
        csrfToken: req.csrfToken(),

    })
}

const nuevoPassword = async (req, res) => {
    // Validar el password
    await check('password').isLength({ min: 8}).withMessage('El password debe ser de al menos 8 caracteres').run(req)

    let resultado = validationResult(req);
    
    // Verificar que el resultado este vacio

    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const { token } = req.params;
    const { password } = req.body;

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne( { where: {token}});

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El password se guardó correctamente'
    })

}


export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}