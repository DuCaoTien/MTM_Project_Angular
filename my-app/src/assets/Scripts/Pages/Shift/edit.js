var shiftConfig = {
    worklogs: [],
    unknowWorkLogs: [],
    worklogType: {
        teamLeader: 'TeamLeader',
        teamMember: 'TeamMember',
        contractor: 'Contractor'
    },
};

var shiftFunctions = {
    initEvents: function () {
        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            var tabId = $(e.target).attr("href");

            shiftFunctions.triggerEvents(tabId);
        });
    },
    initPage: function () {
        shiftFunctions.initEvents();

        // Trigger active tab
        var tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        shiftFunctions.triggerEvents(tabId);
    },
    triggerEvents: function (tabId) {
        switch (tabId) {
            case "#attachments": {
                attachmentConfigs.attachmentType = "attachment";
                attachmentFunctions.initPage(customFilterDocumentParam);
                break;
            }
            case "#schedule": {
                shift2SupplierFunctions.initPage(shiftId);
                break;
            }
            case "#email-history": {
                emailHistoryFncs.initPage(shiftId);
                break;
            }
            default: {
                break;
            }
        }
    },
    addWorkog: function (obj, isFirstInsert) {
        var $table = $('#worklog-datatable tbody');
        var template = shiftConfig.worklogTemplate;
        if (isFirstInsert) {
            $table.html('');
        }
        template = template
            .replace('{0}', obj.Id)
            .replace('{1}', obj.Name)
            .replace('{2}', obj.WorklogType.replace(/([A-Z])/g, ' $1').trim())
            .replace('{3}', obj.Travel)
            .replace('{4}', obj.StartTime)
            .replace('{5}', obj.Break)
            .replace('{6}', obj.FinishTime)
            .replace('{7}', obj.EntityId)
            .replace('{8}', obj.WorklogType)
            .replace(obj.WorklogStatus + '-selected', 'selected');

        if (obj.worklogType == "Contractor") {
            template = template.replace('tdStatus', 'hidden');
        }

        $table.append(template);
    },
    addUnKnowWorkog: function (obj) {
        var $table = $('#unknow-worklog-datatable tbody');
        var template = shiftConfig.unKnowWworklogTemplate;
        template = template
            .replace('{0}', obj.Id || 0)
            .replace('{2}', obj.WorklogType.replace(/([a-z])([A-Z])/, '$1 $2'))
            .replace('{3}', obj.Travel)
            .replace('{4}', obj.StartTime)
            .replace('{5}', obj.Break)
            .replace('{6}', obj.FinishTime)
            .replace('{7}', obj.EmployeeId)
            .replace('{8}', obj.WorklogType)
            .replace(obj.WorklogStatus + '-selected', 'selected');

        $table.append(template);
    },
    rebuildWorklogTable: function () {
        // get current worklog before rebuild
        shiftFunctions.getCurrentWorklogs();

        var startTime = $('#StartTime').val();
        if (startTime == "") {
            startTime = "00:00";
        }
        var endTime = $('#EndTime').val();
        if (endTime == "") {
            endTime = "00:00";
        }
        var newWorklogs = [];
        var teamLeaderId = ($('#Schedule_TeamLeaderId').val() || "").replace("[Team Leader - select if TL unknown]", "");
        if(teamLeaderId && teamLeaderId != "") {
            var $teamLeader = $('#Schedule_TeamLeaderId option[value=' + teamLeaderId + ']')[0];

            newWorklogs.push({
                Id: -1,
                Name: $teamLeader.text,
                EntityId: teamLeaderId,
                WorklogType: "TeamLeader",
                Travel: "0",
                StartTime: startTime,
                Break: "0",
                FinishTime: endTime,
                WorklogStatus: "Pending"
            });
        }

        if (terminateIdsTeamLeader != null && terminateIdsTeamLeader.length > 0) {
            newWorklogs.push({
                Id: -1,
                Name: terminateIdsTeamLeader[0].name,
                EntityId: terminateIdsTeamLeader[0].Id,
                WorklogType: "TeamLeader",
                Travel: "0",
                StartTime: startTime,
                Break: "0",
                FinishTime: endTime,
                WorklogStatus: "Pending"
            });
        }

        var teamMemberIds = $('#Schedule_TeamMembers').val();
        if (teamMemberIds && teamMemberIds != "") {
            if (teamMemberIds != null && teamMemberIds.length > 0) {
                for (let i = 0; i < teamMemberIds.length; i++) {
                    if (teamMemberIds[i] != "") {
                        var $teamMember = $('#Schedule_TeamMembers option[value=' + teamMemberIds[i] + ']')[0];
                        if (teamMemberIds[i] != -1) {
                            newWorklogs.push({
                                Id: -1,
                                Name: $teamMember.text,
                                EntityId: teamMemberIds[i],
                                WorklogType: "TeamMember",
                                Travel: "0",
                                StartTime: startTime,
                                Break: "0",
                                FinishTime: endTime,
                                WorklogStatus: "Pending"
                            });
                        }
                    }
                }
            }
        }

        if (terminateIdsTeamMember != null && terminateIdsTeamMember.length > 0) {
            for (let i = 0; i < terminateIdsTeamMember.length; i++) {
                newWorklogs.push({
                    Id: -1,
                    Name: terminateIdsTeamMember[i].name,
                    EntityId: terminateIdsTeamMember[i].id,
                    WorklogType: "TeamMember",
                    Travel: "0",
                    StartTime: startTime,
                    Break: "0",
                    FinishTime: endTime,
                    WorklogStatus: "Pending"
                });
            }
        }

        var contractors = shift2SupplierFunctions.getShift2Suppliers();
        if (contractors != null && contractors.length > 0) {
            for (let i = 0; i < contractors.length; i++) {
                var contractorQuantity = contractors[i].Quantity;
                for (let j = 0; j < contractorQuantity; j++) {
                    newWorklogs.push({
                        Id: contractors[i].SupplierId + "_" + (j),
                        Name: contractors[i].SupplierName,
                        EntityId: contractors[i].SupplierId,
                        WorklogType: "Contractor",
                        Travel: "0",
                        StartTime: startTime,
                        Break: "0",
                        FinishTime: endTime,
                        WorklogStatus: "Confirmed"
                    });
                }
            }
        }

        // merge old and new worklog
        shiftConfig.worklogs = shiftFunctions.updateWorklogs(newWorklogs);

        if (shiftConfig.worklogs.length == 0) {
            var $table = $('#worklog-datatable tbody');
            $table.html('<tr class="not-found"><td colspan="7" class="not-found text-center">No data found</td></tr>');
        } else {
            for (let i = 0; i < shiftConfig.worklogs.length; i++) {
                shiftFunctions.addWorkog(shiftConfig.worklogs[i], i == 0);
            }

            // reinit time picker control
            initTimePickerEvent();
        }
    },
    getCurrentWorklogs: function (id) {
        shiftConfig.worklogs = [];
        var $tr = $('#worklog-datatable tbody tr:not(.not-found)');
        $tr.each(function (index, value) {
            var $item = $(value);
            shiftConfig.worklogs.push({
                Id: typeof (id) != "undefined" ? id : $item.data('id'),
                Name: $item.find('.name').text(),
                EntityId: $item.data('entityid'),
                WorklogType: $item.data('worklogtype'),
                Travel: $item.find('.travel input').val(),
                StartTime: $item.find('.startTime input').val(),
                Break: $item.find('.break input').val(),
                FinishTime: $item.find('.finishTime input').val(),
                WorklogStatus: $item.data('worklogtype') == shiftConfig.worklogType.contractor ? "Confirmed" : $item.find('.status select').val(),
            });
        });
        return shiftConfig.worklogs;
    },
    getCurrentUnKnowWorklogs: function () {
        return (shiftConfig.unknowWorkLogs || []).map(function(unknowWorkLog) {
            return Object.assign({}, unknowWorkLog, {
                Id: typeof unknowWorkLog.Id === 'number' ? unknowWorkLog.Id : 0
            })
        })
    },
    updateWorklogs: function (newWorklogs) {
        for (let i = 0; i < newWorklogs.length; i++) {
            for (let j = 0; j < shiftConfig.worklogs.length; j++) {
                if (shiftConfig.worklogs[j].WorklogType == newWorklogs[i].WorklogType && shiftConfig.worklogs[j].EntityId == newWorklogs[i].EntityId) {
                    if (newWorklogs[i].WorklogType == "Contractor") {
                        // if ID is the same
                        if (shiftConfig.worklogs[j].Id == newWorklogs[i].Id) {
                            newWorklogs[i].Travel = shiftConfig.worklogs[j].Travel;
                            newWorklogs[i].Break = shiftConfig.worklogs[j].Break;
                            newWorklogs[i].StartTime = shiftConfig.worklogs[j].StartTime;
                            newWorklogs[i].FinishTime = shiftConfig.worklogs[j].FinishTime;
                            newWorklogs[i].WorklogStatus = shiftConfig.worklogs[j].WorklogStatus;
                        }
                    } else {
                        newWorklogs[i].Travel = shiftConfig.worklogs[j].Travel;
                        newWorklogs[i].Break = shiftConfig.worklogs[j].Break;
                        newWorklogs[i].StartTime = shiftConfig.worklogs[j].StartTime;
                        newWorklogs[i].FinishTime = shiftConfig.worklogs[j].FinishTime;
                        newWorklogs[i].WorklogStatus = shiftConfig.worklogs[j].WorklogStatus;
                    }
                }
            }
        }
        return newWorklogs;
    },

    rebuildUnKnowWorklogTable: function (unknowWorkLogs) {
        $('#unknow-worklog-datatable tbody').html('');

        for (var i = 0; i < unknowWorkLogs.length; i++) {
            var unknownWorkLog = unknowWorkLogs[i];
            // Only display unknown worklog of team member
            if(unknownWorkLog.WorklogType != "TeamLeader") shiftFunctions.addUnKnowWorkog(unknowWorkLogs[i]);
        }

        // reinit time picker control
        initTimePickerEvent();
    }
}
$(document).ready(function () {
    shiftFunctions.initPage();

    $('#Schedule_QuantityOfTeamMember').removeAttr('readonly');

     // Update unknow worklogs
    if(shiftConfig.unknowWorkLogs && shiftConfig.unknowWorkLogs.length > 0) {
        for (var i = 0; i < shiftConfig.unknowWorkLogs.length; i++) {
            var startDate = moment(shiftConfig.unknowWorkLogs[i].StartTime);
            var finishTime = moment(shiftConfig.unknowWorkLogs[i].FinishTime);

            if(startDate.isValid()) {
                shiftConfig.unknowWorkLogs[i].StartTime = startDate.format("HH:mm")
            }

            if(finishTime.isValid()) {
                shiftConfig.unknowWorkLogs[i].FinishTime = finishTime.format("HH:mm")
            }
        }
    }

    //shift does not require team leader feature
    if ($('#IsNotRequiredTeamLeader').parent().hasClass('checked')) {

        $(".select2.team-leader").attr("disabled", true);
        $(".select2.team-leader").val('-1').trigger('change.select2');
    }
    else {
        $(".select2.team-leader").attr("disabled", false);
    }
    $("#IsNotRequiredTeamLeader").on('click', function () {

        if ($(this).parent().hasClass('checked')) {

            $(".select2.team-leader").attr("disabled", true);
            $(".select2.team-leader").val('-1').trigger('change.select2');
        }
        else {
            $(".select2.team-leader").attr("disabled", false);

        }

    });

    $(".select2.team-leader").select2({
        placeholder: "Select an option",
    }).on('change', function (evt) {
        var array = $(".select2-multiple.team-member").val();
        if (array != null && array != "") {
            var itemIndex = array.indexOf(this.value);
            if (itemIndex > -1) {
                array.splice(itemIndex, 1);
            }
            $(".select2-multiple.team-member").val(array).trigger("change");
        } else {
            shiftFunctions.rebuildWorklogTable();
        }
    });

    $(".select2-multiple.team-member").select2({
        placeholder: "Select multiple options",
    }).on('select2:select', function (evt) {
        if (evt.params.data.id == "-1") {
            $(this).val("-1").trigger("change");
        } else {
            if (evt.params.data.id == $(".select2.team-leader").val()) {
                var array = $(this).val();
                if (array != null && array != "") {
                    var itemIndex = array.indexOf(evt.params.data.id);
                    if (itemIndex > -1) {
                        array.splice(itemIndex, 1);
                    }
                    $(this).val(array).trigger("change");
                }
            } else {
                //$('#Schedule_QuantityOfTeamMember').attr('readonly', true).val(0);
                var values = $('#Schedule_TeamMembers').val();
                var index = contains.call(values, "-1");
                if (index >= 0) {
                    values.splice(index, index);
                    $(this).val(values).trigger("change");
                }
            }
        }
    }).on('select2:unselect', function (evt) {
    }).on('change', function (evt) {
        shiftFunctions.rebuildWorklogTable();
    });

    $("#schedule_form .select2-container").addClass('select2-container--default');

    // On change number of team member
    $('#Schedule_QuantityOfTeamMember').off('change').on('change', function() {
        var numberOfTeamMember = parseInt($('#Schedule_QuantityOfTeamMember').val() || "0");

        console.log("numberOfTeamMember: ", numberOfTeamMember)
        console.log("old shiftConfig.unknowWorkLogs: ", shiftConfig.unknowWorkLogs)

        shiftConfig.unknowWorkLogs = generateNewUnknowWorkLog(shiftConfig.unknowWorkLogs, numberOfTeamMember)

        shiftFunctions.rebuildUnKnowWorklogTable(shiftConfig.unknowWorkLogs);

        console.log("new shiftConfig.unknowWorkLogs: ", shiftConfig.unknowWorkLogs)
    });

    // Re-init unknown worklogs
    var numberOfTeamMember = parseInt($('#Schedule_QuantityOfTeamMember').val() || "0");

    shiftConfig.unknowWorkLogs = generateNewUnknowWorkLog(shiftConfig.unknowWorkLogs, numberOfTeamMember)

    shiftFunctions.rebuildUnKnowWorklogTable(shiftConfig.unknowWorkLogs);

    // reinit time picker control
    initTimePickerEvent();
});

