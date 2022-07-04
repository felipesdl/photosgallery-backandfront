const Login = require("../models/LoginModel");

exports.index = (req, res) => {
  if (req.session.user) {
    req.flash("errors", "Você já está logado");
    return res.redirect("/");
  }
  res.render("login");
};

exports.register = async (req, res) => {
  try {
    const login = new Login(req.body);
    await login.register();

    if (login.errors.length > 0) {
      req.flash("errors", login.errors);
      req.session.save(() => {
        return res.redirect("/cadastro");
      });
      return;
    }
    req.flash("success", "Cadastro efetuado com sucesso");
    req.session.save(() => {
      return res.redirect("/login");
    });
  } catch (e) {
    console.log(e);
  }
};

exports.login = async (req, res) => {
  try {
    const login = new Login(req.body);
    await login.login();

    if (login.errors.length > 0) {
      req.flash("errors", login.errors);
      req.session.save(() => {
        return res.redirect("/login");
      });
      return;
    }
    req.flash("success", "Login efetuado com sucesso");
    req.session.user = login.user;
    req.session.save(() => {
      return res.redirect("/");
    });
  } catch (e) {
    console.log(e);
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
