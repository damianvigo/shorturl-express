const express = require('express');

const {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redireccionamiento,
} = require('../controllers/homeController');
const {
  formPerfil,
  editarFotoPerfil,
} = require('../controllers/perfilController');

const urlValidar = require('../middlewares/urlValida');
const verificarUser = require('../middlewares/verificarUser');

const router = express.Router();

router.get('/', verificarUser, leerUrls);
router.post('/', verificarUser, urlValidar, agregarUrl);
router.get('/eliminar/:id', verificarUser, eliminarUrl);
router.get('/editar/:id', verificarUser, editarUrlForm);
router.post('/editar/:id', verificarUser, urlValidar, editarUrl);

router.get('/perfil', verificarUser, formPerfil);
router.post('/perfil', verificarUser, editarFotoPerfil);

router.get('/:shortURL', redireccionamiento);

module.exports = router;
