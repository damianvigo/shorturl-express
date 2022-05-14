const formidable = require('formidable'),
  Jimp = require('jimp'),
  fs = require('fs'),
  path = require('path'),
  User = require('../models/User');

module.exports.formPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.render('perfil', { user: req.user, imagen: user.imagen });
  } catch (error) {
    req.flash('mensajes', [{ msg: 'Error al leer el usuario' }]);
    return res.redirect('/perfil');
  }
};

module.exports.editarFotoPerfil = async (req, res) => {
  console.log(req.user);
  const form = new formidable.IncomingForm();
  form.maxFileSize = 50 * 1024 * 1024; // 50MB

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error('Fallo la subida de imagen');
      }

      console.log(files);
      const file = files.myFile;

      if (file.originalFilename === '') {
        throw new Error('Por favor agrega una imagen');
      }

      /*  if (!(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')) {
        throw new Error('Por favor agrega una imagen .jpg o png');
      } */

      const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      if (!imageTypes.includes(file.mimetype)) {
        throw new Error('Por favor agrega una imagen .jpg o png');
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Menos de 50MB por favor');
      }

      const extension = file.mimetype.split('/')[1];
      const dirFile = path.join(
        __dirname,
        `../public/img/perfiles/${req.user.id}.${extension}`
      );

      console.log(dirFile);

      fs.copyFile(file.filepath, dirFile, async function (err) {
        if (err) throw err;
        const image = await Jimp.read(dirFile);
        image.resize(200, 200).quality(80).writeAsync(dirFile);
      });

      //  fs.renameSync(file.filepath, dirFile);

      const user = await User.findById(req.user.id);
      user.imagen = `${req.user.id}.${extension}`;
      await user.save();

      req.flash('mensajes', [{ msg: 'ya se subio la imagen' }]);
    } catch (error) {
      req.flash('mensajes', [{ msg: error.message }]);
    } finally {
      return res.redirect('/perfil');
    }
  });
};
