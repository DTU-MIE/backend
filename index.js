const express = require("express");
// const session = require("express-session");
// const redis = require("redis");
const cors = require("cors");
//let RedisStore = require("connect-redis").default;

const userRoutes = require('./routes/userRoutes');
const needRoutes = require('./routes/needRoutes');
//const airtableI = require('./routes/airtableRoutes');
const searchRoutes = require('./routes/searchRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const createNeedSpec = YAML.load('./swagger/createNeed.yaml');
const getNeedSpec = YAML.load('./swagger/getNeed.yaml');
const downloadFileSpec = YAML.load('./swagger/downloadFile.yaml');
const _ = require('lodash');

const apiSpec = _.merge({}, createNeedSpec, getNeedSpec, downloadFileSpec);
/*
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
*/
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '500mb' }));
app.enable("trust proxy");
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}, cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/*app.use(
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


app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("nobody there!!");
  console.log("yeah it ran");
});

//localhost:3002/api/v1/

app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/', needRoutes);
//app.use('/api/v1/', airtableI);
app.use('/api/v1/', userRoutes);
app.use('/api/v1/', searchRoutes);
app.use('/api/v1/api-docs',swaggerUi.serve, swaggerUi.setup(apiSpec));
const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`listening on port ${port}`));
