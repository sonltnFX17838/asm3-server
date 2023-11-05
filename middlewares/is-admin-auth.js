exports.isAdminAuth = (req, res, next) => {
  const sessionUserId = req.headers.authorization;
  req.store.get(sessionUserId, (error, session) => {
    if (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (session.user.role === "Admin") {
      req.user = session.user;
    }
    next();
  });
};
