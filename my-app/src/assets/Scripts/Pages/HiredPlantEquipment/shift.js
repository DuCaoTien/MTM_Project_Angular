var shiftConfigs = {
    hiredEquipmentId: 0,
    moduleName:"Shift",
    selected: [],
    $table: null,
    tableId: "#shiftDatatable",
    $datatable: $("#shiftDatatable"),
    $customFilterWrapper: $("#shiftCustomFilterWrapper"),
    $customFilter: $("#shiftCustomFilter"),
    $selectList: $("#shiftId"),
    $shiftForm: $("#assign_to_shift_form"),
    urls : {
        assign : apiUrl.hiredPlantEquipment.assignToShift,
        quickSearch: apiUrl.shift.quickSearch,
        getList: apiUrl.shift.getListByHiredEquipmentId,
        edit: apiUrl.shift.edit,
        delete: apiUrl.hiredPlantEquipment.unAssignToShift
    },
    element: {
        btn: {
            btnDeleteId: "#btnDeleteShift"
        },
        ladda: {
            laddaDeleteBtn: Ladda.create(document.querySelector("#btnDeleteShift"))
        }
    }
}
var shiftFunctions = {
    init: function (configs) {
        if (configs != null) {
            shiftConfigs = Object.assign({}, shiftConfigs, configs);
        }
        shiftFunctions.initSelectList();
        shiftFunctions.initDatatable();
        shiftFunctions.initEvents();
    },
    initSelectList: function() {
        shiftConfigs.$selectList.select2({
            placeholder: "Input at least 1 character to search",
            minimumInputLength: 1,
            ajax: {
                url: shiftConfigs.urls.quickSearch,
                data: function (params) {
                    return {
                        term: params.term,
                        exceptedHiredEquipmentId: shiftConfigs.hiredEquipmentId
                    };
                },
                dataType: "json",
                type: "GET",
                delay: 250,
                quietMillis: 100,
                processResults: function (data) {
                    return {
                        results: data
                    };
                },
                cache: true
            }
        });
    },
    assignToShift:function() {
        if (shiftConfigs.$selectList.val() > 0) {
            $.ajax({
                url: shiftConfigs.urls.assign,
                type: "POST",
                data: { id: shiftConfigs.hiredEquipmentId, shiftId: shiftConfigs.$selectList.val() },
                success: function(response) {
                        showAjaxSuccessMessage(response);
                        shiftConfigs.$selectList.find("option").remove();
                },
                error: function(response) {
                    if (typeof (response.message.responseJSON) !== 'undefined') {
                        showAjaxFailureMessage(response.responseJSON);
                    } else {
                        var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                        showAjaxFailureMessage(text);
                    }
                },
                beforeSend: function() {
                    showAjaxLoadingMask();
                },
                complete: function() {
                    hideAjaxLoadingMask();
                    reloadDatatable(shiftConfigs.$table);
                }
            });
        }
        
    },
    initDatatable: function () {
        shiftConfigs.$table = shiftConfigs.$datatable.dataTable({
            ajax: {
                url: shiftConfigs.urls.getList + "?id=" + shiftConfigs.hiredEquipmentId,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "filterStatus": shiftConfigs.$customFilter.val(),
                };
            },
            "aaSorting": [[4, 'desc']],
            "aoColumns": [
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return '<div class="checker">' +
                            '<span>' +
                            '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' + data.id + '">' +
                            '</span>' +
                            '</div>';
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${shiftConfigs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Shift")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "shiftNumber"
                },
                {
                    "mData": "startDateTime",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateTimeFormat);
                        return "";
                    }
                },
                {
                    "mData": "finishDateTime",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateTimeFormat);
                        return "";
                    }
                },
                {
                    "mData": "city"
                },
                {
                    "mData": "assetNames",
                    "bSortable": false,
                    "bSearchable": false,
                },
                {
                    "mData": "teamLeaderName",
                },
                {
                    "mData": "teamMemberNames",
                    "bSortable": false,
                    "bSearchable": false,
                },
                {
                    "mData": "driverNames",
                    "bSortable": false,
                    "bSearchable": false,
                },
                {
                    "mData": "shiftStatusName",
                    "render": function (data) {
                        return '<span class="label label-sm label-success"> ' + data + ' </span>';
                    }
                }
            ],
            "initComplete": function () {
                shiftFunctions.customFilter();
            },
            "fnDrawCallback": function (settings) {
                datatableUtils.configs = shiftConfigs;
                datatableUtils.initEvents(settings);
            }
        });
    },
    customFilter: function () {
        const filter = shiftConfigs.$customFilterWrapper.html();
        $(filter).prependTo(".dataTables_filter #shiftCustomFilter");
        shiftConfigs.$customFilterWrapper.html("");

        shiftConfigs.$customFilter = $(".dataTables_filter #shiftCustomFilter");
        shiftConfigs.$customFilter.on("change", function () {
            reloadDatatable(shiftConfigs.$table);
        });
    },
    initEvents: function () {
        $(shiftConfigs.element.btn.btnDeleteId).on("click", function () {
            shiftFunctions.delete();
        });
    },
    delete: function() {
        var actionName = "Unassign";
        if (!datatableUtils.validateSelected("shifts")) {
            return;
        }
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} ${shiftConfigs.moduleName
        }(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                shiftConfigs.element.ladda.laddaDeleteBtn.start();
                App.blockUI({
                    target: shiftConfigs.tableId
                });
                $.ajax({
                    url: shiftConfigs.urls.delete,
                    type: 'POST',
                    data: {
                        "id": shiftConfigs.hiredEquipmentId,
                        "shiftIds": datatableUtils.configs.selected
                    },
                    success: function (result) {
                        toastr["success"](`${actionName} ${shiftConfigs.moduleName}(s) successful`);
                        datatableUtils.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} ${shiftConfigs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        datatableUtils.configs.selected = [];
                        shiftConfigs.element.ladda.laddaDeleteBtn.stop();
                        App.unblockUI(shiftConfigs.tableId);
                        reloadDatatable(shiftConfigs.$table);
                    }
                });
            }
        });
    }
}

