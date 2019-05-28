function sendRequest(authString) {
    return fetch('/checkRequest', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            Authorization: authString
            // 'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
        .then(response => response.text())
        .then(statusMessage => (document.getElementById('response_string').textContent = statusMessage));
}

const buildAuthString = function(actorToken, accessToken) {
    return 'MSAuth1.0 ' + 'actortoken=Bearer ' + actorToken + ',' + 'accesstoken=Bearer ' + actorToken + ',' + 'type="PFAT"';
};

var msalConfig = {
    auth: {
        clientId: '37e71c76-d1b3-4898-a3e6-ddfb7f862a25', //This is your client ID
        authority: 'https://login.microsoftonline.com/common' //This is your tenant info
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true
    }
};

// create a request object for login or token request calls
// In scenarios with incremental consent, the request object can be further customized
var requestObj = {
    scopes: ['api://37e71c76-d1b3-4898-a3e6-ddfb7f862a25/test']
};

var myMSALObj = new Msal.UserAgentApplication(msalConfig);

// Register Callbacks for redirect flow
// myMSALObj.handleRedirectCallbacks(acquireTokenRedirectCallBack, acquireTokenErrorRedirectCallBack);
myMSALObj.handleRedirectCallback(authRedirectCallBack);

window.signIn = function() {
    myMSALObj
        .loginPopup(requestObj)
        .then(function(loginResponse) {
            //Successful login
            showWelcomeMessage();
            acquireTokenPopup();
        })
        .catch(function(error) {
            //Please check the console for errors
            console.log(error);
        });
};

window.signOut = function() {
    myMSALObj.logout();
}

function acquireTokenPopup() {
    //Always start with acquireTokenSilent to obtain a token in the signed in user from cache
    myMSALObj
        .acquireTokenSilent(requestObj)
        .then(function(tokenResponse) {
            const authString = buildAuthString(tokenResponse.accessToken, tokenResponse.idToken.rawIdToken);
            sendRequest(authString);
            console.log(authString);
            document.getElementById('auth_string').textContent = authString;
        })
        .catch(function(error) {
            console.log(error);
            // Upon acquireTokenSilent failure (due to consent or interaction or login required ONLY)
            // Call acquireTokenPopup(popup window)
            if (requiresInteraction(error.errorCode)) {
                myMSALObj
                    .acquireTokenPopup(requestObj)
                    .then(function(tokenResponse) {
                        console.log('ALT', tokenResponse);
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        });
}
function showWelcomeMessage() {
    var divWelcome = document.getElementById('WelcomeMessage');
    divWelcome.innerHTML = 'Welcome ' + myMSALObj.getAccount().userName + ' to Your Test App';
    var loginbutton = document.getElementById('SignIn');
    loginbutton.innerHTML = 'Sign Out';
    loginbutton.setAttribute('onclick', 'signOut()');
}

function authRedirectCallBack(error, response) {
    if (error) {
        console.log(error);
    } else {
        if (response.tokenType === 'access_token') {
            // got token!
        } else {
            console.log('token type is:' + response.tokenType);
        }
    }
}

function requiresInteraction(errorCode) {
    if (!errorCode || !errorCode.length) {
        return false;
    }
    return errorCode === 'consent_required' || errorCode === 'interaction_required' || errorCode === 'login_required';
}

// Browser check variables
var ua = window.navigator.userAgent;
var msie = ua.indexOf('MSIE ');
var msie11 = ua.indexOf('Trident/');
var msedge = ua.indexOf('Edge/');
var isIE = msie > 0 || msie11 > 0;
var isEdge = msedge > 0;

//If you support IE, our recommendation is that you sign-in using Redirect APIs
//If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check

// can change this to default an experience outside browser use
var loginType = isIE ? 'REDIRECT' : 'POPUP';

// runs on page load, change config to try different login types to see what is best for your application
if (loginType === 'POPUP') {
    if (myMSALObj.getAccount()) {
        // avoid duplicate code execution on page load in case of iframe and popup window.
        showWelcomeMessage();
        acquireTokenPopup();
    }
} else if (loginType === 'REDIRECT') {
    document.getElementById('SignIn').onclick = function() {
        myMSALObj.loginRedirect(requestObj);
    };
} else {
    console.error('Please set a valid login type');
}
