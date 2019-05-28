# Contrast Project API Reverse Engineering


**Running the project:**

* Clone the repository
* Install the repository (npm i)
* Build the front end (npm run build)
* Run the server (the server is only necessary to proxy the request to https://login.microsoftonline.com/common/discovery/v2.0/keys)
* Open the app at localhost:{PORT_SHOWN_IN_BUILD}
* Sign into any Microsoft account (should work with any organizational directory OR personal account (xbox, Outlook.com, Skype, etc. . .))

**My brief notes**

* I have never integrated anything with Azure AD before, most of MSAL.js came from the examples on MS Docs
* The prompt said this token should "not error out at any time", it won't unless it's expired.


Thanks!