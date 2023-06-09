const express = require("express")
const cors = require("cors")

const userRoutes = require('./routes/userRoutes')
const needRoutes = require('./routes/needRoutes')
const airtableI = require('./routes/airtableRoutes')
const searchRoutes = require('./routes/searchRoutes')
const authorizedRoutes = require('./routes/authorizedRoutes')

const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const loginSpec = YAML.load('./swagger/login.yaml')
const createNeedSpec = YAML.load('./swagger/createNeed.yaml')
const allNeedsSpec = YAML.load('./swagger/allNeeds.yaml')
const getNeedSpec = YAML.load('./swagger/getNeed.yaml')
const downloadFileSpec = YAML.load('./swagger/downloadFile.yaml')
const updateNeedSpec = YAML.load('./swagger/updateNeed.yaml')
const deleteNeedSpec = YAML.load('./swagger/deleteNeed.yaml')
const UserRegSpec = YAML.load('./swagger/UserReg.yaml')
const profileSpec = YAML.load('./swagger/profile.yaml')
const logoutSpec = YAML.load('./swagger/logout.yaml')
const authorizedSpec = YAML.load('./swagger/authorized.yaml')
const searchSpec = YAML.load('./swagger/search.yaml')
const addCommentSpec = YAML.load('./swagger/addComment.yaml')
const getCommentSpec = YAML.load('./swagger/getComment.yaml')
const _ = require('lodash')
const commentRoutes = require('./routes/commentRoutes')

const apiSpec = _.merge({}, UserRegSpec, loginSpec, profileSpec, logoutSpec, authorizedSpec, 
  createNeedSpec, allNeedsSpec, getNeedSpec, downloadFileSpec, updateNeedSpec, deleteNeedSpec,
  searchSpec, addCommentSpec, getCommentSpec)

const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '500mb' }))
app.enable("trust proxy")
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
}, cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

  


app.use(express.json())

app.get("/api/v1", (req, res) => {
  res.send("nobody there!!")
  console.log("yeah it ran")
})

//localhost:3002/api/v1/

app.use(express.urlencoded({ extended: true }))


app.use('/api/v1/', needRoutes)
app.use('/api/v1/', airtableI)
app.use('/api/v1/', userRoutes)
app.use('/api/v1/', searchRoutes)
app.use('/api/v1/', commentRoutes)
app.use('/api/v1/', authorizedRoutes)
app.use('/api/v1/api-docs',swaggerUi.serve, swaggerUi.setup(apiSpec))
const port = process.env.PORT || 3002
app.listen(port, () => console.log(`listening on port ${port}`))
