import { check, validationResult} from 'express-validator'
import User from '../models/User.js'
import { generateId, generateJWT } from '../helpers/tokens.js'
import bcrypt from 'bcrypt'
import { emailRegister, emailForgotPassword } from '../helpers/emails.js'


const formularioLogin = (req, res) => {
    res.render('auth/login',{
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}

const authenticate = async (req, res) => {

    // Validate
    await check('email').isEmail().withMessage('Invalid email').run(req)
    await check('password').notEmpty().withMessage('The password can\'t be empty').run(req)

    let result = validationResult(req)
    
    if(!result.isEmpty()){
        return res.render('auth/login', {
            pagina: 'Log in',
            errors: result.array(),
            csrfToken: req.csrfToken()
        })
    }

    // Verify if user exists
    const {email, password} = req.body

    const user = await User.findOne({where: {email}})
    if(!user){
        return res.render('auth/login', {
            pagina: 'Log in',
            errors: [{msg: 'The user doesn\'t exist'}],
            csrfToken: req.csrfToken()
        })

    }

    // Verify the user confirmed the account
    if(!user.confirmed){ // user exists but is not confirmed
        return res.render('auth/login', {
            pagina: 'Log in',
            errors: [{msg: 'Your account has not been confirmed. Please check your email inbox'}],
            csrfToken: req.csrfToken()
        })
    }

    // Check password
    if(!user.verifyPassword(password)){
        return res.render('auth/login', {
            pagina: 'Log in',
            errors: [{msg: 'The password is incorrect'}],
            csrfToken: req.csrfToken()
        })
    }

    // Authenticate the user 
    const token = generateJWT({id: user.id, name: user.name})
    console.log(token)

    // Store token in cookie

    return res.cookie('_token', token, {
        httpOnly: true,
        //secure: true
    }).redirect('/my-properties')
}




const formularioRegister = (req, res) => { // Log the CSRF token
      res.render('auth/register',{
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken()
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
        message: 'We have sent an email to confirm your account',
        csrfToken: req.csrfToken()
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
        pagina: 'Recuperar Password',
        csrfToken: req.csrfToken()
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
            csrfToken: req.csrfToken()
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

const confirmToken  = async (req, res) => {

    const { token } = req.params;

    const user = await User.findOne({where: {token}})

    if(!user){
        
        return res.render('auth/confirm-account', {
            pagina: 'Reset your password',
            message: 'There was an issue while validating your information.',
            error: true
        })
    }

    // Form to reset password
    res.render('auth/reset-password', {
        pagina: 'Reset your password',
        csrfToken: req.csrfToken()

    }

    )

}

const newPassword =  async(req, res) => {
    // Validate the password
    await check('password').isLength({ min: 6 }).withMessage('The password must be at least 6 characters long').run(req)

    let result = validationResult(req)

    if(!result.isEmpty()){
        return res.render('auth/reset-password', {
            pagina: 'Update password',  
            errors: result.array(),
            csrfToken: req.csrfToken()

        })
    }

    const { token } = req.params
    const {password} = req.body    
    
    // Who is doing the reset

    const user = await User.findOne({where: {token}})

    // Hash password

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt);
    user.token = null 

    await user.save();

    res.render('auth/confirm-account', {
        pagina: 'Password Sucessfully changed!',
        message: 'Password has been saved.'
    })

    
}


export {
    formularioLogin,
    authenticate,
    formularioRegister,
    register,
    confirm,
    formularioForgotPassword,
    resetPassword,
    confirmToken,
    newPassword
}