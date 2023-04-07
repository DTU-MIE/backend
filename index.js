const express = require("express");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
const sql = require("mssql");
const fileUpload = require('./middleware/fileUpload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
let RedisStore = require("connect-redis").default;

//const Sequelize = require('sequelize');
//const { syncDB } = require('./models/logModel');
const {  getNeedsByID, insertNeed } = require('./models/needModel');
const logRoutes = require('./routes/logRoutes');
const needRoutes = require('./routes/needRoutes');
const { upload, createValidator } = require('./middleware/fileUpload')
const { create, getAll } = require('./controllers/needController')


const {
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT
} = require("./config/config");


/*const redisClient = redis.createClient({
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT
},
});
(async () => {
    await redisClient.connect();
})();
console.log("Connecting to Redis");

redisClient.on('error', err => {
    console.log('Error ' + err);
});*/
  

//const userRouter = require("./routes/userRoutes");

const app = express();

app.enable("trust proxy");
app.use(cors({})); // in the curly bracket we can set config options 
/*pp.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);*/


var Connection = require('tedious').Connection;  

/*const dbConfig = {  
  database: "mie",
  server: "sql",
  host: "localhost",
  user: MSSQL_USER, //update me
  password: MSSQL_SA_PASSWORD, 
  enableArithAbort: true,
  Encrypt:true,
  trustServerCertificate: true,
  port: 1433

};  */

/*const run = async () => {
  let pool;
  try {
    console.log("Connection opening...");
    pool = await sql.connect(dbConfig);
    const {recordset} = await sql.query `select * from users;`;

    console.log(recordset);
  } catch(err) {
    console.log(err)
  } finally {
    await pool.close();
    console.log("connection closed");
  }
}
run();*/


//app.use(logRoutes);
app.use(express.json());
// Configure middleware


app.get("/api/v1", (req, res) => {
  res.send("nobody there!!!");
  console.log("yeah it ran");
});

//localhost:3000/api/v1/post/
app.use("/api/v1/logs", logRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/', needRoutes);

//app.use("/api/v1/users", userRouter);
const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`listening on port ${port}`));
