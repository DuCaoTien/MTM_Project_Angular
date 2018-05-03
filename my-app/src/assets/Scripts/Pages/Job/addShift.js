function AddJobShift(jobId, submitShiftUrl) {
    const $this = this; // public
    const configs = {
        $vehiclesTable: null,
        vehiclesTableId: "#tblVehicles",
        $vehiclesDatatable: $("#tblVehicles"),
        $ownedPETable: $("#tblOwnedPE"),
        $hiredPETable: $("#tblHiredPE"),
        vehicleDataSet: null,
        ownedPEDataSet: null,
        hiredPEDataset: null,
        $: {},
        RECURRENCE_TYPE: {
            DAILY: 1,
            WEEKLY: 2,
            MONTHLY: 3,
            YEARLY: 4
        },
        worklogType: {
            teamLeader: 'TeamLeader',
            teamMember: 'TeamMember',
            contractor: 'Contractor'
        }

    }; // private
    $this.jobId = jobId;
    $this.submitShiftUrl = submitShiftUrl;
    const urls = apiUrl;
    $this.worklogs = [];
    $this.unknowWorkLogs = [];
    configs.contactAutoComplete = new ContactAutoComplete();

    configs.addContactModal = new AddContactModal();

    $this.funcs = {
        addWorkog: function(obj, isFirstInsert, index) {
            var $table = $(findElement('#worklog-datatable tbody'));
            var template = shiftConfigs.worklogTemplate;
            if (isFirstInsert) {
                $table.html('');
            }
            template = template
                .replace('{0}', obj.Id)
                .replace('{1}', obj.Name)
                .replace('{2}', obj.WorklogType.replace(/([A-Z])/g, ' $1').trim())
                .replace('{3}', parseInt(obj.Travel))
                .replace('{4}', obj.StartTime)
                .replace('{5}',  parseInt(obj.Break))
                .replace('{6}', obj.FinishTime)
                .replace('{7}', obj.EntityId)
                .replace('{8}', obj.WorklogType)
                .replace(obj.WorklogStatus + '-selected', 'selected');
            template = replaceAll(template, '\\{9\\}', index);

            if (obj.worklogType == "Contractor") {
                template = template.replace('tdStatus', 'hidden');
            }

            $table.append(template);
        },
        rebuildWorklogTable: function () {
            // get current worklog before rebuild
            $this.funcs.getCurrentWorklogs();

            var $startDate = $('#StartDate');
            var startTime = $(findElement('#StartTime')).val();
            if (startTime == "") {
                startTime = "00:00";
            }
            var $endDate = $('#EndDate');
            var startTimeHour = parseInt(startTime.split(':')[0]);
            var startTimeMinutes = parseInt(startTime.split(':')[1]);
            var endTime = $(findElement('#EndTime')).val();
            if (endTime == "") {
                endTime = "00:00";
            }
            var endTimeHour = parseInt(endTime.split(':')[0]);
            var endTimeMinutes = parseInt(endTime.split(':')[1]);

            var newWorklogs = [];
            var teamLeaderId = $(findElement('#Schedule_TeamLeaderId')).val().replace("[Team Leader - select if TL unknown]", "");

            if (teamLeaderId && teamLeaderId != "") {
                var $teamLeader = $(findElement('#Schedule_TeamLeaderId option[value=' + teamLeaderId + ']'))[0];

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
            } else{

            }

            var teamMemberIds = $(findElement('#Schedule_TeamMembers')).val();
            if (teamMemberIds && teamMemberIds.length > 0) {
                for (let i = 0; i < teamMemberIds.length; i++) {
                    if (teamMemberIds[i] != "") {
                        var $teamMember = $(findElement('#Schedule_TeamMembers option[value=' + teamMemberIds[i] + ']'))[0];
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

            var contractors = configs.shift2Supplier.funcs.getShift2Suppliers();
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
            $this.worklogs = $this.funcs.updateWorklogs(newWorklogs);

            if ($this.worklogs.length == 0) {
                var $table = $(findElement('#worklog-datatable tbody'));
                $table.html('<tr class="not-found"><td colspan="7" class="not-found text-center">No data found</td></tr>');
            } else {
                for (let i = 0; i < $this.worklogs.length; i++) {
                    $this.funcs.addWorkog($this.worklogs[i], i == 0, i);
                }

                // reinit time picker control
                $(findElement('.time-picker-timesheet-startTime')).timepicker({
                    showMeridian: false,
                    orientation: "bottom",
                    autoclose: true,
                    minuteStep: 10,
                });

                $(findElement('.time-picker-timesheet-finishTime')).timepicker({
                    showMeridian: false,
                    orientation: "bottom",
                    autoclose: true,
                    minuteStep: 10,
                });
            }
        },
        getCurrentWorklogs: function (id) {
            $this.worklogs = [];
            var $tr = $(findElement('#worklog-datatable tbody tr:not(.not-found)'));
            $tr.each(function (index, value) {
                var $item = $(value);
                $this.worklogs.push({
                    Id: typeof (id) != "undefined" ? id : $item.data('id'),
                    Name: $item.find('.name').text(),
                    EntityId: $item.data('entityid'),
                    WorklogType: $item.data('worklogtype'),
                    Travel: $item.find('.travel input').val(),
                    StartTime: $item.find('.startTime input').val(),
                    Break: $item.find('.break input').val(),
                    FinishTime: $item.find('.finishTime input').val(),
                    WorklogStatus: $item.data('worklogtype') == configs.worklogType.contractor ? "Confirmed" :$item.find('.status select').val(),
                });
            });
            return $this.worklogs;
        },
        getCurrentUnKnownWorklogs: function (id) {
           return ($this.unknowWorkLogs || []).map(function(unknowWorkLog) {
            return Object.assign({}, unknowWorkLog, {
                Id: typeof unknowWorkLog.Id === 'number' ? unknowWorkLog.Id : 0
            })
        })
        },
        updateWorklogs: function (newWorklogs) {
            for (let i = 0; i < newWorklogs.length; i++) {
                for (let j = 0; j < $this.worklogs.length; j++) {
                    if ($this.worklogs[j].WorklogType == newWorklogs[i].WorklogType && $this.worklogs[j].EntityId == newWorklogs[i].EntityId) {
                        if (newWorklogs[i].WorklogType == "Contractor") {
                            // if ID is the same
                            if ($this.worklogs[j].Id == newWorklogs[i].Id) {
                                newWorklogs[i].Travel = $this.worklogs[j].Travel;
                                newWorklogs[i].Break = $this.worklogs[j].Break;
                                newWorklogs[i].StartTime = $this.worklogs[j].StartTime;
                                newWorklogs[i].FinishTime = $this.worklogs[j].FinishTime;
                                newWorklogs[i].WorklogStatus = $this.worklogs[j].WorklogStatus;
                            }
                        } else {
                            newWorklogs[i].Travel = $this.worklogs[j].Travel;
                            newWorklogs[i].Break = $this.worklogs[j].Break;
                            newWorklogs[i].StartTime = $this.worklogs[j].StartTime;
                            newWorklogs[i].FinishTime = $this.worklogs[j].FinishTime;
                            newWorklogs[i].WorklogStatus = $this.worklogs[j].WorklogStatus;
                        }
                    }
                }
            }
            return newWorklogs;
        },

        findElement: function (selector) {
            return findElement(selector);
        },

        resetFormData: function() {
            $(findElement("#shift_form"))[0].reset();
            $(findElement("#shift_form .select2")).val('').trigger("change");
            $(findElement("#shift_form .select2-multiple")).val('').trigger("change");
            $(findElement("#shift_form .special-case")).val('').trigger("change");

            configs.attachment.funcs.resetAttachments();
            configs.shift2Supplier.funcs.reset();

            resetForm();
        },

        resetRecurrenceFormData: function () {
            $(findElement("#add_shift_form"))[0].reset();
            $(findElement("#add_shift_form .select2")).val('').trigger("change");
            $(findElement("#add_shift_form .select2-multiple")).val('').trigger("change");
            $(findElement("#add_shift_form .special-case")).val('').trigger("change");

            configs.attachment.funcs.resetAttachments();
            configs.shift2Supplier.funcs.reset();
        },

        submitForm: function (asset) {
            configs.shift2Supplier.funcs.getData();
            asset.funcs.setData();

            var successValidateCallback = function () {
                var d = deferredSubmitAjaxForm(apiUrl.shift.addSingular, findElement("#shift_form"), "Shift");

                $.when(d).done(function (resp) {
                    if (!resp.status) {
                        showAjaxFailureMessage(resp.message);

                        return;
                    }

                    var successCallback = function () {
                        showAjaxSuccessMessage(resp.message.message);

                        var $startDate = $(findElement("#shift_form")).find("#StartDate");
                        var redirectToUrl = `/runsheet?date=${$startDate.val()}`;
                        window.open(redirectToUrl, "_self");
                    }

                    // Save attachment
                    var files = configs.attachment.funcs.getFiles();
                    var requestParam = configs.attachment.funcs.getRequestParam([resp.message.id]);
                    if (files && requestParam) {
                        ajaxUploadMultipleFileForShifts(configs.attachment.configs.urls.upload, files, requestParam, successCallback);
                    } else {
                        successCallback();
                    }
                });
            }

            // Validate attachment
            var files = configs.attachment.funcs.getFiles();
            var requestParam = configs.attachment.funcs.getRequestParam([-1]);
            if (files && requestParam) {
                ajaxUploadMultipleFileForShifts(configs.attachment.configs.urls.verifyUpload,
                    files,
                    requestParam,
                    successValidateCallback);
            } else {
                var d = deferredSubmitAjaxForm(apiUrl.shift.addSingular, findElement("#shift_form"), "Shift");

                $.when(d).done(function (resp) {
                    if (!resp.status) {
                        showAjaxFailureMessage(resp.message);

                        return;
                    }

                    showAjaxSuccessMessage(resp.message.message);

                    var $startDate = $(findElement("#shift_form")).find("#StartDate");
                    var redirectToUrl = `/runsheet?date=${$startDate.val()}`;
                    window.open(redirectToUrl, "_self");
                });
            }
        },

        submitRecurrenceForm: function (asset) {
            configs.shift2Supplier.funcs.getData();
            asset.funcs.setData();

            var $form = $(`#${findElement("#add_shift_form").replace('#', '')}`);
            var $teamLeaderId = $form.find('#Schedule_TeamLeaderId');
            var teamLeaderId = ($form.find('#Schedule_TeamLeaderId').val()+"").replace("[Team Leader - select if TL unknown]", "");
            $teamLeaderId.val(teamLeaderId);
            
            submitRecurrenceAjaxForm(urls.shift.totalRecurrence, findElement("#add_shift_form").replace('#', ''), "Shift", function (response) {
                if(!response.response || response.response.length == 0){
                    return;
                }

                swal({
                    title: "Are you sure?",
                    text: response.message,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: 'Yes, create',
                    cancelButtonText: "No, cancel",
                    closeOnConfirm: true,
                    closeOnCancel: true
                }, function (isConfirm) {
                    
                    if (isConfirm) {
                        const d = deferredSubmitAjaxForm($this.submitShiftUrl, findElement("#add_shift_form"), "Shift");
                        $.when(d).done(function (resp) {
                            if (!resp.status) {
                                showAjaxFailureMessage(resp.message);
                                return;
                            }

                            var successCallback = function(){
                                showAjaxSuccessMessage(resp.message.message);
                                window.location.reload();
                            }

                            // Save attachment
                            const files = configs.attachment.funcs.getFiles();
                            var requestParam = configs.attachment.funcs.getRequestParam(resp.message.ids);
                            if (files && requestParam) {
                                ajaxUploadMultipleFileForShifts(configs.attachment.configs.urls.upload, files, requestParam, successCallback);
                            } else{
                                successCallback();
                            }
                        });
                    }
                });
            }, '', true);
        },

        submitFormsAndClose: function (asset) {
            $this.funcs.submitForm(asset);
        },

        addContact: function () {
            configs.addContactModal.funcs.add();
        },

        initial: function (selector, shiftId, shift2Suppliers) {
            configs.selector = selector;
            configs.addShiftModal = $(configs.selector);
            configs.addContactConfigs = {
                modalId: "AddContactModal",
                formId: "add_contact_form",
                selectId: findElement("#SiteContactId"),
                url: {
                    add: urls.contact.addWithReturnId
                }
            };
            configs.$ = {
                recurrenceTypes: $(findElement('input[type="radio"][name="RecurrenceType"]')),
                dailyDetails: $(findElement('#recurrence-pattern-daily-details')),
                weeklyDetails: $(findElement('#recurrence-pattern-weekly-details')),
                monthlyDetails: $(findElement('#recurrence-pattern-monthly-details')),
                yearlyDetails: $(findElement('#recurrence-pattern-yearly-details')),
                monthlyRecurEvery: $(findElement('#MonthlyRecurEvery')),
                monthlyRecurEvery1: $(findElement('#MonthlyRecurEvery1')),
                monthlyRecurEvery2: $(findElement('#MonthlyRecurEvery2')),
                yearlyOnMonth: $(findElement('#YearlyOnMonth')),
                yearlyOnMonth1: $(findElement('#YearlyOnMonth1')),
                yearlyOnMonth2: $(findElement('#YearlyOnMonth2')),
            };

            configs.shiftId = shiftId;
            configs.addShiftSupplierContent = $(findElement("#addShiftSupplierContent"));

            configs.attachment = new Attachment(configs.selector);
            configs.shift2Supplier = new Shift2Supplier(configs.selector, shift2Suppliers);

            $(findElement('#Schedule_QuantityOfTeamMember')).removeAttr('readonly');

            // Contact
            configs.contactAutoComplete.funcs.initEvents(findElement("#CustomerId"), findElement("#SiteContactId"));
            configs.addContactModal.funcs.init(configs.addContactConfigs);

            $(`#${configs.addContactConfigs.modalId} button.ladda-button`).attr("onclick", "addJobShift.funcs.addContact()");

            // Modal size
            configs.addShiftModal.on("shown.bs.modal", function () {
                if (!configs.shiftId) {
                    resetForm();
                }

                //Add Contact
                $("span").removeClass("select2-container--bootstrap");
            });

            // Tabs
            $(findElement('.nav-tabs a[data-toggle="tab"]')).on("shown.bs.tab", function (e) {
                triggerEvents($(e.target).attr("href"));
            });

            // Trigger active tab
            triggerEvents($(findElement('.nav-tabs li.active a[data-toggle="tab"]')).attr("href"));

            // Shift details
            configs.$.recurrenceTypes.change(function() {
                var $this = $(this);
                var recurrenceType = parseInt($this.data("type"));

                // Hide all details
                configs.$.dailyDetails.hide();
                configs.$.weeklyDetails.hide();
                configs.$.monthlyDetails.hide();
                configs.$.yearlyDetails.hide();

                switch(recurrenceType){
                    case configs.RECURRENCE_TYPE.DAILY: {
                         configs.$.dailyDetails.show();
                        break;
                    }
                    case configs.RECURRENCE_TYPE.WEEKLY: {
                        configs.$.weeklyDetails.show();
                        break;
                    }
                    case configs.RECURRENCE_TYPE.MONTHLY: {
                        configs.$.monthlyDetails.show();
                        break;
                    }
                    case configs.RECURRENCE_TYPE.YEARLY: {
                        configs.$.yearlyDetails.show();
                        break;
                    }
                }
            });

            // Monthly events
            configs.$.monthlyRecurEvery1.change(function(){
                var $this = $(this);
                var monthlyRecurEvery = $this.val();
                
                configs.$.monthlyRecurEvery.val(monthlyRecurEvery);
                configs.$.monthlyRecurEvery1.val(monthlyRecurEvery);
                configs.$.monthlyRecurEvery2.val(monthlyRecurEvery);
            });

            configs.$.monthlyRecurEvery2.change(function(){
                var $this = $(this);
                var monthlyRecurEvery = $this.val();
                
                configs.$.monthlyRecurEvery.val(monthlyRecurEvery);
                configs.$.monthlyRecurEvery1.val(monthlyRecurEvery);
                configs.$.monthlyRecurEvery2.val(monthlyRecurEvery);
            });

             // Yearly events
            configs.$.yearlyOnMonth1.change(function(){
                var $this = $(this);
                var yearlyOnMonth = $this.val();
                
                configs.$.yearlyOnMonth.val(yearlyOnMonth);
                configs.$.yearlyOnMonth1.val(yearlyOnMonth);
                configs.$.yearlyOnMonth2.val(yearlyOnMonth);
            });

            configs.$.yearlyOnMonth2.change(function(){
                var $this = $(this);
                var yearlyOnMonth = $this.val();
                
                configs.$.yearlyOnMonth.val(yearlyOnMonth);
                configs.$.yearlyOnMonth1.val(yearlyOnMonth);
                configs.$.yearlyOnMonth2.val(yearlyOnMonth);
            });

            // Input number
            $(findElement('#recurrence-details input[type="number"][data-type="day"]')).keyup(function() {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);
                if(number > 31) number = 31;

                $this.val(number);
            });

            $(findElement('#recurrence-details input[type="number"][data-type="week"]')).keyup(function() {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);

                $this.val(number);
            });

            $(findElement('#recurrence-details input[type="number"][data-type="month"]')).keyup(function() {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);
                if(number > 12) number = 12;

                $this.val(number);
            });

            $(findElement('#recurrence-details input[type="number"][data-type="year"]')).keyup(function() {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);

                $this.val(number);
            });

            $(findElement("#btn-add-option")).click(function() {
                configs.shift2Supplier.funcs.addOption();
            });

            $(findElement(".select2.team-leader")).select2({
                placeholder: "Select an option",
            }).on('change', function (evt) {
                $this.funcs.rebuildWorklogTable();
            });

            // team member
            $(findElement(".select2-multiple.team-member")).select2({
                placeholder: "Select multiple options"
            }).on("select2:select", function (evt) {
                if (evt.params.data.id == "-1") {
                    $(findElement("#Schedule_QuantityOfTeamMember")).removeAttr("readonly");
                    $(this).val("-1").trigger("change");
                } else {
                    if (evt.params.data.id == $(findElement(".select2.team-leader")).val()) {
                        var array = $(this).val();
                        if (array != null && array != "") {
                            var itemIndex = array.indexOf(evt.params.data.id);
                            if (itemIndex > -1) {
                                array.splice(itemIndex, 1);
                            }
                            $(this).val(array).trigger("change");
                        }
                    } else {
                        const values = $(findElement("#Schedule_TeamMembers")).val();
                        const index = contains.call(values, "-1");
                        if (index >= 0) {
                            values.splice(index, index);
                            $(this).val(values).trigger("change");
                        }
                    }
                }
            }).on("select2:unselect", function (evt) {
            }).on('change', function (evt) {
                $this.funcs.rebuildWorklogTable();
            });

            $this.unknowWorkLogs = generateNewUnknowWorkLog($this.unknowWorkLogs, 0);

            // On change number of team member
            $(findElement('#Schedule_QuantityOfTeamMember')).off('change').on('change', function() {
                var numberOfTeamMember = parseInt($(findElement('#Schedule_QuantityOfTeamMember')).val() || "0");

                console.log("numberOfTeamMember: ", numberOfTeamMember)
                console.log("old $this.unknowWorkLogs: ", $this.unknowWorkLogs)

                $this.unknowWorkLogs = generateNewUnknowWorkLog($this.unknowWorkLogs, numberOfTeamMember)

                $this.funcs.rebuildUnKnowWorklogTable($this.unknowWorkLogs);

                console.log("new $this.unknowWorkLogs: ", $this.unknowWorkLogs)
            });

            $(findElement("#attachments .form-actions.noborder")).html("");
            //shift does not require team leader feature

            $(findElement("#IsNotRequiredTeamLeader")).on('click', function () {

                if ($(this).parent().hasClass('checked')) {

                    $(findElement(".select2.team-leader")).attr("disabled", false);
                }
                else {
                    $(findElement(".select2.team-leader")).attr("disabled", true);
                    $(".select2.team-leader").val('-1').trigger('change.select2');
                }

            });
            //shift does not require team leader feature

            $(findElement("#IsNotRequiredTeamLeader")).on('click', function () {

                if ($(this).parent().hasClass('checked')) {

                    $(findElement(".select2.team-leader")).attr("disabled", false);
                }
                else {
                    $(findElement(".select2.team-leader")).attr("disabled", true);
                    $(".select2.team-leader").val('-1').trigger('change.select2');
                }

            });

        },

        initVehiclesTable: function (dataset) {
            configs.vehicleDataSet = dataset;
        },

        initOwnedPETable: function (dataset) {
            configs.ownedPEDataSet = dataset;
        },

        initHiredPeTable: function (dataset) {
            configs.hiredPEDataset = dataset;
        },

        addUnKnowWorkog: function (obj) {
            var $table = $(findElement('#unknow-worklog-datatable tbody'));
            var template = shiftConfigs.unKnowWworklogTemplate;
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

            template = replaceAll(template, '{9}', obj.Id);

            $table.append(template);
        },

        rebuildUnKnowWorklogTable: function (unknowWorkLogs) {
            $(findElement('#unknow-worklog-datatable tbody')).html('');

            for (var i = 0; i < unknowWorkLogs.length; i++) {
                var unknownWorkLog = unknowWorkLogs[i];
                // Only display unknown worklog of team member
                if(unknownWorkLog.WorklogType != "TeamLeader") $this.funcs.addUnKnowWorkog(unknowWorkLogs[i]);
            }

            // reinit time picker control
            initTimePickerEvent();
        }

    };

    // Private functions
    function findElement(selector) {
        return `${configs.selector} ${selector}`; // Ex: #formDatatable
    }

    function resetForm() {
        configs.addShiftSupplierContent.html("");
        configs.shift2Supplier.funcs.renderDefaultOptions();

        // Reset Attachments
        const customFilterDocumentParam = {
            "filterByShiftId": configs.shiftId
        };
    };

    function triggerEvents(tabId) {
        switch (tabId) {
            case "#recurrence-attachments":
            case "#attachments":
                {
                    configs.attachment.funcs.initPage();
                    break;
                }
            case "#recurrence-interactiveForm":
                {
                    addJobRecurrenceShiftForm.funcs.initPage();
                    break;
                }
            case "#interactiveForm":
                {
                    addJobShiftForm.funcs.initPage();
                    break;
                }
            case "#recurrence-schedule":
            case "#schedule":
                {
                    configs.shift2Supplier.funcs.initPage(configs.shiftId);
                    break;
                }
            default: {
                break;
            }
        }
    };
}

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
            Travel: 0,
            StartTime: startTime,
            Break: 0,
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
                Travel: 0,
                StartTime: startTime,
                Break: 0,
                FinishTime: endTime,
                WorklogStatus: "Pending"
            };
            newUnKnowWorkLogs.push(newWorkLog);
        }
    }

    return newUnKnowWorkLogs;
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
    var unknowWorkLogs = $('#AddRecurrenceShiftModal').hasClass('in') ? addJobRecurrenceShift.unknowWorkLogs || [] : addJobShift.unknowWorkLogs || [];
    var unknowWorkLog = unknowWorkLogs.find(function(item) {
        return item.Id == unknowWorkLogId
    })

    unknowWorkLog.Travel = parseFloat($input.val() || "0");

    console.log("unknowWorkLog", unknowWorkLog)
}