// Generate new unknow worklog list
function generateNewUnknowWorkLog(unknowWorkLogs, numberOfTeamMember) {
    var startTime = $('#StartTime').val() || "00:00";
    var endTime = $('#EndTime').val() || "00:00";

    var employeeUnKnowWorkLogs = (unknowWorkLogs || []).filter(function(worklog) {
        return worklog.WorklogType == "TeamMember"
    }) || [];
    var newUnKnowWorkLogs = (unknowWorkLogs || []).filter(function(worklog) {
        return worklog.WorklogType == "TeamLeader"
    }) || [];

    // Add team leader unknown worklog if there is no
    var teamLeaderUnKnownWorkLog = (unknowWorkLogs || []).find(function(worklog) { return worklog.WorklogType == "TeamLeader" });

    if(!teamLeaderUnKnownWorkLog) {
        newUnKnowWorkLogs.push({
            Id: generateUUID(),
            EmployeeId: null,
            WorklogType: "TeamLeader",
            Travel: "0",
            StartTime: startTime,
            Break: "0",
            FinishTime: endTime,
            WorklogStatus: "Pending"
        });
    }

    var numberOfEmployeeWorkLog = employeeUnKnowWorkLogs.length;
   
    if(numberOfTeamMember <= numberOfEmployeeWorkLog) { // Quantity of team member <= number of employee worklogs
        for (var i = 0; i < numberOfTeamMember; i++) {
            newUnKnowWorkLogs.push(employeeUnKnowWorkLogs[i]);
        }
    } else { // Quantity of team member > number of employee worklogs
        for (var i = 0; i < numberOfEmployeeWorkLog; i++) {
            newUnKnowWorkLogs.push(employeeUnKnowWorkLogs[i]);
        }

        var remainingNumberOfTeamMember = numberOfTeamMember - numberOfEmployeeWorkLog;
        for (var i = 0; i < remainingNumberOfTeamMember; i++) {
            var newWorkLog = {
                Id: generateUUID(),
                EmployeeId: null,
                WorklogType: "TeamMember",
                Travel: "0",
                StartTime: startTime,
                Break: "0",
                FinishTime: endTime,
                WorklogStatus: "Pending"
            };
            newUnKnowWorkLogs.push(newWorkLog);
        }
    }

    return newUnKnowWorkLogs;
}

