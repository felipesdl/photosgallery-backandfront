const Imagens = require("../models/ImagensModel");
const aws = require("aws-sdk");
const multer = require("multer");
const multers3 = require("multer-s3");

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

const multerMiddleware = multer({
  storage: multers3({
    s3,
    bucket: "serv-aws-imagens-upload",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const uploadSingle = multerMiddleware.single("imagem");

exports.index = (req, res) => {
  res.render("imagens", {
    imagens: {},
  });
};

exports.register = async (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    try {
      const imagens = new Imagens(req.body, req.file.location, req.file.key);
      await imagens.register();

      if (imagens.errors.length > 0) {
        req.flash("errors", imagens.errors);
        req.session.save(() => {
          return res.redirect("/imagens");
        });
        return;
      }
      req.flash("success", "Upload feito com sucesso");
      req.session.save(() => {
        return res.redirect(`/imagens/index/${imagens.imagens._id}`);
      });
    } catch (e) {
      console.log(e);
    }
  });
};

exports.editIndex = async (req, res) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (!req.params.id) return res.render("404");
      const imagens = await Imagens.buscaPorId(req.params.id);
      if (!imagens) return res.render("404");
      res.render("imagens", { imagens });
    } catch (e) {
      console.log(e);
    }
  });
};

exports.edit = async (req, res) => {
  uploadSingle(req, res, async (err) => {
    try {
      let imagens = new Imagens(req.body);
      if (req.file === undefined) {
        const location = await Imagens.reloadLocation(req.params.id);
        const key = await Imagens.reloadKey(req.params.id);
        imagens = new Imagens(req.body, location, key);
      } else {
        imagens = new Imagens(req.body, req.file.location, req.file.key);
      }
      if (!req.params.id) return res.render("404");
      await imagens.edit(req.params.id);

      if (imagens.errors.length > 0) {
        req.flash("errors", imagens.errors);
        req.session.save(() => {
          return res.redirect("/imagens");
        });
        return;
      }
      req.flash("success", "Upload editado com sucesso");
      req.session.save(() => {
        return res.redirect(`/imagens/index/${imagens.imagens._id}`);
      });
    } catch (e) {
      console.log(e);
    }
  });
};

exports.delete = async (req, res) => {
  uploadSingle(req, res, async (err) => {
    try {
      if (!req.params.id) return res.render("404");

      const imagens = await Imagens.delete(req.params.id);

      if (!imagens) return res.render("404");

      req.flash("success", "Imagem apagada com sucesso");
      req.session.save(() => {
        return res.redirect("/");
      });
    } catch (e) {
      console.log(e);
    }
  });
};
