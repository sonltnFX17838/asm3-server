exports.isCounselorsAuth = (req, res, next) => {
  const sessionUserId = req.headers.authorization;
  req.store.get(sessionUserId, (error, session) => {
    if (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (session.user.role === "Counselors") {
      req.user = session.user;
    }
    next();
  });
};
