import { check, validationResult} from 'express-validator'
import User from '../models/User.js'
import { generateId } from '../helpers/tokens.js'
import { emailRegister } from '../helpers/emails.js'


const formularioLogin = (req, res) => {
    res.render('auth/login',{
        pagina: 'Iniciar Sesión'
    })
}

const formularioRegister = (req, res) => { // Log the CSRF token
    const csrfToken = req.csrfToken();
    console.log('Generated CSRF Token:', csrfToken);
      res.render('auth/register',{
        pagina: 'Crear cuenta',
        csrfToken: csrfToken,
    })
}

const register = async (req, res) => {
    // Validacion
    await check('name').notEmpty().withMessage('The name cannot be empty.').run(req)
    await check('email').isEmail().withMessage('Invalid email.').run(req)
    await check('password').isLength({ min: 6 }).withMessage('The password must be at least 6 characters long').run(req)
    await check('repeate_password')
    .equals(req.body.password).withMessage('The passwords do not match.').run(req)

    let resultado = validationResult(req)

    // verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/register',{
            pagina: 'Crear cuenta',
            errors: resultado.array(),
            user: {
                name: req.body.name,
                email: req.body.email
            }
      })
    }

    // Extraer los datos
    const {name, email, password} = req.body


    // Encontrar solamente un usuario con un email identico
    const userExists = await User.findOne({ where: { email } })

    // Comprobar a la hora de registrarse que el usuario no este duplicado
    if(userExists){
        return res.render('auth/register', {
            pagina: 'Crear cuenta',
            errors: [{msg: 'This user already signed up'}],
            user: {
                name: req.body.name,
                email: req.body.email

            }
        })
    }

    // Almacenar un nuevo usuario
    const user = await User.create({
        name,
        email,
        password, 
        token: generateId()
    })

    // Envio de email de confirmacion
    emailRegister({
        name: user.name,
        email: user.email,
        token: user.token
    })

    // Mostrar mensaje que confirme cuenta
    res.render('templates/message',{
        pagina: 'The account has been created!',
        message: 'We have sent an email to confirm your account'
    })

}

// Funcion que confirma cuenta
const confirm = async (req, res) => {
    
    const { token } = req.params;

    // Verificar si el token es valido
    const user = await User.findOne({ where: {token}})

    console.log(user)

    if(!user){
        return res.render('auth/confirm-account',{
            pagina: 'Error confirming your account X.X',
            message: 'There are some issues while confirming your account, try again.',
            error: true
        })
    }

    // Confirmar la cuenta
    user.token = null;
    user.confirmed = true;
    await user.save()

    res.render('auth/confirm-account',{
        pagina: 'Account confirmed!',
        message: 'The account has been sucessfully confirmed :)'
    })

}   

const formularioForgotPassword = (req, res) =>{
    res.render('auth/forgot-password',{
        pagina: 'Recuperar Password'
    })
}

export {
    formularioLogin,
    formularioRegister,
    register,
    confirm,
    formularioForgotPassword
}