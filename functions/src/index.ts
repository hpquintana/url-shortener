import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as validUrl from "valid-url";
import * as shortId from "shortid";

admin.initializeApp(functions.config().firebase);
const db = admin.database().ref();
const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

exports.shortenUrl = functions.https.onCall((data, context) => {
    const originalUrl = data.originalUrl || null;

    if(!originalUrl){
        return { code: 300, message: 'missing parameters' };
    } else {
        const urlCode = shortId.generate();

        if (validUrl.isUri(originalUrl)) {

            return db.child(`shortUrls`).orderByChild(`originalUrl`).equalTo(originalUrl).limitToFirst(1).once('value')
                .then(readResult => {
                    if (readResult.val() !== null) {
                        var urlObject = null;
                        readResult.forEach( (urlSnap) => {
                            urlObject = urlSnap;
                            return true;
                        });
                        return { code: 200, message: 'found a value', data: urlObject.val() };
                    } else {
                        const createdAt = new Date().getTime();
                        return db.child(`shortUrls/${urlCode}`).set({
                            originalUrl: originalUrl,
                            urlCode: urlCode,
                            createdAt: createdAt,
                            usedCount: 0
                        }).then(() => {
                            return {
                                code: 200, message: 'found a value', data: {
                                    originalUrl: originalUrl,
                                    urlCode: urlCode,
                                    createdAt: createdAt,
                                    usedCount: 0
                                }
                            };
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    return { code: 300, message: 'db read error' };
                });
        } else {
            return { code: 300, message: 'Invalid Original Url.' };
        }
    }
});

export const webApi = functions.https.onRequest(main);

app.post('/generate', (req, res) => {
    const { shortBaseUrl, originalUrl } = req.body;

    if (!validUrl.isUri(shortBaseUrl)) {
        return res.status(404).json("Invalid Base Url format");
    } else {
        const urlCode = shortId.generate();

        if (validUrl.isUri(originalUrl)) {

            return db.child(`shortUrls/${shortBaseUrl}/${urlCode}`).once('value')
                .then(readResult => {
                    if (readResult.val() !== null) {
                        return res.status(200).json(readResult.val());
                    } else {
                        const updatedAt = new Date().getTime();
                        const shortUrl = shortBaseUrl + "/" + urlCode;
                        return db.child(`shortUrls/${shortBaseUrl}/${urlCode}`).set({
                            originalUrl: originalUrl,
                            shortUrl: shortUrl,
                            urlCode: urlCode,
                            updatedAt: updatedAt
                        }).then(() => {
                            return res.status(200).json({
                                originalUrl: originalUrl,
                                shortUrl: shortUrl,
                                urlCode: urlCode,
                                updatedAt: updatedAt
                            });
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    return res.status(401).json("Unexpected Error");
                });
        } else {
            return res.status(401).json("Invalid Original Url.");
        }
    }
});