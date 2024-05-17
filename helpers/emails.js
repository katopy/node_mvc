import nodemailer from 'nodemailer'


const emailRegister = async (data) => {
    const transport = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        }
    });
}

export{
    emailRegister
}