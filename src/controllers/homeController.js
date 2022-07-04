const Imagens = require("../models/ImagensModel");

exports.index = async (req, res) => {
  const imagens = await Imagens.buscaImagens();
  res.render("index", { imagens });
};
