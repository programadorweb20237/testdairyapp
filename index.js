import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configurar multer para la carga de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));

// Configurar express-session
app.use(session({
  secret: 'tu_secreto_secreto', // Cambia esto por una cadena secreta más segura
  resave: false,
  saveUninitialized: true,
}));

// Ruta para la página de inicio
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Ruta para el formulario de inicio de sesión
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Ruta para manejar el inicio de sesión
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica el correo electrónico y la contraseña aquí (puedes usar alguna lógica de autenticación).

    // Si la autenticación es exitosa, guarda los datos de inicio de sesión en la sesión
    req.session.email = email; // Guarda el correo electrónico en la sesión
    req.session.password = password; // Guarda la contraseña en la sesión

    // Redirige al formulario de carga de imágenes
    res.redirect('/upload');
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).send('Error de autenticación');
  }
});

// Ruta para el formulario de carga de imágenes (solo accesible después de iniciar sesión)
app.get('/upload', (req, res) => {
  // Verifica si el usuario ha iniciado sesión antes de permitir el acceso
  if (!req.session.email) {
    // Si el usuario no ha iniciado sesión, redirige al formulario de inicio de sesión
    return res.redirect('/login');
  }
  res.sendFile(__dirname + '/upload.html');
});

// Ruta para manejar la carga de imágenes (solo accesible después de iniciar sesión)
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Aquí puedes asumir que el usuario está autenticado, ya que esta ruta solo es accesible después de iniciar sesión.

    // Obtén el correo electrónico del usuario desde la sesión
    const email = req.session.email;

    // Obtén la contraseña del usuario desde la sesión
    const password = req.session.password;

    // Configurar el transporte de nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com', // Servidor SMTP de Outlook
      port: 587, // Puerto SMTP de Outlook
      secure: false, // Establecer a 'false' para usar TLS
      auth: {
        user: email, // Utiliza el correo electrónico del usuario para enviar el correo
        pass: password, // Utiliza la contraseña del usuario
      },
    });

    // Dirección de correo electrónico fija y variable
    const fixedEmail = 'administracion@dairy.com.ar'; // Cambia esto por tu dirección fija.
    const variableEmail = 'correo_variable@example.com'; // Cambia esto por la dirección variable que desees.

    // Adjuntar la imagen en el correo electrónico
    const mailOptions = {
      from: email, // Utiliza el correo electrónico del usuario como remitente
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
