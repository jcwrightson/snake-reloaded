const express = require('express')
const fs = require('fs')
const path = require('path')
const { runInNewContext } = require('vm')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.post('/save', (req, res, next) => {
  try {
    if (req.body) {
      fileName = path.join(__dirname, `./output/${Date.now()}.json`)
      fs.writeFileSync(fileName, JSON.stringify(req.body), 'utf8')
      res.sendStatus(201)
    } else {
      throw Error('Missing Data')
    }
  } catch (e) {
    res.send(e.message).status(400)
    next(e)
  }
})

app.listen(5000, () => {
  console.log('Listening..')
})