function onChangeUnknowStartTime(event) {
    var $input = $(event.target);
    var $tr = $input.closest("tr");
    var unknowWorkLogId = $tr.data('id');
    var unknowWorkLogs = $('#AddRecurrenceShiftModal').hasClass('in') ? addJobRecurrenceShift.unknowWorkLogs || [] : addJobShift.unknowWorkLogs || [];
    var unknowWorkLog = unknowWorkLogs.find(function(item) {
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
    var unknowWorkLogs = $('#AddRecurrenceShiftModal').hasClass('in') ? addJobRecurrenceShift.unknowWorkLogs || [] : addJobShift.unknowWorkLogs || [];
    var unknowWorkLog = unknowWorkLogs.find(function(item) {
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
    var unknowWorkLogs = $('#AddRecurrenceShiftModal').hasClass('in') ? addJobRecurrenceShift.unknowWorkLogs || [] : addJobShift.unknowWorkLogs || [];
    var unknowWorkLog = unknowWorkLogs.find(function(item) {
        return item.Id == unknowWorkLogId
    })

    unknowWorkLog.Break = parseFloat($input.val() || "0");

    console.log("unknowWorkLog", unknowWorkLog)
}

function onChangeUnknowStatus(event) {
    var $input = $(event.target);
    var $tr = $input.closest("tr");
    var unknowWorkLogId = $tr.data('id');
    var unknowWorkLogs = $('#AddRecurrenceShiftModal').hasClass('in') ? addJobRecurrenceShift.unknowWorkLogs || [] : addJobShift.unknowWorkLogs || [];
    var unknowWorkLog = unknowWorkLogs.find(function(item) {
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