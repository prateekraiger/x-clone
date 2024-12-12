import User from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ error: "unauthorized : No Token Provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "unauthorized : No Token Provided" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User Not Found  " });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Error In protectRoute MIddleware", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
