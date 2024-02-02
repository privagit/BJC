const isNotLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};

const isLoggedIn = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }
  next();
};

const isAuth = (page) => {
  return (req, res, next) => {
    if (req.session.Auth[page] == 0) {
      res.redirect("/error");
      return res.send({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }
    next();
  };
};

const isAuthEdit = (page) => {
  return (req, res, next) => {
    if (req.session.Auth[page] != 2) {
      return res.status(400).send({ message: "ไม่ได้รับอนุญาต" });
    }
    next();
  };
};

module.exports = {
  isNotLoggedIn,
  isLoggedIn,
  isAuth,
  isAuthEdit,
};
