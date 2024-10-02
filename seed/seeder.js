import { exit } from 'node:process'
import categorias from './categorias.js'
import precios from './precios.js'
import usuarios from './usuarios.js'
// import Categoria from '../models/Categoria.js'
// import  Precio from '../models/Precio.js'
import db from '../config/db.js'
import {Categoria, Precio, Usuario} from '../models/index.js'

const importarDatos = async () => {
    try {
        // Autenticar
        await db.authenticate()


        // Generar las Columnas
        await db.sync()


        // Insertar los datos
        
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])

        console.log('Datos Insertados Correctamente')
        exit() // Finalizo correctamete

        
    } catch (error) {
        console.log(error)
        // Terminar la ejecución
        exit(1) // Finalizo pero hubo un error
    }
}


const eliminarDatos = async () => {
    try {

        // await Promise.all([
        //     Categoria.destroy({where: {}, truncate: true}),
        //     Precio.destroy({where: {}, truncate: true})
        // ])

        // Otra forma de hacerlo es
        await db.sync({force: true})

        console.log('Datos eliminados correctamente')
        exit()

    } catch (error) {
        
    }
}

if(process.argv[2] === "-i"){
    importarDatos();
}

if(process.argv[2] === "-e"){
    eliminarDatos();
}