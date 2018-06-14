var app = angular.module('angularjsNodejsTutorial', ['angularMoment']);
app.controller('myController', function ($scope, $http, $interval,$window,moment) {
    $scope.BuildDetails = [];
    var buildCount = 0;
    $scope.data = [];
    var DashboardBuilds = '';
    $window.localStorage['DashboardBuilds'] = angular.toJson($scope.BuildDetails);
    DashboardBuilds = $window.localStorage['DashboardBuilds'];
    var SuccessBuild = [];
    var FailureBuild = [];
    // var request = $http.get('/data');    
    // request.success(function(data) {
    //     $scope.data = data;
    //     console.log("Current response is : ",data);
    // });
    // request.error(function(data){
    //     console.log('Error: ' + data);
    // });
    /**MTTR code started */

    function calculateHours(startTimeStampInMS, endTimeStampInMS) {
        console.log("startDate.getTime() is : ", moment(startTimeStampInMS).format('MMMM Do YYYY, h:mm:ss a'));
         console.log("endDate.getTime() is : ", moment(endTimeStampInMS).format('MMMM Do YYYY, h:mm:ss a'));
         console.log("Current Timestamp is : ",moment().format('MMMM Do YYYY, h:mm:ss a'));
        // Example milliseconds input
        // var startTimeStampInMS = 1490019060000;
        // var endTimeStampInMS = 1490085900000;                                
        var CurrentTimestamp = moment().valueOf();
        //console.log("CurrentTimestamp ",moment().valueOf());
        endTimeStampInMS = (endTimeStampInMS !== 0) ? endTimeStampInMS : CurrentTimestamp;
        //console.log("endDate.getTime() is : ", moment(endTimeStampInMS).format('MMMM Do YYYY, h:mm:ss a'));
        // Build moment duration object
        var duration = moment.duration(endTimeStampInMS - startTimeStampInMS);
        //console.log("duration is : ",duration);
        // Format duration in HH:mm format
        //console.log(duration.format('HH:mm', { trim: false }));
        var Mhours = duration.days() * 24 + duration.hours();
        var Mhours2Mins = (duration.days() * 24 + duration.hours()) * 60;
        Mhours2Mins = Mhours2Mins + duration.minutes();
        var MtotalHours = Mhours2Mins / 60;
        //console.log("Total Hours is : ",MtotalHours);
        return MtotalHours;
    }
    
                            //To get MEAN Time To Recovery
                            function getMeanTimeToRecovery(successObj, AllBuilds) {
                                console.log("i am in getMeanTimeToRecovery() ");
                                console.log(" successObj is : ",successObj);
                                console.log(" AllBuilds is : ",AllBuilds);
                                var MEANtimeDuration = 0;
                                var i = 0;
                                var instanceCount = 0;
                                var MTTR = 0;
                                if (successObj[0] !== "Failed") {
                                    console.log("current success Object :",successObj);
                                    for (i = successObj.length - 1; i >= 0; i--) {
                                        if (successObj[i - 1] !== undefined && (parseInt(successObj[i].BuildNumber) !== parseInt(successObj[i - 1].BuildNumber))) {
                                        console.log("successObj[i - 1] !== undefined && (parseInt(successObj[i].BuildNumber) !== parseInt(successObj[i - 1].BuildNumber)) ",successObj[i - 1] !== undefined && (parseInt(successObj[i].BuildNumber) !== parseInt(successObj[i - 1].BuildNumber)));
                                            if (i === successObj.length - 1) {
                                                var currentSuccessIteration = '';
                                                var getFailureTime = '';
                                                var getSuccessTime = '';
                                                currentSuccessIteration = function () {
                                                    for (var t = 0; t <= AllBuilds.length - 1; t++) {
                                                        if (AllBuilds[t].BuildNumber === successObj[i].BuildNumber) {
                                                            return t;
                                                        }
                                                    }
                                                };
                                                getFailureTime = function () {
                                                    for (var t = currentSuccessIteration(); t <= AllBuilds.length - 1; t++) {
                                                        if (AllBuilds[t].BuildStatus === "Failure") {
                                                            return AllBuilds[t].BuildStartTime;
                                                        }
                                                    }
                                                    return '';
                                                };
                                                getSuccessTime = moment().valueOf();

                                                if (getFailureTime() !== '' && getSuccessTime !== '') {
                                                    var a = calculateHours(getFailureTime(), getSuccessTime);
                                                    MEANtimeDuration += a;
                                                    instanceCount += 1;
                                                }
                                            }
                                            if (successObj[i - 1] !== undefined && (parseInt(successObj[i].BuildNumber) !== parseInt(successObj[i - 1].BuildNumber))) {
                                                console.log("i am in successObj.length !== 0",successObj);
                                                var successBuildTime = successObj[i].BuildEndTime;
                                                var failureBuildTime = '';
                                                failureBuildTime = getFailureBuildTime(i, successObj, AllBuilds);
                                                console.log("failureBuildTime() is : ", failureBuildTime());
                                                if (failureBuildTime !== "noData") {
                                                    var a = calculateHours(failureBuildTime, successBuildTime);
                                                    MEANtimeDuration += a;
                                                    instanceCount += 1;
                                                } else {
                                                    MEANtimeDuration = MEANtimeDuration;
                                                }
                                            }
                                        }else{
                                            console.log("Else part");
                                            console.log("successObj[i - 1] !== undefined && (parseInt(successObj[i].BuildNumber) !== parseInt(successObj[i - 1].BuildNumber)) ",successObj[i - 1] !== undefined && (parseInt(successObj[i].BuildNumber) !== parseInt(successObj[i - 1].BuildNumber)));
                                        } 
                                    }
                                    console.log("Before getMTTRvalue()"+MEANtimeDuration+"  "+instanceCount);
                                    return getMTTRvalue(MEANtimeDuration, instanceCount);
                                } else { //This else part getting MTTR value from initial failure Time
                                    var failureBuildTime = AllBuilds[0].BuildStartTime;
                                    var MTTR_Hours = calculateHours(failureBuildTime, 0);
                                    //console.log("MTTR_Hours is : ",MTTR_Hours);
                                    MEANtimeDuration += MTTR_Hours;
                                    instanceCount += 1;
                                    return getMTTRvalue(MEANtimeDuration, instanceCount);
                                }

                            }

                            //To get MTTR Value
                            function getMTTRvalue(MEANtimeDuration, instanceCount) {
                                //console.log("I am in getMTTRvalue");
                                //console.log("MEANtimeDuration is ",MEANtimeDuration);
                                //console.log("instanceCount is ",instanceCount);
                                var MeantTimeToResolvedData = 0;
                                var MTTR = 0;
                                if (instanceCount !== 0) {
                                    MeantTimeToResolvedData = MEANtimeDuration / instanceCount;
                                    //console.log("MeantTimeToResolvedData is ",MeantTimeToResolvedData);
                                    if (MeantTimeToResolvedData > 1) {
                                        MTTR = (MeantTimeToResolvedData * 60);
                                        //console.log("MTTR is : ",MTTR);
                                        var currentHours = (MTTR / 60).toFixed();
                                        var currentDays = '';
                                        var MTTR_Day = '';
                                        var currentHours1 = '';
                                        var currentHours2 = '';
                                        if (currentHours > 24) {
                                            MTTR = ((currentHours / 24).toFixed()) + " Days " + ((currentHours % 24).toFixed()) + " Hours";
                                        } else if (currentHours < 25) {
                                            MTTR = currentHours + " Hours";
                                        }
                                        //MTTR = (MTTR/60).toFixed()+" Hours "+(MTTR%60)+" Mins";
                                        //MTTR = Math.ceil(MeantTimeToResolvedData) + " Hours";
                                        return MTTR;
                                    } else if (MeantTimeToResolvedData < 1) {
                                        MTTR = (MeantTimeToResolvedData * 60).toFixed() + " Mins";
                                        return MTTR;
                                    }
                                } else {
                                    return "noData";
                                }
                            }

                            //Get FailureBuldTime
                            function getFailureBuildTime(i, successObj, AllBuilds) {
                                var getSuccCount = 0;
                                var j = '';
                                var k = '';
                                var l = '';
                                var getSuccessObj1 = '';
                                var getSuccessObj2 = '';
                                var getFailureObj = '';
                                for (j = AllBuilds.length - 1; j >= 0; j--) {
                                    if (AllBuilds[j].id === successObj[i].id) {
                                        getSuccessObj1 = j;
                                    }
                                }
                                if (getSuccessObj1 !== '') {
                                    for (k = getSuccessObj1; k >= 0; k--) {
                                        if((i-1) !== -1){
                                            if (AllBuilds[k].id === successObj[i - 1].id) {
                                                getSuccessObj2 = k;
                                            }
                                        }
                                    }
                                    if (getSuccessObj2 !== getSuccessObj1) {
                                        if (getSuccessObj1 !== getSuccessObj2 + 1) {
                                            for (l = getSuccessObj2 + 1; l < getSuccessObj1; l++) {
                                                if (AllBuilds[l].BuildStatus === "Failure") {
                                                    return AllBuilds[l].BuildStartTime;
                                                }
                                            }
                                        }
                                        if(getSuccessObj2 !== '' && (i-1) !== -1){
                                                var currentSuccessIteration = '';
                                                var getFailureTime = '';
                                                var getSuccessTime = '';
                                                currentSuccessIteration = function () {
                                                    for (var t = 0; t <= AllBuilds.length - 1; t++) {
                                                        if (AllBuilds[t].BuildNumber === successObj[i].BuildNumber) {
                                                            return t;
                                                        }
                                                    }
                                                };
                                                    for (var t = 0; t < currentSuccessIteration(); t++) {
                                                        if (AllBuilds[t].BuildStatus === "Failure") {
                                                            return AllBuilds[t].BuildStartTime;
                                                        }
                                                    }                                                
                                        }

                                    }
                                }
                            }   
    /**MTTR code stopped */


    function finalMethod(currentBuilds){
        SuccessBuild = [];
        FailureBuild = [];
        //var currentBuilds = JSON.parse($window.localStorage['DashboardBuilds']);
        angular.forEach(currentBuilds,function(value, key){
            //console.log("Current value is : ",value);
            if(value.BuildStatus === "Success"){
                SuccessBuild.push(value);
            }else if(value.BuildStatus === "Failure"){
                FailureBuild.push(value);
            }

        });
        var newMTTR = getMeanTimeToRecovery(SuccessBuild,currentBuilds);
        console.log("New MTTR is : ",newMTTR);
    }
    function getCurrentBuilds() {
        $http.get('/builds').
            success(function (response) {
                console.log("currentBuilds details is ", response);
                response.BuildNumber = buildCount;
                $scope.BuildDetails.push(response);
                /* To store json in loacalStorage */

                $window.localStorage['DashboardBuilds'] = angular.toJson($scope.BuildDetails);
                
                buildCount = buildCount + 1;
                //console.log("buildCount is : ", buildCount);
                //var DashboardBuilds = angular.fromJson($window.localStorage['DashboardBuilds']);
                DashboardBuilds = $window.localStorage['DashboardBuilds'];
                //console.log("In $http DashboardBuilds is : ",JSON.parse(DashboardBuilds));
                finalMethod(JSON.parse(DashboardBuilds));
                
            }).
            error(function (error) {
                console.log("error is ", error);
                
            });
    }
    console.log("Before Interval DashboardBuilds is : ",JSON.parse(DashboardBuilds));
    var increaseCounter = function () {
        // if(getCurrentBuilds() === true){
        // console.log(" in increaseCounter", $scope.BuildDetails);
        // console.log("in increaseCounter JSON.parse(DashboardBuilds) is : ",JSON.parse(DashboardBuilds));
        // }else{
        //     console.log("error from getCurrentBuilds()");
        //     console.log(" error in increaseCounter $scope.BuildDetails", $scope.BuildDetails);
        // console.log(" error in increaseCounter JSON.parse(DashboardBuilds) is : ",JSON.parse(DashboardBuilds));
        // }  
        getCurrentBuilds();     
    
    }

    $interval(increaseCounter, 120000);    
    //setInterval(getCurrentBuilds, 60000);
    //console.log("After Interval $scope.BuildDetails is : ", $scope.BuildDetails);

    /* To retrive json from localStorage */

    //var DashboardBuilds = angular.fromJson($window.localStorage['DashboardBuilds']);
    // var DashboardBuilds = $window.localStorage['DashboardBuilds'];
    // console.log("DashboardBuilds is : ",DashboardBuilds[0]);
    //console.log("DashboardBuilds is : ",JSON.parse(DashboardBuilds));

});