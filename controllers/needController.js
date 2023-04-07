const fs = require('fs');
const path = require('path');
const mime = require('mime');
const model =  require('../models/needModel')

async function createNeed(req, res) {
  const { NeedIs, Title, ContactPerson } = req.body;
  console.log('req.file:', req.file);
  const FileData = req.file ? req.file.buffer.slice(0, req.file.buffer.length) : null;
  const originalname = req.file ? req.file.originalname : null;
  const extension = originalname ? originalname.split('.').pop() : null;
  console.log('fileData:', FileData);
  console.log('needis', req.body);
  const createdAt = new Date();
  const id = await model.insertNeed({ NeedIs, Title, ContactPerson, FileData, originalname, extension, createdAt });
  return res.json({ id });
}

async function getNeed(req, res) {
  const { id } = req.params;
  const need = await model.getNeedById(id);
  console.log('need:', need);
  if (!need) {
    return res.status(404).json({ message: 'Need not found' });
  }
  if (need.FileData) {
    const fileData = Buffer.from(need.FileData, 'base64');
    const contentType = mime.getType('.' + need.extension);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${need.originalname}`);
    return res.send(fileData);
  }
  return res.json(need);
}

module.exports = {
  createNeed,
  getNeed,
};
