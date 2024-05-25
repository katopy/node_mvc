import express from "express";
import { formularioLogin, formularioRegister, register, confirm, formularioForgotPassword} from "../controllers/usuarioController.js";

const router = express.Router();

//Routing (diferentes endpoints que soporta nuestra app)
router.get('/login', formularioLogin)

router.get('/register', formularioRegister)
router.post('/register', register)

router.get('/forgot-password', formularioForgotPassword)

// Luego de enviar el correo, pagina para confirmar cuenta
// Routing dinamico --> controller

router.get('/confirm/:token', confirm)


router.post('/', (req, res) => {
    res.json({msg: 'Respuesta tipo POST'})

});

export default router