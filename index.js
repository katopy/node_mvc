// const express = require('express') --> CommonJS
import express from 'express'
import userRoutes from './routes/userRoutes.js'

//Crear la aplicacion
const app = express()

// Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

// Carpeta publica
app.use(express.static('public'))

// Routing
app.use('/auth', userRoutes)



//Definir puerto y arrancar la app
const port = 3000;
app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)

});