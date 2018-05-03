// Using for: reports settings

function ReportSettings() {
    const $this = this; // public
    $this.configs = {
        urls: {},
        $: {},
        RECURRENCE_TYPE: {
            DAILY: 1,
            WEEKLY: 2,
            MONTHLY: 3,
            YEARLY: 4,
            SINGLE : 5
        },
        MEMBER_TYPE: {
            wholeTeam: 1,
            individual: 2
        },
        REPORT_OPTIONS_TYPE: {
            customer: 2,
            employeeHoursWorked: 3,
            hirePlanAndEquipment: 4,
            payroll: 1,
            contractor: 5,
            detailedShiftWorked : 6
        },
        lists: {
            employees: [],
            customers: [],
            payrollEmployees: [],
            HiredPlanAndEquipments: [],

            employeeIds: [],
            customerIds: [],
            payrollEmployeeIds: [],
            HiredPlanAndEquipmentIds: []
        }
    }; // private
    $this.funcs = {
        loadModal: function (ModalUrl) {

            $.ajax({
                url: ModalUrl,
                type: 'POST',
                data: {Id : 0},
                dataType: 'html',
                success: function (response) {

                    $("#report-settings-row-create").html('');
                    $("#report-settings-row-create").html(response);
                    $this.funcs.initial();
                    //contractor
                    $(findElement('#ContractorIds')).select2();
                    $(findElement('#ContractorIds')).addClass('edited');
                    $(findElement('#ContractorIds')).removeClass('select2-container--bootstrap');
                    $(findElement('#ContractorIds')).addClass('select2-container--default');
                    //customer

                    $(findElement('#HiredPlantEquipmentIds')).select2();
                    $(findElement('#HiredPlantEquipmentIds')).addClass('edited');
                    $(findElement('#HiredPlantEquipmentIds')).removeClass('select2-container--bootstrap');
                    $(findElement('#HiredPlantEquipmentIds')).addClass('select2-container--default');
                    //employee

                    $(findElement('#EmployeeIds')).addClass('edited');
                    $(findElement('#EmployeeIds')).select2();
                    $(findElement('#EmployeeIds')).removeClass('select2-container--bootstrap');
                    $(findElement('#EmployeeIds')).addClass('select2-container--default');
                    //customer

                    $(findElement('#CustomerIds')).select2();
                    $(findElement('#CustomerIds')).addClass('edited');
                    $(findElement('#CustomerIds')).removeClass('select2-container--bootstrap');
                    $(findElement('#CustomerIds')).addClass('select2-container--default');
                    //payroll
                    $(findElement('#PayrollEmployeeIds')).select2();
                    $(findElement('#PayrollEmployeeIds')).addClass('edited');
                    $(findElement('#PayrollEmployeeIds')).removeClass('select2-container--bootstrap');
                    $(findElement('#PayrollEmployeeIds')).addClass('select2-container--default');
                    //recipients

                    $(findElement('#RecipientIds')).select2();
                    $(findElement('#RecipientIds')).addClass('edited');
                    $(findElement('#RecipientIds')).removeClass('select2-container--bootstrap');
                    $(findElement('#RecipientIds')).addClass('select2-container--default');
                    //radio, checkbox uniform
                    $('input:radio, input:checkbox, input#ReportName').uniform();
                    //datepicker

                    $(findElement('#SeriesStartDate')).datepicker({
                        orientation: "top",
                        autoclose: true,
                        format: constant.datePickerFormat,
                        todayHighlight: true,
                        todayBtn: true
                    });

                    $(findElement('#StartTime')).timepicker({
                        showMeridian: false,
                        orientation: "top",
                        autoclose: true,
                        minuteStep: 10,
                        defaultTime: null
                    });
                    $(findElement('#StartDate')).datepicker({
                        orientation: "top",
                        autoclose: true,
                        format: constant.datePickerFormat,
                        todayHighlight: true,
                        todayBtn: true
                    });

                    $(findElement('#EndDate')).datepicker({
                        orientation: "top",
                        autoclose: true,
                        format: constant.datePickerFormat,
                        todayHighlight: true,
                        todayBtn: true
                    });
                    //get and initialize data
                    $("#reportSettingsCreate").modal("show");
                },
                error: function (result) {
                    console.log("error: " + result);
                    
                },
                complete: function (result) {
                }
            });
        },
        initial: function () {
            
            $this.configs.selector = '#reportSettingsCreate';
            $this.configs.$ = {
                //recurrence
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

                //report criteria options 
                customer: $(findElement('#CustomerReportOptions')),
                employeeHoursWorked: $(findElement('#EmployeeHoursWorkedReportOptions')),
                hirePlanAndEquipment: $(findElement('#HirePlanAndEquipmentReportOptions')),
                payroll: $(findElement('#PayrollReportOptions'))
            };

           
            recurrenceTypeToggle($this.configs.RECURRENCE_TYPE.SINGLE);
            
            // Recurrence details
            $this.configs.$.recurrenceTypes.change(function () {
                var $thisInternal = $(this);
                var recurrenceType = parseInt($thisInternal.val());
                // Hide all details
                recurrenceTypeToggle(recurrenceType)
            });

            // Monthly events
            $this.configs.$.monthlyRecurEvery1.change(function () {
                var $thisInternal = $(this);
                var monthlyRecurEvery = parseInt($thisInternal.val());

                $this.configs.$.monthlyRecurEvery.val(monthlyRecurEvery);
                $this.configs.$.monthlyRecurEvery1.val(monthlyRecurEvery);
            });

            $this.configs.$.monthlyRecurEvery2.change(function () {
                var $thisInternal = $(this);
                var monthlyRecurEvery = parseInt($thisInternal.val());

                $this.configs.$.monthlyRecurEvery.val(monthlyRecurEvery);
                $this.configs.$.monthlyRecurEvery2.val(monthlyRecurEvery);
            });

            // Yearly events
            $this.configs.$.yearlyOnMonth1.change(function () {
                var $thisInternal = $(this);
                var yearlyOnMonth = parseInt($thisInternal.val());

                $this.configs.$.yearlyOnMonth.val(yearlyOnMonth);
                $this.configs.$.yearlyOnMonth1.val(yearlyOnMonth);
            });

            $this.configs.$.yearlyOnMonth2.change(function () {
                var $thisInternal = $(this);
                var yearlyOnMonth = parseInt($thisInternal.val());

                $this.configs.$.yearlyOnMonth.val(yearlyOnMonth);
                $this.configs.$.yearlyOnMonth2.val(yearlyOnMonth);
            });

            // Input number
            $(findElement('#recurrence-pattern-daily-details input[type="number"][data-type="day"]')).keyup(function () {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);
                if (number > 31) number = 31;
                $this.val(number);
            });

            $(findElement('#recurrence-pattern-weekly-details input[type="number"][data-type="week"]')).keyup(function () {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);

                $this.val(number);
            });

            $(findElement('#recurrence-pattern-monthly-details input[type="number"][data-type="month"][name="MonthlyRecurEvery1"]')).keyup(function () {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);
                if (number > 12) number = 12;

                $this.val(number);
            });

            $(findElement('#recurrence-pattern-monthly-details input[type="number"][data-type="month"][name="MonthlyRecurEvery2"]')).keyup(function () {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);
                if (number > 12) number = 12;

                $this.val(number);
            });

            $(findElement('#recurrence-pattern-yearly-details input[type="number"][data-type="year"]')).keyup(function () {
                var $this = $(this);
                var value = $this.val();
                var number = !value || value == "" ? 1 : parseInt(value);

                $this.val(number);
            });

            //payroll report options 
            $('.payroll-employee-ids').hide();
            toggleMemberType(parseInt($this.configs.payrollMemberType), $('.payroll-employee-ids'));
            $('input[name="PayrollMemberType"]').on('change', function () {
                var $thisInternal = $(this);
                var memberType = parseInt($thisInternal.val());
                var $memberType = $('#MemberType');
                var $employeeIdClass = $('.payroll-employee-ids');

                $memberType.val(memberType);

                toggleMemberType(memberType, $employeeIdClass);
            });

            //employee report options 
            $('.employee-ids').hide();
            toggleMemberType($this.configs.employeeMemberType, $('.employee-ids'));
            $('input[name="EmployeeMemberType"]').on('change', function () {
                var $thisInternal = $(this);
                var memberType = parseInt($thisInternal.val());
                var $memberType = $('#MemberType');
                var $employeeIdClass = $('.employee-ids');

                $memberType.val(memberType);

                toggleMemberType(memberType, $employeeIdClass);
            });

            //hired plan report options 
            $('.contractor-ids').hide();
            $('.hiredplantequipment-ids').hide();
            toggleMemberType($this.configs.constructorMemberType, $('.contractor-ids'));
            toggleMemberType($this.configs.hiredPlanMemberType, $('.hiredplantequipment-ids'));
            $('input[name="ContractorType"]').on('change', function () {
                var $thisInternal = $(this);
                var $contractorIdClass = $('.contractor-ids');
                var contractorType = parseInt($thisInternal.val());

                toggleMemberType(contractorType, $contractorIdClass);
            });
            $('input[name="HiredPlanMemberType"]').on('change', function () {
                var $thisInternal = $(this);
                var $hiredPlantEquipmentIdClass = $('.hiredplantequipment-ids');
                var memberType = parseInt($thisInternal.val());

                toggleMemberType(memberType, $hiredPlantEquipmentIdClass);
            });

            //customer report options 
            $('.customer-ids').hide();
            toggleMemberType($this.configs.customerMemberType, $('.customer-ids'));
            $('input[name="CustomerMemberType"]').on('change', function () {
                var $thisInternal = $(this);
                var memberType = parseInt($thisInternal.val());
                var $memberType = $('#MemberType');
                var $customerIdClass = $('.customer-ids');
                //var $employeeIds = $('#EmployeeIds');

                $memberType.val(memberType);

                toggleMemberType(memberType, $customerIdClass);
            });

            //report criteria settings
            $this.configs.$.customer.hide();
            $this.configs.$.employeeHoursWorked.hide();
            $this.configs.$.hirePlanAndEquipment.hide();
            $this.configs.$.payroll.hide();
            $('input[name="ReportType"]').on('change', function () {
                var $thisInternal = $(this);
                var optionType = parseInt($thisInternal.val());
                var $employeeIdClass = $('.employee-ids');


                //dropdownlist
                var $contractorIds = $('#ContractorIds');
                var $hiredplantequipmentIds = $('#HiredPlantEquipmentIds');
                var $employeeIds = $('#EmployeeIds');
                var $customerIds = $('#CustomerIds');
                var $payrollEmployeeIds = $('#PayrollEmployeeIds');

                //report type radio buttons
                $this.configs.$.customer.hide();
                $this.configs.$.employeeHoursWorked.hide();
                $this.configs.$.hirePlanAndEquipment.hide();
                $this.configs.$.payroll.hide();

                toggleReportTypeSettings(optionType);
                 
            })

            console.log(findElement('#SeriesStartDate'));

            
        },
        createReportSettings: function (formId) {
            var $form = $(`#${formId}`);
            var formObject = $form.serializeObjectX(); 
            if ($form != null && $form.valid()) {
                let formData = JSON.stringify(formObject);
                $.ajax({
                    type: "POST",
                    url: $this.configs.urls.createReportSettingsUrl,
                    data: formData,
                    dataType: "json",
                    contentType: "application/json",
                    success: function (response) {

                        if (typeof (response) == 'string') {
                            showAjaxSuccessMessage(response);
                        } else {
                            showAjaxSuccessMessage(response.message);
                        }
                    },
                    error: function (response) {
                        if (typeof (response.responseJSON) !== 'undefined') {
                            showAjaxFailureMessage(response.responseJSON);
                        }
                        else {
                            var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                            showAjaxFailureMessage(text);
                        }
                    },
                    beforeSend: function () {
                        showAjaxLoadingMask();
                    },
                    complete: function () {
                        hideAjaxLoadingMask();
                        reloadDatatable(report_scheduled_configs.$table);
                    }
                });
            }
        },
        createSettingsAndRunReport: function (formId) {
            var $form = $(`#${formId}`);
            var formObject = $form.serializeObjectX();

            if ($form != null && $form.valid()) {

                let formData = JSON.stringify(formObject);

                $.ajax({
                    type: "POST",
                    url: $this.configs.urls.createSettingAndRunReportUrl,
                    data: formData,
                    dataType: "json",
                    contentType: "application/json",
                    success: function (response) { 
                        showAjaxSuccessMessage("save Report Settings succesfully");
                        try {
                            newWindow.close();
                        } catch (ex) { }

                        if (response.isPreview == true) {
                            newWindow = window.open(response.previewUrl, "Report");
                        } else if (response.isPreview == false) {
                            // export to excel
                            newWindow = window.open(report.urls.exportUrl + "?fileName=" + response.fileName, '_blank');
                        }
                        if (newWindow) {
                            //Browser has allowed it to be opened
                            newWindow.focus();
                        } else {
                            //Browser has blocked it
                            alert('Please allow popups for this website');
                        }
                    },
                    error: function (response) {
                        if (typeof (response.responseJSON) !== 'undefined') {
                            showAjaxFailureMessage(response.responseJSON);
                        }
                        else {
                            var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                            showAjaxFailureMessage(text);
                        }
                    },
                    beforeSend: function () {
                        showAjaxLoadingMask();
                    },
                    complete: function () {
                        hideAjaxLoadingMask();
                        reloadDatatable(report_scheduled_configs.$table);
                    }
                });
            }
        },
        editReportSettings: function (formId)    {
            var $form = $(`#${formId}`);
            var formObject = $form.serializeObjectX();
            if ($form != null && $form.valid()) {
                let formData = JSON.stringify(formObject);
                $.ajax({
                    type: "POST",
                    url: $this.configs.urls.editReportSettingsUrl,
                    data: formData,
                    dataType: "json",
                    contentType: "application/json",
                    success: function (response) {

                        if (typeof (response) == 'string') {
                            showAjaxSuccessMessage(response);
                        } else {
                            showAjaxSuccessMessage(response.message);
                        }
                    },
                    error: function (response) {
                        if (typeof (response.responseJSON) !== 'undefined') {
                            showAjaxFailureMessage(response.responseJSON);
                        }
                        else {
                            var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                            showAjaxFailureMessage(text);
                        }
                    },
                    beforeSend: function () {
                        showAjaxLoadingMask();
                    },
                    complete: function () {
                        hideAjaxLoadingMask(); 
                        reloadDatatable(report_scheduled_configs.$table);
                    }
                });
            }
        },
        editSettingsAndRunReport: function (formId) {
            var $form = $(`#${formId}`);
            var formObject = $form.serializeObjectX();

            if ($form != null && $form.valid()) {

                let formData = JSON.stringify(formObject);

                $.ajax({
                    type: "POST",
                    url: $this.configs.urls.editSettingAndRunReportUrl,
                    data: formData,
                    dataType: "json",
                    contentType: "application/json",
                    success: function (response) { 
                        showAjaxSuccessMessage("save Report Settings succesfully");
                        try {
                            newWindow.close();
                        } catch (ex) { }

                        if (response.isPreview == true) {
                            newWindow = window.open(response.previewUrl, "Report");
                        } else if (response.isPreview == false) {
                            // export to excel
                            newWindow = window.open(report.urls.exportUrl + "?fileName=" + response.fileName, '_blank');
                        }
                        if (newWindow) {
                            //Browser has allowed it to be opened
                            newWindow.focus();
                        } else {
                            //Browser has blocked it
                            alert('Please allow popups for this website');
                        }
                    },
                    error: function (response) {
                        if (typeof (response.responseJSON) !== 'undefined') {
                            showAjaxFailureMessage(response.responseJSON);
                        }
                        else {
                            var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                            showAjaxFailureMessage(text);
                        }
                    },
                    beforeSend: function () {
                        showAjaxLoadingMask();
                    },
                    complete: function () {
                        hideAjaxLoadingMask();
                        //location.reload();
                        reloadDatatable(report_scheduled_configs.$table);
                    }
                });
            }
        },
        previewReport: function (formId) {
            var $form = $(`#${formId}`);
            var formObject = $form.serializeObjectX();

            if ($form != null && $form.valid()) {

                let formData = JSON.stringify(formObject);

                $.ajax({
                    type: "POST",
                    url: $this.configs.urls.previewReportUrl,
                    data: formData,
                    dataType: "json",
                    contentType: "application/json",
                    success: function (response) { 
                        try {
                            newWindow.close();
                        } catch (ex) { }

                        if (response.isPreview == true) {
                            newWindow = window.open(response.previewUrl, "Report");
                        } else if (response.isPreview == false) {
                            // export to excel
                            newWindow = window.open(report.urls.exportUrl + "?fileName=" + response.fileName, '_blank');
                        }
                        if (newWindow) {
                            //Browser has allowed it to be opened
                            newWindow.focus();
                        } else {
                            //Browser has blocked it
                            alert('Please allow popups for this website');
                        }
                    },
                    error: function (response) {
                        if (typeof (response.responseJSON) !== 'undefined') {
                            showAjaxFailureMessage(response.responseJSON);
                        }
                        else {
                            var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                            showAjaxFailureMessage(text);
                        }
                    },
                    beforeSend: function () {
                        showAjaxLoadingMask();
                    },
                    complete: function () {
                        hideAjaxLoadingMask();
                    }
                });
            }
        }
    }

    //find DOM in HTML doc by selector
    function findElement(selector) { 
        return `${$this.configs.selector} ${selector}`; // Ex: #formDatatable
    }

    function changeReportSettingsTitle(title)
    {
        $(findElement('#report-type-title')).text(title);
    }
    //recurrence type toggle
    function recurrenceTypeToggle(recurrenceType) {
        $this.configs.$.dailyDetails.hide();
        $this.configs.$.weeklyDetails.hide();
        $this.configs.$.monthlyDetails.hide();
        $this.configs.$.yearlyDetails.hide();

        switch (recurrenceType) {
            case $this.configs.RECURRENCE_TYPE.DAILY: {
                $this.configs.$.dailyDetails.show();
                break;
            }
            case $this.configs.RECURRENCE_TYPE.WEEKLY: {
                $this.configs.$.weeklyDetails.show();
                break;
            }
            case $this.configs.RECURRENCE_TYPE.MONTHLY: {
                $this.configs.$.monthlyDetails.show();
                break;
            }
            case $this.configs.RECURRENCE_TYPE.YEARLY: {
                $this.configs.$.yearlyDetails.show();
                break;
            }
            case $this.configs.RECURRENCE_TYPE.SINGLE: {
                $this.configs.$.dailyDetails.hide();
                $this.configs.$.weeklyDetails.hide();
                $this.configs.$.monthlyDetails.hide();
                $this.configs.$.yearlyDetails.hide();
                break;
            }
        }
    }

    //toggle member type
    function toggleMemberType($MemberTypeValue, $MemberTypeDOM) {
        switch ($MemberTypeValue) {
            case $this.configs.MEMBER_TYPE.wholeTeam: {
                //report.generateEmployeeList($employeeIds, []);
                $MemberTypeDOM.hide();

                break;
            }
            case $this.configs.MEMBER_TYPE.individual: {
                $MemberTypeDOM.show();
                break;
            }
        }
    }

    //toggle report type setttings
    function toggleReportTypeSettings(optionType) {
        switch (optionType) {

            case $this.configs.REPORT_OPTIONS_TYPE.payroll: {
                //generatePayrollEmployeeList($payrollEmployeeIds, $this.configs.lists.payrollEmployeeList, $this.configs.lists.payrollEmployeeIds);
                changeReportSettingsTitle(reportSettingsModal.configs.reportTypeDescription.PAYROLL_TITLE);
                $this.configs.$.payroll.show();

                break;
            }
            case $this.configs.REPORT_OPTIONS_TYPE.customer: {
                //generateCustomerList($customerIds, $this.configs.lists.customerList, $this.configs.lists.customerIds);
                changeReportSettingsTitle(reportSettingsModal.configs.reportTypeDescription.CUSTOMER_TITLE);
                $this.configs.$.customer.show();
                break;
            }
            case $this.configs.REPORT_OPTIONS_TYPE.employeeHoursWorked: {
                //generateEmployeeList($employeeIds, $this.configs.lists.employeeList, $this.configs.lists.employeeIds);
                changeReportSettingsTitle(reportSettingsModal.configs.reportTypeDescription.EMPLOYEE_TITLE);
                $this.configs.$.employeeHoursWorked.show();

                break;
            }
            case $this.configs.REPORT_OPTIONS_TYPE.hirePlanAndEquipment: {
                //generateContractorList($contractorIds, $this.configs.lists.contractorList, $this.configs.lists.contractorIds);
                //generateHiredPlantEquipmentList($hiredplantequipmentIds, $this.configs.lists.hiredPlantEquipmentList, $this.confkigs.lists.hiredPlantEquipmentIds);
                changeReportSettingsTitle(reportSettingsModal.configs.reportTypeDescription.HIREDPLAN_TITLE);
                $this.configs.$.hirePlanAndEquipment.show();

                break;
            }
            case $this.configs.REPORT_OPTIONS_TYPE.contractor: {
                //generateContractorList($contractorIds, $this.configs.lists.contractorList, $this.configs.lists.contractorIds);
                //generateHiredPlantEquipmentList($hiredplantequipmentIds, $this.configs.lists.hiredPlantEquipmentList, $this.confkigs.lists.hiredPlantEquipmentIds);
                changeReportSettingsTitle(reportSettingsModal.configs.reportTypeDescription.CONTRACTOR_TITLE); 

                break;
            }
            case $this.configs.REPORT_OPTIONS_TYPE.detailedShiftWorked: {
                //generateContractorList($contractorIds, $this.configs.lists.contractorList, $this.configs.lists.contractorIds);
                //generateHiredPlantEquipmentList($hiredplantequipmentIds, $this.configs.lists.hiredPlantEquipmentList, $this.confkigs.lists.hiredPlantEquipmentIds);
                changeReportSettingsTitle(reportSettingsModal.configs.reportTypeDescription.DETAILED_SHIFT_TITLE);

                break;
            }
        }
    }
}