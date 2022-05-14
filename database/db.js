const mongoose = require('mongoose');
require('dotenv').config();

const clienteDB = mongoose
  .connect(process.env.URI)
  .then((m) => {
    console.log('db conectada 💡');
    // console.log(m.connection.getClient());
    return m.connection.getClient();
  })
  .catch((e) => console.log('fallo la conexion ' + e));

module.exports = clienteDB;
