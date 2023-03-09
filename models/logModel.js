const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Log must have a name"],
    },
    body: {
        type: String,
        require: [true, "Log must have a description"],
    },
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;