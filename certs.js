'use strict'
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

//const webdriver = require('selenium-webdriver');
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
options.windowSize=({height:1920,width:1080});
let driver;
function driveron () {
  driver = new Builder().
  withCapabilities(caps).
  forBrowser('chrome').
  setChromeOptions(options).
  build();
}

function driveroff() {
  driver.close();
}

const args = process.argv;
console.log('args: ' + args[0]  + ':' + args[1]  + ':' + args[2])

var records = [];
let updateMap = [];
let updateCerts = [];
var jsforce = require('jsforce');
var conn = new jsforce.Connection();
conn.login(process.env.LOGIN, process.env.PASSWORD + process.env.KEY, function(err, res) {
var query = conn.query('SELECT id, lastmodifieddate, name, userid__c, Certs__c  FROM ' +
' LeaderBoard__c WHERE (userid__c = \'' + args[2] + '\') order by lastmodifieddate, Badges__c limit 1 ')
  .on("record", function(record) {
    records.push(record);
  })
  .on("end", function() {
    //console.log(records);

    for (var i=0; i<records.length; i++) {
        var record = records[i];
        //console.log(record);
        //console.log("UserID: " + record["Userid__c"]);  //the field names have to be in the EXACT format returned in the object 
        getdata(record["Userid__c"], record["Id"], i, query.totalFetched - 1);
    }
  })
  .on("error", function(err) {
  })
  .run({ autoFetch : true, maxFetch : 4000 }); // synonym of Query#execute();
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function getdata(tid, id, inti, ttlrecords) {

  driveron()

      try {
          const url = "https://trailblazer.me/id/"+ tid; //query.id;
      await driver.get(url);
      
      await new Promise(r => setTimeout(r, 5000));
    
      try {
      let elShowMore = await driver.findElements(By.xpath("//*[text()='Show More']"));
      console.log('1. count of show more text:' + elShowMore.length);

      if (elShowMore.length == 2) {
      for(var property in elShowMore) {
        console.log('length 2: ' + property + "=" + elShowMore[property]);
        if (property==1){
          elShowMore[property].click();
          await elShowMore[property].getText();
       }
      }
    }

    if (elShowMore.length == 1) {
      for(var property in elShowMore) {
        console.log('length 1: ' + property + "=" + elShowMore[property]);
        if (property==0){
          elShowMore[property].click();
          await elShowMore[property].getText();
       }
      }
    }
    } catch(e) {
        console.log('Error 1' + e)
    }
      
      let inti;
      try {
      let elcerts = await driver.findElements(By.xpath("//*[text()='Salesforce Certification']"));
      console.log('# of certs:' + elcerts.length);
      inti = elcerts.length;
      } catch(e) {
          console.log('Error 2')
      }
      
      console.log('certs:' + inti);
      updateCerts = [];
      for (let i = 0; i <= inti; i++) {
      let elcertsItem = await driver.findElements(By.xpath('//*[@id="aura-directive-id-4"]/c-lwc-certifications/c-lwc-card/article/div/slot/c-lwc-achievements-certification-item[' + i + ']'));
      for(let c of elcertsItem) {
        let strc =  await c.getText();
        updateCerts[i] = strc.split(/\n/);
        updateCerts[i].shift();
        updateCerts[i].pop();
        }
      }
      console.log(updateCerts);
      driveroff();

          let i = 0;
          if (inti !=0) {
          updateMap[i] = {
            Id:id,
            Certifications__c : '<div>' + inti + '</div>' + updateCerts.join('</br>')
        }
      }

    } catch (e) {
        console.log('Error 4' + e);
    }   
    finally {
    }  

    if (true) {  
        
      updateMap = updateMap.filter(function(e){return e}); 
  
     //console.log(updateMap);

      conn.sobject("LeaderBoard__c").update(updateMap,
        function(err, rets) {
          if (err) { return console.error('err:' , err); }
          for (var i=0; i < rets.length; i++) {
            if (rets[i].success) {
              console.log("Updated Successfully : " + rets[i].id + ' ' + rets[i]);
            } else {
                console.log('problem?', err)
            }
          }
        });
  
        updateMap = [];
      }

      //await driver.close();
}


