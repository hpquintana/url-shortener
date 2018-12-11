import * as shortId from "shortid";
import * as validUrl from "valid-url";

// import initialized db
import { db } from './db';
// you can now import everything from index. 
import { https } from './index';  
// or (both work)
// import { https } from 'firebase-functions';

export const shortenUrl = https.onCall((data, context) => {
    const originalUrl = data.originalUrl || null;

    if(!originalUrl){
        return { code: 300, message: 'missing parameters' };
    } else {
        const urlCode = shortId.generate();

        if (validUrl.isUri(originalUrl)) {

            return db.child(`shortUrls`).orderByChild(`originalUrl`).equalTo(originalUrl).limitToFirst(1).once('value')
                .then(readResult => {
                    if (readResult.val() !== null) {
                        let urlObject = null;
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

export const redirect = https.onRequest((request, response) => {
    const originalUrl = request.originalUrl;
    const splitUrl = originalUrl.split('/');
    const urlId = splitUrl.pop();

    if(!urlId){
        response.redirect('/url');
    } else {
        db.child(`shortUrls/${urlId}`).once('value').then(urlSnap => {
            if(urlSnap.val() !== null ){
                const redirectUrl = urlSnap.child('originalUrl').val() || null;
                
                if(redirectUrl){
                    const currentDate = new Date().getTime();
                    db.child(`shortUrls/${urlId}/lastUsed`).set(currentDate).then( ()=> {
                        response.redirect(redirectUrl);
                    }).catch(err => {
                        console.log(err);
                        response.redirect(redirectUrl);
                    });
                } else {
                    response.redirect('/url');
                }
                
            } else {
                response.redirect('/url');
            }
        }).catch(err => {
            console.log(err);
            response.redirect('/url');
        });
    }
});
