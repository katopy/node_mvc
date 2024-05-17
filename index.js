// const express = require('express') --> CommonJS
import express from 'express'
import userRoutes from './routes/userRoutes.js'
import db from './config/db.js'

//Crear la aplicacion
const app = express()

// Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))

// Conexion a la base de datos
try{
    await db.authenticate();
    db.sync()
    console.log('Conexión correcta a la base de datos')

} catch(error){
    console.log(error)
}

// Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

// Carpeta publica
app.use(express.static('public'))

// Routing - cualquier solicitud que comience con /auth será manejada por las rutas definidas en userRoutes.
app.use('/auth', userRoutes)

//Definir puerto y arrancar la app
const port = 3000;
app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)

});