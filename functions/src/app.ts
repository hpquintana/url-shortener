import * as express from "express";
import * as cors from "cors";

import { https } from './index';  
import { db } from "./db";

/* Express with CORS & automatic trailing '/' solution */
export const app = express()
app.use(cors({ origin: true }))
app.get("/", (_request, response) => {
  response.send(
    "Hello from Express on Firebase with CORS! No trailing '/' required!"
  )
});

app.get("/v0/", (_request, response) => {
  response.send(
    "Coming soon"
  )
});

app.get("/v0/url/:urlId/", (request, response) => {
  const urlId = request.params.urlId;

  db.child(`shortUrls/${urlId}`).once('value').then(urlSnap => {
    if(urlSnap.val() !== null ){
      response.send(JSON.stringify(urlSnap.val()));
    } else {
      response.send(JSON.stringify({error: "not found"}));
    }
  }).catch(err => {
      console.log(err);
      response.send(JSON.stringify({error: err.message}));
  });
});

// not as clean, but a better endpoint to consume
export const api = https.onRequest((request, response) => {
  if (!request.path) {
    request.url = `/${request.url}` // prepend '/' to keep query params if any
  }
  return app(request, response)
});