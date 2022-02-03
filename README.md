# Selenium
Selenium Code to populate Leaderboard

I now all of this isn't pretty but it's my first stab at creating node apps
Some day this will be running on Heroku
Right now you will need to manually run node init.js to populate Salesforce


To get app up and running -

Download code and unzip
Open VS Code and open the folder where you download zip
Update your Salesforce username, password and secret in .env

Run npm update to get all node modules -

Should be good to go.- 

Run -
node init.js 

If you get this message:
SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version 91

When Chrome gets updated it may break this program with that message
Check chromedriver -> npm outdated
If newer version then change in package.json to that version
and run npm update to update the node modules

Please email me any comments, critiques, etc.
I really need help with uploading this mess to Heroku so I don;t have to manually run the job -






