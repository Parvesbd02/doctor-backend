import jwt from 'jsonwebtoken';

/// admin middle wares

const authAdmin = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      const token = authHeader.split(" ")[1]; // Extract the token part
  
      if (!token || typeof token !== "string") {
        return res.status(401).json({ message: "Invalid token format" });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
  };

export default authAdmin;