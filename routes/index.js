var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
var moment = require('moment');
var sampleObject = [];
var AllDates = [];

/* GET home page. */
router.get('/', function(req, res, next) {
//   console.log("Current date is ",new Date());
//   // From date to moment 
// var wrapped = moment().valueOf(); 
// console.log("From date to moment valueOf ",wrapped); 
// console.log("Add duration is : "+moment.duration(wrapped).add(100,'second'));
// // From moment to date 
// var date = wrapped.toDate(); 
// console.log("From moment to date ",date); 

  res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});

/* GET all data. */
router.get('/data', function (req, res, next) {
  function randomTime(start, end) {

    var initDateVal = false;
    var currentDate = '';
    // get the difference between the 2 dates, multiply it by 0-1, 
    // and add it to the start date to get a new date 
    function initDate() {
      var diff = end.getTime() - start.getTime();
      var new_diff = diff * Math.random();
      var date = new Date(start.getTime() + new_diff);
      //console.log("current random Date is : ",date);
      if (AllDates.indexOf(date) === -1) {
        AllDates.push(date);
        initDateVal = true;
        currentDate = date;
      }
    }
    if(initDateVal !== true){    
      initDate();
    }
    
  }
  for (var i = 0; i <= 199; i++) { 
  randomTime(new Date("06-12-2018 00:00"), new Date("06-12-2018 23:00"));
  }
  for (var i = 0; i <= 199; i++) {  
    var successObject = {
      "BuldStatus": '',
      "BuildEndTime": '',
    };
    var failureObject = {
      "BuldStatus": '',
      "BuildStartTime": '',
    };
    if (i % 2 == 0) {
      successObject.BuldStatus = "Success";
      successObject.BuildEndTime = AllDates[i];
      sampleObject.push(successObject);
    } else {
      failureObject.BuldStatus = "Failure";
      failureObject.BuildStartTime = AllDates[i];
      sampleObject.push(failureObject);
    }
  }
  console.log(" sampleObject is : ",sampleObject);
  fs.writeFile("./sithu.json", JSON.stringify(sampleObject), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log("File has been created");
  });
  //res.render('index', { title: sampleObject });
  res.send(sampleObject);
});

/* Get builds details */
router.get('/builds', function(req,res,next){
  var currentDateTime = moment().valueOf();
  var diffSeconds = currentDateTime % 100;
  console.log("diffSeconds : ",diffSeconds);
  var currentDateTimeAdded = moment.duration(currentDateTime).subtract(diffSeconds,'second').valueOf();
  console.log('currentDateTimeAdded is : ',currentDateTimeAdded);
  var BuildStatus = (diffSeconds%2 === 0)?"Success":"Failure";
  var resObject = {
    "BuildStatus":BuildStatus,
    "BuildStartTime":currentDateTimeAdded,
    "BuildEndTime":currentDateTime
  };
  res.send(resObject);
});
router.get('/all', function(req,res,next){
  var todayBuilds = [];
  var time1 = '';
  var time2 = '';
  function getTodayBuilds(t1,t2,tsec){
    var currentDateTime = t2;
  var diffSeconds = tsec
  console.log("diffSeconds : ",diffSeconds);
  var currentDateTimeAdded = t1;
  console.log('currentDateTimeAdded is : ',currentDateTimeAdded);
  var BuildStatus = (diffSeconds%2 === 0)?"Success":"Failure";
  var resObject = {
    "BuildStatus":BuildStatus,
    "BuildStartTime":currentDateTimeAdded,
    "BuildEndTime":currentDateTime
  };
  todayBuilds.push(resObject);
  time2 = moment.duration(t2).add(180000,'second').valueOf();
  }
  for(var i=0;i<=100;i++){
    //time2 = new Date("06-13-2018 12:15").setMinutes(3);
    time2 = moment().valueOf();
    console.log("moment().valueOf() is : ",moment("06-13-2018 12:15").valueOf());
    var diffmins = time2 % 100;
    time1 = moment.duration(time2).subtract(diffmins,'second').valueOf();
    console.log("Time1 : ",time1);
    console.log("time2 ",time2);
    getTodayBuilds(time1,time2,diffmins);
  }
  res.send(todayBuilds);
});
module.exports = router;
