import express from "express";

import multer from 'multer';
import nodemailer from 'nodemailer';
import inquirer from 'inquirer';

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express();
const port = process.env.PORT || 3000;

// Configurar multer para la carga de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para el formulario de carga de imágenes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Ruta para manejar la carga de imágenes
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Solicitar el correo electrónico y la contraseña del remitente
    const credentials = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Ingrese su dirección de correo electrónico:',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Ingrese su contraseña:',
      },
    ]);

    // Configurar el transporte de nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com', // Servidor SMTP de Outlook
        port: 587, // Puerto SMTP de Outlook
        secure: false, // Establecer a 'false' para usar TLS
        auth: {
          user: credentials.email, // Tu dirección de correo electrónico de Outlook
          pass: credentials.password, // Tu contraseña de Outlook
        },
      });

    // Dirección de correo electrónico fija y variable
    const fixedEmail = 'administracion@dairy.com.ar'; // Cambia esto por tu dirección fija.
    const variableEmail = 'correo_variable@example.com'; // Cambia esto por la dirección variable que desees.

    // Adjuntar la imagen en el correo electrónico
    const mailOptions = {
      from: credentials.email,
      to: [fixedEmail, variableEmail],
      subject: 'Correo con imagen adjunta',
      text: 'Hola, te envío este correo automáticamente.',
      attachments: [
        {
          filename: 'imagen_adjunta.png', // Cambia el nombre del archivo según lo que desees.
          content: req.file.buffer,
        },
      ],
    };

    // Enviar el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico:', error);
        res.status(500).send('Error al enviar el correo electrónico');
      } else {
        console.log('Correo electrónico enviado:', info.response);
        res.status(200).send('Correo electrónico enviado con éxito');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error interno');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express en ejecución en el puerto ${port}`);
});
