//maps URL to controller folder to do some action
const express = require("express")

const logController = require("../controllers/logController")
const protect = require("../middleware/authMiddleware")

const router = express.Router()

//localhost:3000/

router
    .route("/")
    .get(protect,logController.getAllLogs)
    .post(protect, logController.createLog) //protect checks if user is logged in and if he is then it uses the next methods 
                                            // and goes to the next middleware which creates the log

router
    .route("/:id")
    .get(protect,logController.getOneLog)
    .patch(protect,logController.updateLog)
    .delete(protect,logController.deleteLog)

module.exports = router;