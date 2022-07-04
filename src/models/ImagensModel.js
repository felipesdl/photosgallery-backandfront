const mongoose = require("mongoose");
const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

const ImagensSchema = new mongoose.Schema({
  imagem: { type: String, required: false, default: "" },
  titulo: { type: String, required: true },
  descricao: { type: String, required: false, default: "" },
  filekey: { type: String, required: false, default: "" },
  criadoEm: { type: Date, default: Date.now },
});

const ImagensModel = mongoose.model("Imagens", ImagensSchema);

class Imagens {
  constructor(body, filelocation, filekey) {
    this.body = body;
    this.errors = [];
    this.imagens = null;
    this.filelocation = filelocation;
    this.filekey = filekey;
  }

  async register() {
    this.valida();
    if (this.errors.length > 0) return;
    this.imagens = await ImagensModel.create(this.body);
  }

  valida() {
    this.cleanUp();

    if (!this.body.titulo) this.errors.push("Título é um campo obrigatório");
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== "string") {
        this.body[key] = "";
      }
    }
    this.body = {
      imagem: this.filelocation,
      titulo: this.body.titulo,
      descricao: this.body.descricao,
      filekey: this.filekey,
    };
  }

  async edit(id) {
    if (typeof id !== "string") return;
    this.valida();
    if (this.errors.length > 0) return;
    const oldInfo = await ImagensModel.findById(id);
    this.imagens = await ImagensModel.findByIdAndUpdate(id, this.body, {
      new: true,
    });
    if (oldInfo.filekey !== this.filekey) {
      if (typeof id !== "string") return;
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: oldInfo.filekey,
      };
      await s3
        .deleteObject(params, (err, data) => {
          if (err) {
            return console.log(err);
          }
        })
        .promise();
    }
  }

  static async buscaImagens() {
    const imagens = await ImagensModel.find().sort({ criadoEm: -1 });
    return imagens;
  }

  static async buscaPorId(id) {
    if (typeof id !== "string") return;
    const imagem = await ImagensModel.findById(id);
    return imagem;
  }

  static async delete(id) {
    if (typeof id !== "string") return;
    const file = await ImagensModel.findById(id);
    const filekey = file.filekey;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filekey,
    };
    await s3
      .deleteObject(params, (err, data) => {
        if (err) {
          return console.log(err);
        }
      })
      .promise();
    const imagem = await ImagensModel.findOneAndDelete({ _id: id });
    return imagem;
  }

  static async reloadLocation(id) {
    const file = await ImagensModel.findById(id);
    const filelocation = file.imagem;
    return filelocation;
  }

  static async reloadKey(id) {
    const file = await ImagensModel.findById(id);
    const filekey = file.filekey;
    return filekey;
  }
}
module.exports = Imagens;
