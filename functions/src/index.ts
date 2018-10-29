import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
    const urlId = request.body.urlId || null;

    if(!urlId){
        response.send(`Received no url id!`);
    } else {
        response.send(`Received the following urlId: ${urlId}`);
    }
    
});

export const getUrl = functions.https.onCall((data, context) => {
    const urlId = data.urlId || null;

    if(!urlId){
        return {message: `Received no url id!`, url: null};
    } else {
        return {message: `Received the following urlId: ${urlId}`, url: 'wwww.google.com'};
    }
    
});