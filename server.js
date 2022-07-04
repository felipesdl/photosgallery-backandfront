//importando direto a configuração do ".env" usando variável de ambiente
require("dotenv").config();

// importando o modulo do express
const express = require("express");

//importando modulo responsável pela comunicação com o MongoDB <- modela os dados
const mongoose = require("mongoose");

// usando o modulo express na variavel app
const app = express();

//conectando ao servidor MongoDB usando a função ".connect" com a chave ".env" que retorna uma promise e usa a função "app.emit"
mongoose
  .connect(process.env.CONNECTIONSTRING)
  .then(() => {
    console.log("Conectado ao servidor");
    app.emit("pronto");
  })
  .catch((e) => console.log(e));

//importando o modulo de sessões do express para que o usuario tenha seu login e senha salvo
const session = require("express-session");

//importando o modulo de criação de sessão no MongoDB
const MongoStore = require("connect-mongo");

//importando o modulo das flash msg que são uteis para serem lançadas em erros e atualizações pois são exebidas uma vez só
const flash = require("connect-flash");

// chamando todas as rotas criadas para ser usado no express
const routes = require("./routes");

// importando o modulo do path (caminho absoluto)
const path = require("path");

//importação do modulo de segurança helmet

//importação do modulo de verificação e criação de chave para segurança do site em situação de POST e GET
const csrf = require("csurf");

// importando o middleware responsável por requisições no meio das rotas (envio para o servidor, verificação...)
const {
  middlewareGlobal,
  checkCsrfError,
  csrfMiddleware,
} = require("./src/middlewares/middleware");

//executando o modulo de segurança no server

// tratando os inputs recebidos como dados <- se não for feito isso sempre será recebido undefined
app.use(express.urlencoded({ extended: true }));
//possibilidade de importar arquivos json para dentro da aplicação
app.use(express.json());

// usando/chamando o conteudo da pasta public
app.use(express.static(path.resolve(__dirname, "public")));

//criando as opções de configuração das sessões no MongoDB usando também a MongoStore criada anteriormente para a conexão
//e configuração de tempo de permanencia da sessão do usuario
const sessionOptions = session({
  secret: "djoqiwueo198273d1io2u3yh1uiy23",
  store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
});

//uso da sessionOptions criada anteriormente
app.use(sessionOptions);

//ativação das flash msg para uso em erros ou atualizações rapidas
app.use(flash());

// chamando/setando a pasta views para o conteudo HTML ou no caso EJS
app.set("views", path.resolve(__dirname, "src", "views"));
// setando o conteudo dp views para EJS
app.set("view engine", "ejs");

//ativação da verificação do csrfToken modulo de segurança
app.use(csrf());

//configurando para todas as requisições e todas as rotas passem no middleware
app.use(middlewareGlobal);
//uso do middleware de segurança para que seja executado em todas as paginas a criação das chave Token
app.use(csrfMiddleware);
//uso do middleware de segurança para que seja verificado e tratado o erro das requisições sem Token
app.use(checkCsrfError);
//chamando e usando as rotas criadas para as páginas do site
app.use(routes);

//app.on só executa a função abaixo quando o mesmo recebe a msg conforme enviado em "app.emit"
//criando a escuta para a porta 3000 para poder acessar o conteudo feito no site/servidor
app.on("pronto", () => {
  app.listen(3000, () => {
    console.log("Server is online");
    console.log("http://localhost:3000");
  });
});
