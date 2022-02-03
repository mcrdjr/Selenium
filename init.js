'use strict'
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

//const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
//chromedriver.path='/Users/michaelrucker/Documents/sfdx/selenium/node_modules/chromedriver/lib/chromedriver';

require('dotenv').config({path: '.env'})

console.log(process.env.LOGIN)
console.log(process.env.PASSWORD)
console.log(process.env.KEY)

const caps = new Capabilities();
caps.setPageLoadStrategy("normal");

const options = new chrome.Options();
options.headless();

//https://jsforce.github.io/document/#query
//https://github.com/jsforce/jsforce-website/blob/master/src/partials/document/query.html.md

var records = [];
let updateMap = [];
var jsforce = require('jsforce');
var conn = new jsforce.Connection();
conn.login(process.env.LOGIN, process.env.PASSWORD + process.env.KEY, function(err, res) {
// userid__c = \'maverick\'
//(Badges__c >= 0 and Badges__c <= 0)
// (Badges__c >= 0 and Badges__c <= 0) or userid__c = \'maverick\' 
var query = conn.query('SELECT id, lastmodifieddate, name, userid__c, BadgesT__c, Badges__c, TotalPointsT__c, TotalPoints__c, Trails__c, SuperBadges__c, Certs__c, UrlStatus__c , profile__c FROM ' +
' LeaderBoard__c WHERE ((Badges__c >= 1500 and Badges__c <= 1600) or userid__c = \'maverick\' ) order by lastmodifieddate, Badges__c limit 20 ')
  .on("record", function(record) {
    records.push(record);
  })
  .on("end", function() {
    //console.log(records);

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

//var tid = 'maverick';
//const url = "https://trailblazer.me/id/"+ tid; //query.id;

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
//console.log('before:', inti, id, updateMap.length, elements.length);
let i = 0;
for(let e of elements) {
    let stre = await e.getText();
    //console.log(stre);
    //console.log('before:', tid, stre.length);
    //console.log(tid);
    //Certifications
    let intlocCert = stre.indexOf('Certifications')
    //console.log('Found Certifications:' + intlocCert);
    if (intlocCert == -1) {
      //console.log(intlocCert)
      //if -1 then NO Certs
      //if (intlocCert != -1 ) {
        intlocCert = stre.indexOf('1 Certification')  
        if (intlocCert == -1) {
          //console.log('No Certs?' + intlocCert);
        } else {
        //console.log(intlocCert)
        intlocCert = intlocCert + 2;
        }
      //}
    }
    //console.log(stre)
    let strCert = stre.substring(intlocCert - 3, intlocCert).replace(/\s/g,'');
    //console.log('Certifications:', strCert);
    if (strCert =='ce'){
      strCert = '';
    }
    //console.log('Certifications:', parseInt(strCert.replace(',', '')));
    /*
    if (strCert != NaN){
      //console.log('cert not a number skip to next Certification...')
      intlocCert = stre.lastIndexOf('Certifications')
      strCert = stre.substring(intlocCert - 3, intlocCert).replace(/\s/g,'');
      console.log('Last Certifications:', strCert);
      console.log('Last Certifications:', parseInt(strCert.replace(',', '')));
    }
    */

    //Superbadges
    //need to check for 1 or NO Superbadges
    //and count of badges is less than 100
    //and count of trails is less than 10
    //and Superbadges is = 1
    let intlocSB = stre.indexOf('Superbadges')
    //console.log(intlocSB);
    if (intlocSB == -1) {
      intlocSB = stre.indexOf('1 Superbadge')  
      intlocSB = intlocSB + 2;
      //console.log(intlocSB);
    }
    let strSB = stre.substring(intlocSB - 3, intlocSB).replace(/\s/g,'');
    strSB = strSB.replace(/\D/g,'');
    //console.log('Superbadges:', strSB);
    //console.log('Superbadges:', parseInt(strSB));
    if (strSB == '') {
      intlocSB = stre.indexOf('1 Superbadge')  
      intlocSB = intlocSB + 2;
      //console.log(intlocSB);
      strSB = stre.substring(intlocSB - 3, intlocSB).replace(/\s/g,'');
      strSB = strSB.replace(/\D/g,'');
      //console.log('Superbadge:', strSB);
      //console.log('Superbadge:', parseInt(strSB));
    }

    
    let intlocB = stre.lastIndexOf('Badges')
    let strB = stre.substring(intlocB - 6, intlocB).replace(/\s/g,'');
    //console.log('Badges:', strB);
    strB = strB.replace(/\D/g,'');
    //console.log('Badges:', parseInt(strB.replace(',', '')));
    //console.log('Badges:', parseInt(strB));
    //console.log('Badges:', strB);

    let intlocP = stre.lastIndexOf('Points')
    let strP = stre.substring(intlocP - 8, intlocP).replace(/\s/g,'');
    strP = strP.replace(/\D/g,'');
    //console.log('Points:', parseInt(strP));
    //console.log('Points:', strP);

    let intlocT = stre.lastIndexOf('Trails')
    let strT = stre.substring(intlocT - 5, intlocT).replace(/\s/g,'');
    strT = strT.replace(/\D/g,'');
    //console.log('Trails:', parseInt(strT));
    //console.log('Trails:', strT);

    //console.log(updateCerts);

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

    //updateMap = updateMap.filter(function(e){return e}); clear empty ones
    //console.log('outside:',inti, updateMap.length, id);
    break;
}
} catch (e) {
console.log(e);
}    
finally {
await driver.close();
//the inti comes in randomly due to await ?

//console.log(updateMap);

//updateMap.sort(function(a,b){
//    return b.Userid__c - a.Userid__c;
//});

//console.log('before:',updateMap.length);
//console.table(updateMap);
//for (var member in updateMap) delete updateMap[member];
//console.log('after:',updateMap.length);

//console.log('outside:', inti, ttlrecords);
if (true) {  //inti == ttlrecords
    //console.log('inside:', inti, ttlrecords,updateMap.length);
    //console.log('updateMap before:' , updateMap);
    //update SF!
    //remove empty ones

    updateMap = updateMap.filter(function(e){return e}); 

    //console.log('updateMap after:' , typeof updateMap);
    //console.log('starting update...');

    var mapdata = new Map(); 

    for(var i = 0; i < updateMap.length; i++){ 
      mapdata.set(updateMap[i].Id, updateMap[i]); 
    } 

    //console.log('data:', mapdata);

    conn.sobject("LeaderBoard__c").update(updateMap,
      function(err, rets) {
        if (err) { return console.error('err:' , err); }
        for (var i=0; i < rets.length; i++) {
          if (rets[i].success) {
            //console.log("Updated Successfully : " + rets[i].id + ' ' + JSON.stringify(rets[i]));
            var data = mapdata.get(rets[i].id);
            //console.log(data.Userid__c);
          } else {
              console.log('problem?', err)
          }
        }
      });

      updateMap = [];
      //console.log('after:',updateMap.length);
}
}
}