function getActiveTab() {
    var activeLi = $(".nav-tabs li.active");
    var aTag = !activeLi ? null : activeLi.find("a");
    return !aTag ? "" : aTag.attr("href");
}

function initTimePickerEvent() {
    // reinit time picker control
    $('.time-picker-timesheet-startTime').timepicker({
        showMeridian: false,
        orientation: "bottom",
        autoclose: true,
        minuteStep: 10,
        defaultTime: null,
    });

    $('.time-picker-timesheet-finishTime').timepicker({
        showMeridian: false,
        orientation: "bottom",
        autoclose: true,
        minuteStep: 10,
        defaultTime: null,
    })
}

function onChangeUnknowTravel(event) {
    var $input = $(event.target);
    var $tr = $input.closest("tr");
    var unknowWorkLogId = $tr.data('id');
    var unknowWorkLog = shiftConfig.unknowWorkLogs.find(function(item) {
        return item.Id == unknowWorkLogId
    })

    unknowWorkLog.Travel = $input.val();

    console.log("unknowWorkLog", unknowWorkLog)
}

function onChangeUnknowStartTime(event) {
    var $input = $(event.target);
    var $tr = $input.closest("tr");
    var unknowWorkLogId = $tr.data('id');
    var unknowWorkLog = shiftConfig.unknowWorkLogs.find(function(item) {
        return item.Id == unknowWorkLogId
    })

    console.log("StartTime: ", $input.val())
    unknowWorkLog.StartTime = $input.val();

    console.log("unknowWorkLog", unknowWorkLog)
}

