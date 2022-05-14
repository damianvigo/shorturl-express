const Url = require('../models/Url');
const { nanoid } = require('nanoid');

const leerUrls = async (req, res) => {
  console.log(req.user);
  // req.user.id -> from passport
  try {
    // const urls = await Url.find().lean();
    const urls = await Url.find({ user: req.user.id }).lean(); //lean() objs de js tradicional
    // es un array con objs - console.log(urls);
    res.render('home', { urls: urls });
  } catch (error) {
    /*   console.log(error);
    res.send('fallo algo...'); */
    req.flash('mensajes', [{ msg: error.message }]);
    return res.redirect('/');
  }
};

const agregarUrl = async (req, res) => {
  // req.user.id -> from passport
  // ese origin viene del formulario
  console.log(req.body);
  const { origin } = req.body;

  try {
    const url = new Url({
      origin: origin,
      shortURL: nanoid(8),
      user: req.user.id,
    });
    await url.save();
    req.flash('mensajes', [{ msg: 'Url agregada' }]);
    res.redirect('/');
  } catch (error) {
    /*   console.log(error);
    res.send('error algo fallo'); */
    req.flash('mensajes', [{ msg: error.message }]);
    return res.redirect('/');
  }
};

const eliminarUrl = async (req, res) => {
  // req.user.id -> from passport
  const { id } = req.params;
  // console.log(id);
  try {
    // await Url.findByIdAndDelete(id);
    const url = await Url.findById(id);
    console.log(url);
    if (!url.user.equals(req.user.id)) {
      console.log(url.user.equals(req.user.id));
      throw new Error('No es tu url');
    }

    await url.remove();
    req.flash('mensajes', [{ msg: 'Url eliminada' }]);

    res.redirect('/');
  } catch (error) {
    req.flash('mensajes', [{ msg: error.message }]);

    res.redirect('/');
    /*     console.log(error);
    res.send('error algo fallo'); */
  }
};

const editarUrlForm = async (req, res) => {
  // req.user.id -> from passport
  const { id } = req.params;
  try {
    const url = await Url.findById(id).lean();
    // console.log(url);

    if (!url.user.equals(req.user.id)) {
      throw new Error('No es tu url');
    }

    return res.render('home', { url });
  } catch (error) {
    /*     console.log(error);
    res.send('error algo fallo'); */
    req.flash('mensajes', [{ msg: error.message }]);
    return res.redirect('/');
  }
};

const editarUrl = async (req, res) => {
  const { id } = req.params;
  const { origin } = req.body;
  try {
    /*     await Url.findByIdAndUpdate(id, { origin: origin });
    res.redirect('/'); */
    const url = await Url.findById(id);
    if (!url.user.equals(req.user.id)) {
      throw new Error('No es tu url');
    }

    await url.updateOne({ origin });
    req.flash('mensajes', [{ msg: 'Url editada' }]);

    return res.redirect('/');
  } catch (error) {
    /*    console.log(error);
    res.send('error algo fallo'); */
    req.flash('mensajes', [{ msg: error.message }]);
    return res.redirect('/');
  }
};

const redireccionamiento = async (req, res) => {
  const { shortURL } = req.params;
  // console.log(shortURL);
  try {
    const urlDB = await Url.findOne({ shortURL: shortURL });
    // console.log(urlDB);
    res.redirect(urlDB.origin);
  } catch (error) {
    req.flash('mensajes', [{ msg: 'No existe esta url configurada' }]);
    return res.redirect('/');
  }
};

module.exports = {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redireccionamiento,
};
