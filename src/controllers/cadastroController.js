exports.index = (req, res) => {
  if (req.session.user) {
    req.flash("errors", "Você já está logado, faça logout para se cadastrar");
    return res.redirect("/");
  }
  res.render("cadastro");
};
