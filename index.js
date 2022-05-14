const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const { create } = require('express-handlebars');
const csrf = require('csurf');
const User = require('./models/User');

require('dotenv').config();
const clientDB = require('./database/db');
// console.log(clientDB);

const app = express();

const corsOptions = {
  credentials: true,
  origin: process.env.PATHHEROKU || '*',
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

app.set('trust proxy', 1);
// almacenamiento en memoria
app.use(
  session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: 'session-user',
    store: MongoStore.create({
      clientPromise: clientDB,
      dbName: process.env.DBNAME,
    }),
    cookie: {
      secure: process.env.MODO === 'production' ? true : false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

/* app.get('/ruta-protegida', (req, res) => {
  res.json(req.session.usuario || 'Sin sesion de usuario');
});

app.get('/crear-session', (req, res) => {
  req.session.usuario = 'dvdev';
  res.redirect('/ruta-protegida');
});

app.get('/destruir-session', (req, res) => {
  req.session.destroy();
  res.redirect('/ruta-protegida');
}); */

app.use(flash());

/* app.get('/mensaje-flash', (req, res) => {
  // si no existe es un array vacio
  res.json(req.flash('mensaje') || 'sin mensaje flash');
});

app.get('/crear-mensaje', (req, res) => {
  req.flash('mensaje', [{ msg: 'test' }]);
  res.redirect('/mensaje-flash');
}); */

app.use(passport.initialize());
app.use(passport.session());

//
// desde loginUser con req.login pasando el user
passport.serializeUser((user, done) =>
  done(null, { id: user._id, userName: user.userName })
); // req.user
passport.deserializeUser(async (user, done) => {
  const userDB = await User.findById(user.id);
  return done(null, { id: userDB._id, userName: userDB.userName });
});

const hbs = create({
  extname: '.hbs',
  partialsDir: ['views/components'],
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));
app.use('/favicon.ico', express.static(__dirname + '/public/img/favicon.ico'));
app.use(express.urlencoded({ extended: true }));

app.use(csrf());
app.use(mongoSanitize());

// token global for all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.mensajes = req.flash('mensajes');
  next();
});

app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('server working 😍 ' + PORT));
