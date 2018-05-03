var runSheetSignalR = {
    urls: {
        getEmployeeData: apiUrl.runSheet.getEmployeeData,
        getShiftData: apiUrl.runSheet.getShiftData
    },
    initPage: function() {
        var shifts = runSheetConfigs.data.shifts || [];

        // Add shift changed event
        signalRHelper.funcs.addListener(signalRHelper.configs.eventType.shiftChanged,
            function(type, response) {
                console.log(response);

                var shiftId = response.Id;

                runSheetSignalR.getshift(shiftId, response.Activity, response.Field);
            }
        );

        // Add worklog changed event
        signalRHelper.funcs.addListener(signalRHelper.configs.eventType.worklogChanged,
            function(type, response) {
                console.log(response);

                runSheetSignalR.getshift(response.ShiftId, 2);
            }
        );
    },
    addShiftToDate: function (newshift) {
        var shifts = runSheetConfigs.data.shifts || [];

        var shift = shifts.find(function(item) {
            return item.id === newshift.id;
        });

        if (shift == null) {
            runSheetConfigs.data.shifts.push(newshift);
        }
    },
    getshift: function (shiftId, action, field) {
        var shifts = runSheetConfigs.data.shifts || [];
  
        var shift = shifts.find(function(item) {
            return item.id === shiftId;
        });

        //if (shift == null && action == 1 && field != "Shift") {
        //    return;
        //}

        var shiftIndex = runSheetConfigs.data.shifts.indexOf(shift);

        if (shift != null && action == 3) {
            // remove from shifts
            if (field != "Shift") {
                action = 2;
            } else {
                runSheetConfigs.data.shifts.remove(shift);
            }
        }

        var requestData = {
            date: runSheetFunctions.getCurrentDate(),
            shiftId: shiftId
        };

        var successCallback = function(response) {
            console.log(response);

            if (response != null) {
                runSheetFunctions.setSummary('team-leader-details', response.summary.teamLeaderAvailable);
                runSheetFunctions.setSummary('team-member-details', response.summary.teamMemberAvailable);
                runSheetFunctions.setSummary('shift-created-details', response.summary.shiftCreatedToday);

                if (response.shift != null) {
                    if (response.change != "") {
                        runSheetConfigs.data.shifts.remove(shift);
                    } else {
                        if (action == 1 && field == "Shift") { //add
                            runSheetSignalR.addShiftToDate(response.shift);
                        } else if ((action == 1 && field != "Shift") || action == 2) {
                            //update
                            if (shiftIndex >= 0) {
                                runSheetConfigs.data.shifts[shiftIndex] = response.shift;
                            } else {
                                var currentDateStr = new Date(runSheetFunctions.getCurrentDate()).toLocaleDateString();
                                var shiftDateStr = new Date(response.shift.startDateTime).toLocaleDateString();

                                if (currentDateStr == shiftDateStr) {
                                    runSheetSignalR.addShiftToDate(response.shift);
                                }
                            }
                            
                        }
                    }
                }
            }
            
            // Sort Descending
            runSheetConfigs.data.shifts.sort(function(shiftA, shiftB){
                if (shiftA.shiftNumber < shiftB.shiftNumber) {
                    return 1;
                  }
                  if (shiftA.shiftNumber > shiftB.shiftNumber) {
                    return -1;
                  }

                  // names must be equal
                  return 0;
            });

            runSheetFunctions.reloadLocalDataTable();
        };

        var errorCallback = function(response) {
            if (typeof (response.responseJSON) !== "undefined") {
                showAjaxFailureMessage(response.responseJSON);
            } else {
                var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                showAjaxFailureMessage(text);
            }
        }

        $.ajax({
            type: "POST",
            url: runSheetSignalR.urls.getShiftData,
            data: requestData,
            success: function(response) {
                return successCallback(response);
            },
            error: function(response) {
                errorCallback(response);
            },
            beforeSend: function() {
                //showAjaxLoadingMask();
            },
            complete: function() {
                //hideAjaxLoadingMask();

                //runSheetFunctions.reloadLocalDataTable();
            }
        });

        // runSheetFunctions.reloadLocalDataTable();
    },
    assignResource: function (shiftId, worklogid, resourceType, resourceTypeDesc, resourceId) {
       
        var shifts = runSheetConfigs.data.shifts || [];
        var shift = shifts.find(function(item) {
            return item.id === shiftId;
        });

        if (shift == null)
            return;

        var requestData = {
            shiftId: shiftId,
            worklogId: worklogid,
            worklogType: resourceType,
            entityId: resourceId
        };

        var successCallback = function(response) { console.log(response); };
       
        switch (resourceType) {
            case runSheetConfigs.worklogType.teamLeader:
                {
                    successCallback = function(response) {
                        shift.teamLeader = response;
                    };
                }
                break;
            case runSheetConfigs.worklogType.teamMember:
                {
                     successCallback = function(response) {
                         shift.teamMembers = shift.teamMembers.filter(e => e.id !== response.id);

                         shift.teamMembers.push(response);
                     };
                }
                break;
            case runSheetConfigs.worklogType.contractor:
                {
                   successCallback = function(response) {
                         shift.contractors = shift.contractors.filter(e => e.id !== response.id);

                         shift.contractors.push(response);
                     };
                }
                break;
        }

        var errorCallback = function (response) {
            if (typeof (response.responseJSON) !== "undefined") {
                showAjaxFailureMessage(response.responseJSON);
            } else {
                var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                showAjaxFailureMessage(text);
            }
        }

        $.ajax({
            type: "POST",
            url: runSheetSignalR.urls.getEmployeeData,
            data: requestData,
            success: function (response) {
                return successCallback(response);
            },
            error: function (response) {
                errorCallback(response);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();

                runSheetFunctions.reloadLocalDataTable();
            }
        });
    }
};