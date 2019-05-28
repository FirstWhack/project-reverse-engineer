# Project API Reverse Engineering


**Running the project:**

* Clone the repository
* Install the repository `npm i`
* Build the front end `npm run build`
* Run the server `npm run dev`
* Open the app at localhost:{PORT_SHOWN_IN_BUILD}
* Sign into any Microsoft account (should work with any organizational directory or personal account)

**My brief notes**

* I have never integrated anything with Azure AD before, most of MSAL.js came from the examples on MS Docs
* The prompt said this token should "not error out at any time", it won't unless it's expired.
* I am not really a typescript guy, in the way of KISS I have only made the .ts files work as TS and wrote my own in vanilla.


Thanks!
