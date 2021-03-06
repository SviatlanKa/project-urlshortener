'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');

var app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", (req, res) => {
  res.json({greeting: 'hello API'});
});

let urls = [];
let shortUrl = 0;

app.post('/api/shorturl/new', (req, res) => {
  const { url } = req.body;
  const regExp = /(https?:\/\/)([^\/]+)(\/.+)?/;
  if (regExp.test(url)) {
    const baseUrl = url.match(regExp)[2];
    dns.lookup(baseUrl, (err, address, family) => {
      if (err) res.json({ error: "invalid URL" });
      else {
        urls.push(url);
        console.log(urls)
        shortUrl++;
        res.json({ original_url: url, short_url: shortUrl });
      }
    });
  } else res.json({ error: "invalid URL" });

});

app.get('/api/shorturl/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const url = urls[Number(shortUrl) - 1];
  url ? res.redirect(url) : res.json({ error: 'No short url!'});
});

app.listen(port, () => {
  console.log('Node.js listening ...');
});