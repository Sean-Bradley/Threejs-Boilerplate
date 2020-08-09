const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/js/', express.static(path.join(__dirname, 'node_modules/three/examples/js')));

app.listen(3000, () =>
  console.log('Visit http://127.0.0.1:3000')
);