import { check, validationResult} from 'express-validator'
import User from '../models/User.js'
import { generateId } from '../helpers/tokens.js'
import { emailRegister, emailForgotPassword } from '../helpers/emails.js'


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
    const csrfToken = req.csrfToken();
    res.render('auth/forgot-password',{
        pagina: 'Recuperar Password',
        csrfToken: csrfToken,
    })
}

// Post function
const resetPassword = async (req, res) => {
    // Validation
    await check('email').isEmail().withMessage('Invalid email.').run(req)
    
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        const csrfToken = req.csrfToken();
        return res.render('auth/forgot-password',{
            pagina: 'Recover your account',
            errors: resultado.array(),
            csrfToken: csrfToken
      })
    }

    // Finding the user by email

    const {email} = req.body;

    const user = await User.findOne({where : {email}})

    // When the User doesn't exist
    if(!user){
        return res.render('auth/forgot-password',{
            pagina: 'Recover your account',
            errors: [{msg: 'The user with this email does not exist'}]
        })
    }

    // Generar token y enviar el email
    user.token = generateId();
    await user.save();

    // Enviar email

    emailForgotPassword({
        email: user.email,
        name: user.name,
        token: user.token
    })

    // Renderizar mensaje
    res.render('templates/message', {
        pagina: 'Update your password',
        message: 'We have sent an email to update the password'
    })
}

const confirmToken = (req, res) => {

}

const newPassword = (req, res) => {
    
}


export {
    formularioLogin,
    formularioRegister,
    register,
    confirm,
    formularioForgotPassword,
    resetPassword,
    confirmToken,
    newPassword
}