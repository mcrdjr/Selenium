# Selenium
Selenium Code to populate Leaderboard

I know all of this isn't pretty but it's my first stab at creating node apps and jsforce.
Some day this will be running on Heroku

Right now you will need to manually run node init.js to populate Salesforce

All of this assumes you have the custom object from the Leaderboard repository -

To get app up and running

Download code and unzip

Open VS Code and open the folder where you download zip

Update your Salesforce username, password and secret in .env

Run npm update to get all node modules

Should be good to go.

Run 
node init.js 

If you get this message:
SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version XX

That is when Chrome gets updated - it may break this program with that message
Check for newer chromedriver
Do this: -> npm outdated

If newer version then change in package.json to that version
and run npm update to update the node modules

Please email me any comments, critiques, etc.

I really need help with uploading this mess to Heroku so I don't have to manually run the job -

Note: 2022-04-26
Uploaded certs.js

This file when run will read and update Certifications in Salesforce Object

node certs.js xxxxx - where xxxxx is the vanityname






