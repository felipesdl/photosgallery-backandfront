const express = require("express");
const route = express.Router();
const homeController = require("./src/controllers/homeController");
const loginController = require("./src/controllers/loginController");
const cadastroController = require("./src/controllers/cadastroController");
const imagensController = require("./src/controllers/imagensController");

const { loginRequired } = require("./src/middlewares/middleware");

//Rotas do HOME
//metodo GET para aparecer a página home quando é chamada
route.get("/", homeController.index);

route.get("/login", loginController.index);
route.post("/login/login", loginController.login);
route.get("/cadastro", cadastroController.index);
route.post("/login/register", loginController.register);
route.get("/login/logout", loginController.logout);

route.get("/imagens", loginRequired, imagensController.index);
route.post("/imagens/register", loginRequired, imagensController.register);
route.get("/imagens/index/:id", loginRequired, imagensController.editIndex);
route.post("/imagens/edit/:id", loginRequired, imagensController.edit);
route.get("/imagens/delete/:id", loginRequired, imagensController.delete);

//importação de todas as rotas do arquivo como um modulo
module.exports = route;
