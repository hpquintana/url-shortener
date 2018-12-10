//@ts-check

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as express from "express";
import * as cors from "cors";
admin.initializeApp();

// require("./onCalls");
import { shortenUrl, redirect} from './onCalls'
// import { api } from './express'
export { shortenUrl, redirect }

// import { api } from './express'
// export { api }

const apiApp = express()
apiApp.use(cors({ origin: true }))
apiApp.get("*", (_request, response) => {
  response.send(
    "Hello from Express on Firebase with CORS! No trailing '/' required!"
  )
})

// not as clean, but a better endpoint to consume
export const api = functions.https.onRequest((request, response) => {
  if (!request.path) {
    request.url = `/${request.url}` // prepend '/' to keep query params if any
  }
  return apiApp(request, response)
});