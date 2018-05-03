

var report_scheduled_configs = {
    moduleName: "Reports Scheduled", 
    $table: null,
    tableId: "#report_schedule_datatable",
    $datatable: $("#report_schedule_datatable"),
    urls: {
        getList: apiUrl.report.getList,
        get: apiUrl.report.get,
        edit: apiUrl.report.edit, 
        delete: apiUrl.report.delete,
        generate: apiUrl.report.generate,
        getCreateModal: apiUrl.report.getCreateModal,
        getEditModal: apiUrl.report.getEditModal,
        create: apiUrl.report.create,
        save: apiUrl.report.save,
        createAndRunReport: apiUrl.report.createAndRunReport,
        saveAndRunReport: apiUrl.report.saveAndRunReport,
        preview: apiUrl.report.preview
    },
    element: {
        class: {
            Delete: "btnDelete",
            Edit: "btnEdit",
            Generate: "btnGenerate"
        },
        Id: {
            Delete: null,
            Edit: null,
            Generate: null
        }
    },
    reportSettings: null,
    customParams: null,
    configs: {
        selector: null,
        selectedReportType: null,
        type: {
            CREATE: 1,
            EDIT : 2
        },
        $: {},
        RECURRENCE_TYPE: {
            DAILY: 1,
            WEEKLY: 2,
            MONTHLY: 3,
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
            detailedShiftWorked: 6
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
    }
};

var report_scheduled_fncs = {
    initPage: function (confs) {
        if (confs != null) {
            report_scheduled_configs = Object.assign({}, report_scheduled_configs, confs);
        } 
        report_scheduled_configs.configs.selector = '#reportSettingsEdit'; 
        report_scheduled_fncs.initDatatable();
    },
    initDatatable: function () { 

        report_scheduled_configs.$table = report_scheduled_configs.$datatable.dataTable({
            ajax: {
                url: report_scheduled_configs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = report_scheduled_configs.customParams;
            },
            "aaSorting": [[3, "asc"]],
            "aoColumns": [
               
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center report-scheduled-action-column",
                    "render": function (data) { 
                        report_scheduled_configs.reportSettingsId = data.id;
                        return `<a data-settings-id="${data.id}"  class="btn btn-xs btn-info ${report_scheduled_configs.element.class.Generate}" data-toggle="tooltip" title="Generate"><i class="fa fa-share-square"></i></a>
                           <a  data-settings-id="${data.id}"  class="btn btn-xs btn-primary ${report_scheduled_configs.element.class.Edit}" data-toggle="tooltip" title="Edit"><i class="fa fa-edit"></i></a>
                            <a  data-settings-id="${data.id}"  class="btn btn-xs btn-danger ${report_scheduled_configs.element.class.Delete}" data-toggle="tooltip" title="Delete"><i class="fa fa-trash"></i></a>`;
                    }
                }, 
                {
                    "mData": "reportName",
                    "bSearchable": true,
                    "bSortable": true,
                    "sClass": "text-center",
                },
                {
                    "mData": "createdBy",
                    "bSearchable": true,
                    "bSortable": true,
                    "sClass": "text-center ",
                    "render": function (data) {
                        if (data == null || data == "") return "";

                        return data.replace(/^,/, "");
                    }
                },
                {
                    "mData": "dateCreated",
                    "bSearchable": true,
                    "bSortable": true,
                    "sClass": "text-center",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": "type",
                    "bSearchable": true,
                    "bSortable": true,
                    "sClass": "text-center",
                    "render": function (data) { 
                        if (data === report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.payroll) {
                            return `<span> ${report_scheduled_configs.reportTypeDescription.PAYROLL_TITLE} </span>`;
                        }
                        if (data === report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.customer) {
                            return `<span> ${report_scheduled_configs.reportTypeDescription.CUSTOMER_TITLE} </span>`;
                        }
                        if (data === report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.employeeHoursWorked) {
                            return `<span> ${report_scheduled_configs.reportTypeDescription.EMPLOYEE_TITLE} </span>`;
                        }
                        if (data === report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.hirePlanAndEquipment) {
                            return `<span> ${report_scheduled_configs.reportTypeDescription.HIREDPLAN_TITLE} </span>`;
                        } 
                        if (data === report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.contractor) {
                            return `<span> ${report_scheduled_configs.reportTypeDescription.CONTRACTOR_TITLE} </span>`;
                        } 
                        if (data === report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.detailedShiftWorked) {
                            return `<span> ${report_scheduled_configs.reportTypeDescription.DETAILED_SHIFT_TITLE} </span>`;
                        } 
                        return '';
                    }
                },
                {
                    "mData": "frequency",
                    "bSearchable": true,
                    "bSortable": true,
                    "sClass": "text-center",
                    "render": function (data) {
                        if (data === report_scheduled_configs.RecurrenceType.Single || data === report_scheduled_configs.RecurrenceType.None) {
                            return '<span> Single </span>';
                        } if (data === report_scheduled_configs.RecurrenceType.Daily) {
                            return '<span> Daily</span>';
                        }
                        if (data === report_scheduled_configs.RecurrenceType.Weekly) {
                            return '<span> Weekly </span>';
                        }
                        if (data === report_scheduled_configs.RecurrenceType.Monthly) {
                            return '<span> Monthly </span>';
                        }
                        return '<span> ' + data + ' </span>';
                    }
                },
            ],
            "fnDrawCallback": function (settings) {
                datatableUtils.configs = report_scheduled_configs;
                datatableUtils.initEvents(settings);
                report_scheduled_fncs.initEvents();

                //tooltips
                $(`${report_scheduled_configs.tableId} tbody`).tooltip({
                    "selector": '[data-toggle="tooltip"]',
                    "delay": 0,
                    "track": true,
                    "fade": 250
                });
            }
        });
    },
    initEvents: function () {

        //generate event
        $(`.${report_scheduled_configs.element.class.Generate}`).on("click", function () {
            report_scheduled_configs.element.Id.Generate = $(this).data('settingsId');
            report_scheduled_fncs.generate();
        });
        
        //generate event
        $(`.${report_scheduled_configs.element.class.Delete}`).on("click", function () {
            report_scheduled_configs.element.Id.Delete = $(this).data('settingsId');
            report_scheduled_fncs.delete();
        });

        //edit event
        $(`.${report_scheduled_configs.element.class.Edit}`).on("click", function () {
            report_scheduled_configs.element.Id.Edit = $(this).data('settingsId');
            report_scheduled_fncs.edit();
        }); 

    },
    edit: function () { 
        App.blockUI({
            target: report_scheduled_configs.tableId
        });
        
        $.ajax({
            url: report_scheduled_configs.urls.getEditModal,
            type: 'POST',
            data: { Id: report_scheduled_configs.element.Id.Edit },
            dataType: 'html',
            success: function (response) {
                
                $("#report-settings-row-edit").html('');
                $("#report-settings-row-edit").html(response); 
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
                $(findElement('#ReportName')).addClass('edited');
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
                $.ajax({
                    url: report_scheduled_configs.urls.get,
                    type: 'POST', 
                    data: { "": report_scheduled_configs.element.Id.Edit },
                    success: function (response) {
                        response.type = report_scheduled_configs.configs.type.EDIT;
                        report_scheduled_fncs.initial(response); 
                        $("#reportSettingsEdit").modal("show");
                    },
                    error: function (result) {
                        console.log("error: " + result); 
                    },
                    complete: function (result) {
                        App.unblockUI(report_scheduled_configs.tableId); 
                    }
                }); 
                 
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Load ${report_scheduled_configs.moduleName}(s) fail, please try again`);
            },
            complete: function (result) { 
            }
        });
      
    }, 
    generate: function () {
        var actionName = "generate";
        
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} this report !`,
            type: "info",
            showCancelButton: true,
            confirmButtonClass: "btn-info",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                
                App.blockUI({
                    target: report_scheduled_configs.tableId
                });
                $.ajax({
                    url: report_scheduled_configs.urls.generate,
                    type: 'POST',
                    data: { "Id": report_scheduled_configs.element.Id.Generate },
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
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} ${report_scheduled_configs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                      
                        App.unblockUI(report_scheduled_configs.tableId);
                    }
                });
            }
        });
    }, 
    delete: function () {

        var actionName = "Delete"; 
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} this ${report_scheduled_configs.moduleName} !`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                App.blockUI({
                    target: report_scheduled_configs.tableId
                });
                
                $.ajax({
                    url: report_scheduled_configs.urls.delete,
                    type: 'POST',
                    data: { "": report_scheduled_configs.element.Id.Delete },
                    success: function (result) {
                        toastr["success"](`Delete ${report_scheduled_configs.moduleName}(s) successful`);
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`Delete ${report_scheduled_configs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        App.unblockUI(report_scheduled_configs.tableId);
                        reloadDatatable(report_scheduled_configs.$table);
                    }
                });
            }
        });
    },
    initial: function ($reportSettings) {

        console.log('');
        if ($reportSettings.type === report_scheduled_configs.configs.type.CREATE)
        {
            report_scheduled_configs.configs.$ = {
                //recurrence
                recurrenceTypes: $('#reportSettingsCreate input[type="radio"][name="RecurrenceType"]'),
                dailyDetails: $('#reportSettingsCreate #recurrence-pattern-daily-details'),
                weeklyDetails: $('#reportSettingsCreate #recurrence-pattern-weekly-details'),
                monthlyDetails: $('#reportSettingsCreate #recurrence-pattern-monthly-details'),
                yearlyDetails: $('#reportSettingsCreate #recurrence-pattern-yearly-details'),
                monthlyRecurEvery: $('#reportSettingsCreate #MonthlyRecurEvery'),
                monthlyRecurEvery1: $('#reportSettingsCreate #MonthlyRecurEvery1'),
                monthlyRecurEvery2: $('#reportSettingsCreate #MonthlyRecurEvery2'),
                yearlyOnMonth: $('#reportSettingsCreate #YearlyOnMonth'),
                yearlyOnMonth1: $('#reportSettingsCreate #YearlyOnMonth1'),
                yearlyOnMonth2: $('#reportSettingsCreate #YearlyOnMonth2'),

                //report criteria options 

                customer: $('#reportSettingsCreate #CustomerReportOptions'),
                employeeHoursWorked: $('#reportSettingsCreate #EmployeeHoursWorkedReportOptions'),
                hirePlanAndEquipment: $('#reportSettingsCreate #HirePlanAndEquipmentReportOptions'),
                payroll: $('#reportSettingsCreate #PayrollReportOptions')
            };
        }
        if ($reportSettings.type === report_scheduled_configs.configs.type.EDIT)
        {
            report_scheduled_configs.configs.$ = {
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
        }
        

        report_scheduled_configs.configs.lists = {
            employees: $reportSettings.Employees,
            customers: $reportSettings.Customers,
            payrollEmployees: $reportSettings.PayrollEmployees,
            hiredPlanAndEquipments: $reportSettings.HiredPlantEquipments,
            contractors: $reportSettings.Contractors,

            employeeIds: $reportSettings.EmployeeIds,
            customerIds: $reportSettings.CustomerIds,
            payrollEmployeeIds: $reportSettings.PayrollEmployeeIds,
            hiredPlanAndEquipmentIds: $reportSettings.HiredPlantEquipmentIds,
            contractorIds: $reportSettings.ContractorIds,
        }

        //init checked readio button  
        recurrenceTypeToggle(parseInt($reportSettings.RecurrenceType)); 
        report_scheduled_configs.configs.$.recurrenceTypes.change(function () {
            var $thisInternal = $(this);
            var recurrenceType = parseInt($thisInternal.val()); 
            // Hide all details
            recurrenceTypeToggle(recurrenceType)
        });

        //payroll report options 
        $('.payroll-employee-ids').hide();
        toggleMemberType(parseInt($reportSettings.PayrollMemberType), $('.payroll-employee-ids'));
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
        toggleMemberType($reportSettings.EmployeeMemberType, $('.employee-ids'));
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
        toggleMemberType($reportSettings.ContractorType, $('.contractor-ids'));
        toggleMemberType($reportSettings.HiredPlanAndEquipmentMemberType, $('.hiredplantequipment-ids'));
        $('input[name="ContractorType"]').on('change', function () {
            var $thisInternal = $(this);
            var $contractorIdClass = $('.contractor-ids');
            var contractorType = parseInt($thisInternal.val());

            toggleMemberType(contractorType, $contractorIdClass);
        });
        $('input[name="HiredPlanAndEquipmentMemberType"]').on('change', function () {
            var $thisInternal = $(this);
            var $hiredPlantEquipmentIdClass = $('.hiredplantequipment-ids');
            var memberType = parseInt($thisInternal.val());

            toggleMemberType(memberType, $hiredPlantEquipmentIdClass);
        });

        //customer report options 
        $('.customer-ids').hide();
        toggleMemberType($reportSettings.CustomerMemberType, $('.customer-ids'));
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
       

        toggleReportTypeSettings($reportSettings.ReportType, $reportSettings.type); 
        $('input[name="ReportType"]').on('change', function () {
            var $thisInternal = $(this);
            var optionType = parseInt($thisInternal.val());
           

            //report type radio buttons
           
            toggleReportTypeSettings(optionType, $reportSettings.type);

        }) 
    },
    getCreateReportSettingsModal: function (selectedReportType) {
        report_scheduled_configs.selectedReportType = selectedReportType;
        showAjaxLoadingMask();
        $.ajax({
            url: report_scheduled_configs.urls.getCreateModal,
            type: 'POST',
            data: { Id: 0 },
            dataType: 'html',
            success: function (response) {
                hideAjaxLoadingMask();

                $("#report-settings-row-create").html('');
                $("#report-settings-row-create").html(response);
                
                //get and initialize data
                $.ajax({
                    url: report_scheduled_configs.urls.get,
                    type: 'POST',
                    data: { "": 0 },
                    success: function (response) {

                        response.ReportType = report_scheduled_configs.selectedReportType;
                        response.type = report_scheduled_configs.configs.type.CREATE;
                        report_scheduled_fncs.initial(response);
                        //contractor
                        $('#reportSettingsCreate #ContractorIds').select2();
                        $('#reportSettingsCreate #ContractorIds').addClass('edited');
                        $('#reportSettingsCreate #ContractorIds').removeClass('select2-container--bootstrap');
                        $('#reportSettingsCreate #ContractorIds').addClass('select2-container--default');
                        //customer

                        $('#reportSettingsCreate #HiredPlantEquipmentIds').select2();
                        $('#reportSettingsCreate #HiredPlantEquipmentIds').addClass('edited');
                        $('#reportSettingsCreate #HiredPlantEquipmentIds').removeClass('select2-container--bootstrap');
                        $('#reportSettingsCreate #HiredPlantEquipmentIds').addClass('select2-container--default');
                        //employee

                        $('#reportSettingsCreate #EmployeeIds').addClass('edited');
                        $('#reportSettingsCreate #EmployeeIds').select2();
                        $('#reportSettingsCreate #EmployeeIds').removeClass('select2-container--bootstrap');
                        $('#reportSettingsCreate #EmployeeIds').addClass('select2-container--default');
                        //customer

                        $('#reportSettingsCreate #CustomerIds').select2();
                        $('#reportSettingsCreate #CustomerIds').addClass('edited');
                        $('#reportSettingsCreate #CustomerIds').removeClass('select2-container--bootstrap');
                        $('#reportSettingsCreate #CustomerIds').addClass('select2-container--default');
                        //payroll
                        $('#reportSettingsCreate #PayrollEmployeeIds').select2();
                        $('#reportSettingsCreate #PayrollEmployeeIds').addClass('edited');
                        $('#reportSettingsCreate #PayrollEmployeeIds').removeClass('select2-container--bootstrap');
                        $('#reportSettingsCreate #PayrollEmployeeIds').addClass('select2-container--default');
                        //recipients

                        $('#reportSettingsCreate #RecipientIds').select2();
                        $('#reportSettingsCreate #RecipientIds').addClass('edited');
                        $('#reportSettingsCreate #RecipientIds').removeClass('select2-container--bootstrap');
                        $('#reportSettingsCreate #RecipientIds').addClass('select2-container--default');
                        //radio, checkbox uniform
                        $('input:radio, input:checkbox, input#ReportName').uniform();
                        //datepicker

                        $('#reportSettingsCreate #SeriesStartDate').datepicker({
                            orientation: "top",
                            autoclose: true,
                            format: constant.datePickerFormat,
                            todayHighlight: true,
                            todayBtn: true
                        });

                        $('#reportSettingsCreate #StartTime').timepicker({
                            showMeridian: false,
                            orientation: "top",
                            autoclose: true,
                            minuteStep: 10,
                            defaultTime: null
                        });
                        $('#reportSettingsCreate #StartDate').datepicker({
                            orientation: "top",
                            autoclose: true,
                            format: constant.datePickerFormat,
                            todayHighlight: true,
                            todayBtn: true
                        });

                        $('#reportSettingsCreate #EndDate').datepicker({
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
                        showAjaxFailureMessage(result);
                        console.log("error: " + result);
                    },
                    complete: function (result) {
                        hideAjaxLoadingMask();
                    }
                }); 
                
               
            },
            error: function (result) {
                console.log("error: " + result);
                hideAjaxLoadingMask();

            },
            complete: function (result) {
                hideAjaxLoadingMask();

            }
        });
    },
    createReportSettings: function (formId) {
        var $form = $(`#${formId}`);
        var formObject = $form.serializeObjectX();
        showAjaxLoadingMask();
        formObject.ReportType = report_scheduled_configs.selectedReportType;

        if ($form != null && $form.valid()) {
            let formData = JSON.stringify(formObject);
            $.ajax({
                type: "POST",
                url: report_scheduled_configs.urls.create,
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
        showAjaxLoadingMask();
        formObject.ReportType = report_scheduled_configs.selectedReportType;
        if ($form != null && $form.valid()) {

            let formData = JSON.stringify(formObject);

            $.ajax({
                type: "POST",
                url: report_scheduled_configs.urls.createAndRunReport,
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
    editReportSettings: function (formId) {
        showAjaxLoadingMask();
        var $form = $(`#${formId}`);
        var formObject = $form.serializeObjectX();
        if ($form != null && $form.valid()) {
            let formData = JSON.stringify(formObject);
            $.ajax({
                type: "POST",
                url: report_scheduled_configs.urls.save,
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
        showAjaxLoadingMask();
        var $form = $(`#${formId}`);
        var formObject = $form.serializeObjectX();
        if ($form != null && $form.valid()) {

            let formData = JSON.stringify(formObject);

            $.ajax({
                type: "POST",
                url: report_scheduled_configs.urls.saveAndRunReport,
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
        formObject.ReportType = report_scheduled_configs.selectedReportType;
        if ($form != null && $form.valid()) {

            let formData = JSON.stringify(formObject);

            $.ajax({
                type: "POST",
                url: report_scheduled_configs.urls.preview,
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
    
    return `${report_scheduled_configs.configs.selector} ${selector}`; // Ex: #formDatatable
}

//change title of report settings modal
function changeEditReportSettingsTitle(title) {
    $(findElement('#report-type-title')).text(title);
}

function changeCreateReportSettingsTitle(title) {
    $('#reportSettingsCreate #report-type-title').text(title);
}

//recurrence type toggle
function recurrenceTypeToggle(recurrenceType) {
    report_scheduled_configs.configs.$.dailyDetails.hide();
    report_scheduled_configs.configs.$.weeklyDetails.hide();
    report_scheduled_configs.configs.$.monthlyDetails.hide();
    report_scheduled_configs.configs.$.yearlyDetails.hide();

    switch (recurrenceType) {
        case report_scheduled_configs.configs.RECURRENCE_TYPE.DAILY: {
            report_scheduled_configs.configs.$.dailyDetails.show();
            break;
        }
        case report_scheduled_configs.configs.RECURRENCE_TYPE.WEEKLY: {
            report_scheduled_configs.configs.$.weeklyDetails.show();
            break;
        }
        case report_scheduled_configs.configs.RECURRENCE_TYPE.MONTHLY: {
            report_scheduled_configs.configs.$.monthlyDetails.show();
            break;
        }
        case report_scheduled_configs.configs.RECURRENCE_TYPE.YEARLY: {
            report_scheduled_configs.configs.$.yearlyDetails.show();
            break;
        }
    }
}

//toggle member type
function toggleMemberType($MemberTypeValue, $MemberTypeDOM) {
    switch ($MemberTypeValue) {
        case report_scheduled_configs.configs.MEMBER_TYPE.wholeTeam: { 
            $MemberTypeDOM.hide();

            break;
        }
        case report_scheduled_configs.configs.MEMBER_TYPE.individual: {
            $MemberTypeDOM.show();
            break;
        }
    }
}

//toggle report type setttings
function toggleReportTypeSettings(optionType, type) {



    report_scheduled_configs.configs.$.customer.hide();
    report_scheduled_configs.configs.$.employeeHoursWorked.hide();
    report_scheduled_configs.configs.$.hirePlanAndEquipment.hide();
    report_scheduled_configs.configs.$.payroll.hide();
    switch (optionType) {

        case report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.payroll: {
            if (type === report_scheduled_configs.configs.type.EDIT)
                changeEditReportSettingsTitle(report_scheduled_configs.reportTypeDescription.PAYROLL_TITLE);
            else
                changeCreateReportSettingsTitle(report_scheduled_configs.reportTypeDescription.PAYROLL_TITLE);

            report_scheduled_configs.configs.$.payroll.show();

            break;
        }
        case report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.customer: {
            if (type === report_scheduled_configs.configs.type.EDIT)
                changeEditReportSettingsTitle(report_scheduled_configs.reportTypeDescription.CUSTOMER_TITLE);
            else
                changeCreateReportSettingsTitle(report_scheduled_configs.reportTypeDescription.CUSTOMER_TITLE);
            report_scheduled_configs.configs.$.customer.show();
            break;
        }
        case report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.employeeHoursWorked: {
            if (type === report_scheduled_configs.configs.type.EDIT)
                changeEditReportSettingsTitle(report_scheduled_configs.reportTypeDescription.EMPLOYEE_TITLE);
            else
                changeCreateReportSettingsTitle(report_scheduled_configs.reportTypeDescription.EMPLOYEE_TITLE);
            report_scheduled_configs.configs.$.employeeHoursWorked.show();

            break;
        }
        case report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.hirePlanAndEquipment: {
            if (type === report_scheduled_configs.configs.type.EDIT)
                changeEditReportSettingsTitle(report_scheduled_configs.reportTypeDescription.HIREDPLAN_TITLE);
            else
                changeCreateReportSettingsTitle(report_scheduled_configs.reportTypeDescription.HIREDPLAN_TITLE);
            report_scheduled_configs.configs.$.hirePlanAndEquipment.show(); 

            break;
        }
        case report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.contractor: {
            if (type === report_scheduled_configs.configs.type.EDIT)
                changeEditReportSettingsTitle(report_scheduled_configs.reportTypeDescription.CONTRACTOR_TITLE);
            else
                changeCreateReportSettingsTitle(report_scheduled_configs.reportTypeDescription.CONTRACTOR_TITLE);

            break;
        }
        case report_scheduled_configs.configs.REPORT_OPTIONS_TYPE.detailedShiftWorked: {
            if (type === report_scheduled_configs.configs.type.EDIT)
                changeEditReportSettingsTitle(report_scheduled_configs.reportTypeDescription.DETAILED_SHIFT_TITLE);
            else
                changeCreateReportSettingsTitle(report_scheduled_configs.reportTypeDescription.DETAILED_SHIFT_TITLE);

            break;
        }
    }
}

//not use

  