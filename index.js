const express = require("express");
//const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
const sql = require("mssql");
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
let RedisStore = require("connect-redis").default;



//mongoose.set('strictQuery', false);

const {
//  MONGO_USER,
//  MONGO_PASSWORD,
//  MONGO_IP,
//  MONGO_PORT,
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT,
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
  


//const logRouter = require("./routes/logRoutes");
//const userRouter = require("./routes/userRoutes");

const app = express();

/*const mongoURI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //useFindAndModify: false,
    })
    .then(() => console.log("succesfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();*/

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


var Connection = require('tedious').Connection;  
const dbConfig = {  
      database: "mie",
      server: "sqlserverdb",
      host: "localhost",
      user: "sa", //update me
      password: "miepStrong(!)Password", 
      enableArithAbort: true,
      Encrypt:true,
      trustServerCertificate: true,
      port: 1433

};  
/*sql.connect(dbConfig , function (err) {
  if(err) console.log(err);
  let sqlRequest = new sql.Request();

  let sqlQuery = 'Select * from users'
  sqlRequest.query(sqlQuery , function(err , data) {
      if(err) console.log(err);

      console.table(data)

      sql.close();
  })
});*/

const run = async () => {
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
run();
/*var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;  

function executeStatement() {  
    var request = new Request("select * from users", function(err) {  
    if (err) {  
        console.log(err);}  
    });  
    var result = "";  
    request.on('row', function(columns) {  
        columns.forEach(function(column) {  
          if (column.value === null) {  
            console.log('NULL');  
          } else {  
            result+= column.value + " ";  
          }  
        });  
        console.log(result);  
        result ="";  
    });  

    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });  
    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        connection.close();
    });
    connection.execSql(request);  
} 
executeStatement();


async function trytoconnect() {
  try {
   // make sure that any items are correctly URL encoded in the connection string
   let pool = await sql.connect(config);
   let result = await pool.request().query("select * from users");
   console.log(result);
   sql.close;
  } catch (err) {
    console.log(err);
    sql.close;
  }
 }
 trytoconnect();

/*console.log("it comes here");
const run = async() => {
  let pool;
  try {
    
    console.log('Connection Opening...');
    pool = await sql.connect(config);
    const {recordset} = await sql.query `select * from users;`;

    console.log(recordset);
    
  } catch (err) {
    console.log(err)
  } finally{
    await pool.close();
    console.log('Connection closed');
  }
}

run();
console.log("sql runs here");
/*const pool = new sql.ConnectionPool(config)


pool.connect().then(() => {
  console.log('Connected to SQL Server')
}).catch(err => {
  console.error('Error connecting to SQL Server', err)
})

// Example query
/*const request = pool.request()

request.query('SELECT * FROM USERS').then(result => {
  console.log(result)
}).catch(err => {
  console.error('Error running query', err)
})*/

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("nobody there!!!");
  console.log("yeah it ran");
});

//localhost:3000/api/v1/post/
//app.use("/api/v1/logs", logRouter);
//app.use("/api/v1/users", userRouter);
const port = process.env.PORT || 3002;

app.listen(port, () => console.log(`listening on port ${port}`));

