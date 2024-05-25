import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

const emailRegister = async (data) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { email, name, token } = data

    // Enviar el email
    // transport - inicia sesion en mailtrap y luego accese al uso de sendMail
    await transport.sendMail({
        from: 'RealEstate.com',
        to: email,
        subject: 'Confirm your account in RealEstate',
        text: 'Confirm your account to proceed',
        html:
        `
        <p>Hi ${name}, your account is almost ready, you just need to confirm it with the link:
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirm/${token}"> Confirm account</a> </p>
        `

    })
}

export{
    emailRegister
}