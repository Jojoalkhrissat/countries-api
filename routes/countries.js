'use strict'
const express = require('express');
const router = express.Router();
const countryService = require('../services/countries');
const { validateSearch, validateAdmin } = require('../validations/countries');

router.get('/', validateSearch, async function (req, res, next) {
  try {
    const response = await countryService.getAll(req.query)
    res.status(response.status).send(response.data);
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
});
router.get('/byRegion', async function (req, res, next) {
  try {
    const response = await countryService.groupedByRegion(req.query)
    res.status(response.status).send(response.data);
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
});
router.get('/byLanguage', async function (req, res, next) {
  try {
    const response = await countryService.groupedByLanguage(req.query)
    res.status(response.status).send(response.data);
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
});
router.get('/json', validateAdmin, async function (req, res, next) {
  try {
    const fileName = await countryService.createFile();
    res.download(fileName, 'countries.json');
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
});
router.get('/:cca2', async function (req, res, next) {
  try {
    const response = await countryService.getOne(req.params.cca2)
    res.status(response.status).send(response.data);
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})
router.post('', async function (req, res, next) {
  try {
    const response = await countryService.seed()
    res.status(response.status).send(response.data);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500)
  }
})
module.exports = router;
