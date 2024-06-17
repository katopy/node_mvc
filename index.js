// const express = require('express') --> CommonJS
import express from 'express'
import cookieParser from 'cookie-parser'
import { doubleCsrf } from 'csrf-csrf'
import userRoutes from './routes/userRoutes.js'
import propertiesRoutes from './routes/propertiesRoutes.js'
import db from './config/db.js'

//Crear la aplicacion
const app = express()
  
// Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}))


// csrf configuration
const { doubleCsrfProtection} = doubleCsrf({
    getSecret: () => process.env.NODE_KEY, 
    cookieName: "psifi.x-csrf-token",
    cookieOptions: {
      sameSite: "lax",
      secure: process.env.NODE_ENV !== 'development',
    },
    getTokenFromRequest: (req) => {
      if (req.is('application/x-www-form-urlencoded') || req.is('multipart/form-data') || (req.get('Content-Type') && req.get('Content-Type').includes('form'))) {
        return req.body._csrf;
      }
      return req.headers['x-csrf-token'];
    }
  });
  
// Enable cookie parser
app.use( cookieParser())

app.use(doubleCsrfProtection);

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
app.use('/', propertiesRoutes)


//Definir puerto y arrancar la app
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)

});