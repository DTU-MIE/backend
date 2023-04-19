const express = require("express");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
/*const sql = require("mssql");
const fileUpload = require('./middleware/fileUpload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;*/
let RedisStore = require("connect-redis").default;

//const logRoutes = require('./routes/logRoutes');
const needRoutes = require('./routes/needRoutes');
const airtableI = require('./routes/airtableRoutes');
//const searchRoutes = require('./routes/searchRoutes');
//const swaggerUi = require('swagger-ui-express');
//const YAML = require('yamljs');
//const swaggerDocument = YAML.load('./swagger/api.yaml');

const {
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT
} = require("./config/config");

const redisClient = redis.createClient({
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
});

const app = express();

app.enable("trust proxy");
app.use(cors({})); // in the curly bracket we can set config options 
app.use(
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
);



//var Connection = require('tedious').Connection;  

/*const dbConfig = {  
  database: "mie",
  server: "sql",
  host: "localhost"/130.225.170.197,
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

app.use(express.json());

/*const swaggerDocument1 = require('./swagger/getneed').swaggerDocument;

const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Example API',
  explorer: true
};*/

app.get("/api/v1", (req, res) => {
  res.send("nobody there!!!");
  console.log("yeah it ran");
});

//localhost:3002/api/v1/
//app.use("/api/v1/logs", logRoutes);
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/', needRoutes);
app.use('/api/v1/', airtableI);
//app.use('/api/v1/', searchRoutes);
//app.use('/api/v1/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//app.use('/api/v1/n/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument1, options));




const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`listening on port ${port}`));
