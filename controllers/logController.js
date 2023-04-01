const Log = require('../models/logModel');

class LogController {
    static submitLog(req, res) {
      const logText = req.body.logText;
      Log.insert(logText)
        .then(result => {
          res.status(201).json({ message: 'Log inserted successfully' });
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Error inserting log' });
        });
    }
  }

module.exports = LogController;
