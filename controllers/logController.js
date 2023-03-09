//This will interact with our log model
const Log = require("../models/logModel")

//get request from client to server
// get all posts 
exports.getAllLogs = async (req, res, next) => {
    try {
        const logs = await Log.find(); //await for async function

        res.status(200).json({
            status: "success",
            results: logs.length, //shows how many logs we get 
            data: {
                logs,
            },
        });
    } catch (e){
        res.status(400).json({
        status: "fail",
        });
    }
};

//localhost:3000/logs/:id
//get only one log by id
exports.getOneLog = async (req, res, next) => {
    try {
        const log = await Log.findById(req.params.id);

        res.status(200).json({
            status: "success",
            data: {
                log,
            },
        });
    } catch (e){
        res.status(400).json({
            status: "fail",
        });
    }
}

//create the log which the client sends
exports.createLog = async (req, res, next) => {
    try {
        const log = await Log.create(req.body)

        res.status(200).json({
            status: "success",
            data: {
                log,
            },
        });
    } catch (e){
        console.log(e);
        res.status(400).json({
            status: "fail",
        });
    }
};

exports.updateLog = async (req, res, next) => {
    try {
        const log = await Log.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: "success",
            data: {
                log,
            },
        });
    } catch (e){
        res.status(400).json({
            status: "fail",
        });
    }
};

exports.deleteLog = async (req, res, next) => {
    try {
        const log = await Log.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: "success",
        });
    } catch (e){
        res.status(400).json({
            status: "fail",
        });
    }
};