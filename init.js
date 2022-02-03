'use strict'
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

require('dotenv').config({path: '.env'})

console.log(process.env.LOGIN)
console.log(process.env.PASSWORD)
console.log(process.env.KEY)

const caps = new Capabilities();
caps.setPageLoadStrategy("normal");

const options = new chrome.Options();
options.headless();

var records = [];
let updateMap = [];
var jsforce = require('jsforce');
var conn = new jsforce.Connection();
conn.login(process.env.LOGIN, process.env.PASSWORD + process.env.KEY, function(err, res) {
// userid__c = \'maverick\'
//(Badges__c >= 0 and Badges__c <= 0)
// (Badges__c >= 0 and Badges__c <= 0) or userid__c = \'maverick\' 
var query = conn.query('SELECT id, lastmodifieddate, name, userid__c, BadgesT__c, Badges__c, TotalPointsT__c, TotalPoints__c, Trails__c, SuperBadges__c, Certs__c, UrlStatus__c , profile__c FROM ' +
' LeaderBoard__c WHERE ((Badges__c >= 0 and Badges__c <= 0) or userid__c = \'maverick\' ) order by lastmodifieddate, Badges__c limit 20 ')
  .on("record", function(record) {
    records.push(record);
  })
  .on("end", function() {

    for (var i=0; i<records.length; i++) {
        var record = records[i];
        //console.log(record);
        //console.log("UserID: " + record["Userid__c"]);  //the field names have to be in the EXACT format returned in the object 
        //showmore(record["Userid__c"]);
        getdata(record["Userid__c"], record["Id"], i, query.totalFetched - 1);
    }
    //console.log("total in database : " + query.totalSize);
    //console.log("total fetched : " + query.totalFetched);
  })
  .on("error", function(err) {
    console.error(err);
  })
  .run({ autoFetch : true, maxFetch : 4000 }); // synonym of Query#execute();
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getdata(tid, id, inti, ttlrecords) {
    //console.log('userid:' + tid);
    let driver = await new Builder().
    withCapabilities(caps).
    forBrowser('chrome').
    setChromeOptions(options).
    build();

try {
  const url = "https://trailblazer.me/id/"+ tid; //query.id;
  await driver.get(url);

  await new Promise(r => setTimeout(r, 5000));

let elements = await driver.findElements(By.css('.tds-bg_sand'));
let i = 0;
for(let e of elements) {
    let stre = await e.getText();
    let intlocCert = stre.indexOf('Certifications')
    if (intlocCert == -1) {
        intlocCert = stre.indexOf('1 Certification')  
        if (intlocCert == -1) {
        } else {
        intlocCert = intlocCert + 2;
        }
    }
    let strCert = stre.substring(intlocCert - 3, intlocCert).replace(/\s/g,'');
    if (strCert =='ce'){
      strCert = '';
    }

    //Superbadges
    //need to check for 1 or NO Superbadges
    //and count of badges is less than 100
    //and count of trails is less than 10
    //and Superbadges is = 1
    let intlocSB = stre.indexOf('Superbadges')
    if (intlocSB == -1) {
      intlocSB = stre.indexOf('1 Superbadge')  
      intlocSB = intlocSB + 2;
    }
    let strSB = stre.substring(intlocSB - 3, intlocSB).replace(/\s/g,'');
    strSB = strSB.replace(/\D/g,'');
    if (strSB == '') {
      intlocSB = stre.indexOf('1 Superbadge')  
      intlocSB = intlocSB + 2;
      strSB = stre.substring(intlocSB - 3, intlocSB).replace(/\s/g,'');
      strSB = strSB.replace(/\D/g,'');
    }

    
    let intlocB = stre.lastIndexOf('Badges')
    let strB = stre.substring(intlocB - 6, intlocB).replace(/\s/g,'');
    strB = strB.replace(/\D/g,'');
    let intlocP = stre.lastIndexOf('Points')
    let strP = stre.substring(intlocP - 8, intlocP).replace(/\s/g,'');
    strP = strP.replace(/\D/g,'');

    let intlocT = stre.lastIndexOf('Trails')
    let strT = stre.substring(intlocT - 5, intlocT).replace(/\s/g,'');
    strT = strT.replace(/\D/g,'');
  
    if (strB != '0') {
    updateMap[inti] = {
        Id:id,
        Userid__c : tid,
        Certs__c : strCert,
        SuperBadges__c : strSB,
        Badges__c : strB,
        BadgesT__c : strB,
        TotalPoints__c : strP,
        TotalPointsT__c : strP,
        Trails__c : strT
    }
    console.table(updateMap);
  }
    break;
}
} catch (e) {
console.log(e);
}    
finally {
await driver.close();
if (true) {  
    //update SF!
    //remove empty ones

    updateMap = updateMap.filter(function(e){return e}); 
    var mapdata = new Map(); 

    for(var i = 0; i < updateMap.length; i++){ 
      mapdata.set(updateMap[i].Id, updateMap[i]); 
    } 

    conn.sobject("LeaderBoard__c").update(updateMap,
      function(err, rets) {
        if (err) { return console.error('err:' , err); }
        for (var i=0; i < rets.length; i++) {
          if (rets[i].success) {
            var data = mapdata.get(rets[i].id);
          } else {
              console.log('problem?', err)
          }
        }
      });

      updateMap = [];
}
}
}

