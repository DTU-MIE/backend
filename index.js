const express = require("express");
//const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
const sql = require("mssql");
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
/*const config = {
    user: 'sa',
    password: 'miepStrong(!)Password',
    server: 'localhost, 57000',
    database: 'dev_testdb1',
    options: {
        enableAirthAbort: true
    } 
}
console.log("it comes here");
const run = async() => {
    let pool;
    try {
        console.log('Connection Opening...');
        pool = await new sql.ConnectionPool(config);
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
console.log("sql runs here");*/

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