function onChangeUnknowFinishTime(event) {
    var $input = $(event.target);
    var $tr = $input.closest("tr");
    var unknowWorkLogId = $tr.data('id');
    var unknowWorkLog = shiftConfig.unknowWorkLogs.find(function(item) {
        return item.Id == unknowWorkLogId
    })

    console.log("FinishTime: ", $input.val())
    unknowWorkLog.FinishTime = $input.val();

    console.log("unknowWorkLog", unknowWorkLog)
}

function onChangeUnknowBreak(event) {
    var $input = $(event.target);
    var $tr = $input.closest("tr");
    var unknowWorkLogId = $tr.data('id');
    var unknowWorkLog = shiftConfig.unknowWorkLogs.find(function(item) {
        return item.Id == unknowWorkLogId
    })

    unknowWorkLog.Break = $input.val();

    console.log("unknowWorkLog", unknowWorkLog)
}

function onChangeUnknowStatus(event) {
    var $input = $(event.target);
    var $tr = $input.closest("tr");
    var unknowWorkLogId = $tr.data('id');
    var unknowWorkLog = shiftConfig.unknowWorkLogs.find(function(item) {
        return item.Id == unknowWorkLogId
    })

    unknowWorkLog.WorklogStatus = $input.val();

    console.log("unknowWorkLog", unknowWorkLog)
}

function generateUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}