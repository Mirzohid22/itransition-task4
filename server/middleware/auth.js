const jwt = require("jsonwebtoken");
const User = require("../model/user");

const config = process.env;

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
    // checking user's status
    const { status } = await User.findById(decoded.user_id, "status");
    if (status === "blocked") {
      return res
        .status(403)
        .send({ status: "warning", message: "User is blocked" });
    }
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
