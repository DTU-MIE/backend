const protect = (req, res, next) => {
    const { user } = req.session;
  
    if (!user) {
      return res.status(401).json({ status: "fail", message: "unauthorized" });
    }
  
    req.user = user;
  
    next(); // this will go to the next step which would be controller
  };
  
module.exports = protect;