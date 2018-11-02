var isErrorDisplayed = false;
const homeUrl = 'https://url-shortner-3a035.firebaseapp.com/';

// document.addEventListener('DOMContentLoaded', function () {

//     try {
//         let app = firebase.app();

//         let urlId = window.location.href;
//         var addMessage = firebase.functions().httpsCallable('getUrl');
//         addMessage({ urlId: urlId }).then(function (result) {

//             var url = result.data.url;
//             console.log(url);
//         }).catch(function (error) {
//             // Getting the Error details.
//             var code = error.code;
//             var message = error.message;
//             var details = error.details;
//             // ...
//         });
//     } catch (e) {
//         console.error(e);
//     }
// });

function shortenOnInputChange(){
    if(isErrorDisplayed){
        hideErrorMessage();
        // hideResults();
    }
}

function shortenOnClickHandler(){
    var inputUrl = document.getElementById("shorten-url-input").value;

    if(inputUrl == null || inputUrl.length < 1){
        displayErrorMessage('Please input a url');
    } else {
        var isValidUrl = ValidURL(inputUrl);

        if(isValidUrl){
            callFirebase(inputUrl);
        } else {
            displayErrorMessage('Not a valid url');
        }
    }
}

function callFirebase(originalUrl){
    try {
        var callShortenUrl = firebase.functions().httpsCallable('shortenUrl');
        callShortenUrl({ originalUrl: originalUrl }).then(function (result) {
            var code = result.data.code;
            console.log(result.data);
            
            if(code == 200){
                console.log('in the 200');
                let createdAt = new Date(result.data.data.createdAt);
                let shortenedUrl = homeUrl + result.data.data.urlCode;
                showResults(originalUrl, shortenedUrl, createdAt, createdAt);
            } else {
                displayErrorMessage('Error communicating with API');
            }
        }).catch(function (error) {
            // Getting the Error details.
            var code = error.code;
            var message = error.message;
            var details = error.details;
        });
    } catch (e) {
        console.error(e);
    }
}

function hideResults(){
    var resultsDiv = document.getElementById("url-shorten-results");
    resultsDiv.classList.remove("visible");
    resultsDiv.classList.add("hidden");
}

function showResults(originalUrl, shortenedUrl, createdDate, usedDate){
    if(isErrorDisplayed){
        hideErrorMessage();
    }

    console.log('showing results');
    var resultsOriginal = document.getElementById("original-url");
    resultsOriginal.textContent = `Original url: ` + originalUrl;

    var resultsInput = document.getElementById("results-input");
    resultsInput.value = shortenedUrl;

    var createdText = document.getElementById("created-date");
    var usedText = document.getElementById("used-date"); 

    createdText.textContent = createdDate.toLocaleDateString();
    usedText.textContent = usedDate.toLocaleDateString();

    var resultsDiv = document.getElementById("url-shorten-results");
    resultsDiv.classList.remove("hidden");
    resultsDiv.classList.add("visible");
}

function displayErrorMessage(message){
    var errorElement = document.getElementById('error-text');
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
    errorElement.classList.add("visible");
    isErrorDisplayed = true;
    console.error(message)
}

function hideErrorMessage(){
    var errorElement = document.getElementById('error-text');
    errorElement.classList.remove("visible");
    errorElement.classList.add("hidden");
    isErrorDisplayed = false;
}

function ValidURL(str) {
    var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if (pattern.test(str)) {
        return true;
    } else {
        return false;
    }   
}