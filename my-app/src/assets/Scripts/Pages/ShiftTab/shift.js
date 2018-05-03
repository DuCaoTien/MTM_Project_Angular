var shiftConfigs = {
    hiredEquipmentId: 0,
    moduleName: "shift",
    selected: [],
    $table: null,
    tableId: "#shiftDatatable",
    $datatable: $("#shiftDatatable"),
    $customFilterWrapper: $("#shiftCustomFilterWrapper"),
    $customFilter: $("#shiftCustomFilterByTab"),
    $selectList: $("#shiftId"),
    $shiftForm: $("#assign_to_shift_form"),
    $modal: $("#assignToShiftModal"),
    urls: {
        assign: "",
        quickSearch: apiUrl.shift.tabQuickSearch,
        getList: `${apiUrl.shift.getDatatableByTab}?id=${SHIFT_TAB_MODEL.id}&shiftTab=${SHIFT_TAB_MODEL.shiftTab}`,
        edit: apiUrl.shift.edit,
        delete: ""
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

var shiftDatatableUtils = getDataTableUtils(shiftConfigs);

var shiftFunctions = {
    init: function () {
        shiftFunctions.customConfigs();
        shiftDatatableUtils.configs = shiftConfigs;
        shiftFunctions.initSelectList();
        shiftFunctions.initDatatable();
        shiftFunctions.initEvents();
    },
    initSelectList: function () {
        shiftConfigs.$selectList.select2({
            placeholder: "Input at least 1 character to search",
            minimumInputLength: 1,
            ajax: {
                url: shiftConfigs.urls.quickSearch,
                data: function (params) {
                    return {
                        id: SHIFT_TAB_MODEL.id,
                        shiftTab: SHIFT_TAB_MODEL.shiftTab,
                        keyword: params.term
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
                cache: true,
                error: function(){

                }
            }
        });
    },
    initDatatable: function () {
        if (shiftConfigs.$table != null) return;

        shiftConfigs.$table = shiftConfigs.$datatable.dataTable({
            ajax: {
                url: shiftConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "filterStatus": shiftConfigs.$customFilter.val()
                };
            },
            "aaSorting": [[4, "desc"]],
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
                        if (data == shiftConfigs.shiftStatuses.Planned) {
                            return '<span class="label label-sm bg-shift-planned"> ' + data + ' </span>';
                        } if (data == shiftConfigs.shiftStatuses.ShiftConfirmed) {
                            return '<span class="label label-sm bg-shift-confirmed"> ' + data + ' </span>';
                        }
                        if (data == shiftConfigs.shiftStatuses.Dispatched) {
                            return '<span class="label label-sm bg-shift-dispatched"> ' + data + ' </span>';
                        }
                        if (data == shiftConfigs.shiftStatuses.Active) {
                            return '<span class="label label-sm bg-shift-active"> ' + data + ' </span>';
                        }
                        if (data == shiftConfigs.shiftStatuses.Cancelled) {
                            return '<span class="label label-sm bg-shift-cancelled"> ' + data + ' </span>';
                        }
                        if (data == shiftConfigs.shiftStatuses.Cancelled) {
                            return '<span class="label label-sm bg-shift-cancelled"> ' + data + ' </span>';
                        }
                        if (data == shiftConfigs.shiftStatuses.PersonnelConfirmed) {
                            return '<span class="label label-sm bg-shift-personnel-confirmed"> ' + data + ' </span>';
                        }
                        if (data == shiftConfigs.shiftStatuses.Complete) {
                            return '<span class="label label-sm bg-shift-complete"> ' + data + ' </span>';
                        }
                        return '<span class="label label-sm label-success"> ' + data + ' </span>';
                    }
                }
            ],
            "initComplete": function (settings, json) {
                shiftFunctions.customFilter();
            },
            "fnDrawCallback": function (settings) {
                // datatable set cursor is pointer
                shiftConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });
                shiftDatatableUtils.initEvents(settings);
                $('[data-toggle="tooltip"]').tooltip();
            },
        });
    },
    customFilter: function () {
        const filter = shiftConfigs.$customFilterWrapper.html();
        $(filter).prependTo("#shiftDatatable_wrapper .dataTables_filter");
        shiftConfigs.$customFilterWrapper.html("");

        shiftConfigs.$customFilter = $("#shiftDatatable_wrapper .dataTables_filter #shiftCustomFilterByTab");
        shiftConfigs.$customFilter.on("change", function () {
            reloadDatatable(shiftConfigs.$table);
        });
    },
    initEvents: function () {
        $(shiftConfigs.element.btn.btnDeleteId).on("click", function () {
            shiftFunctions.delete();
        });
    },
    assignToShift: function () {
        if (shiftConfigs.$selectList.val() > 0) {
            $.ajax({
                url: shiftConfigs.urls.assign,
                type: "POST",
                data: shiftFunctions.getSubmitModel(),
                success: function (response) {
                    showAjaxSuccessMessage(response);
                    reloadDatatable(shiftConfigs.$table);
                    shiftConfigs.$selectList.find("option").remove();
                    shiftConfigs.$modal.modal("toggle");
                },
                error: function (response) {
                    var responInJson = !response.responseText ? null : JSON.parse(response.responseText);
                    var errorMessage = !responInJson || !responInJson.errorMessage ? "" :  responInJson.errorMessage.split(',').join("<br/>");

                    if(errorMessage == "") return;
                    
                    showAjaxFailureMessage(errorMessage);
                },
                beforeSend: function () {
                    showAjaxLoadingMask();
                },
                complete: function () {
                    hideAjaxLoadingMask();
                }
            });
        }
    },
    delete: function () {
        var actionName = "Unassign";
        if (!shiftDatatableUtils.validateSelected(shiftConfigs.moduleName)) {
            return;
        }
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} ${shiftConfigs.moduleName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                var model = shiftFunctions.getSubmitModel();
                model.shiftIds = shiftDatatableUtils.configs.selected;

                shiftConfigs.element.ladda.laddaDeleteBtn.start();
                App.blockUI({
                    target: shiftConfigs.tableId
                });
                $.ajax({
                    url: shiftConfigs.urls.delete,
                    type: 'POST',
                    data: model,
                    success: function (result) {
                        toastr["success"](`${actionName} ${shiftConfigs.moduleName}(s) successful`);
                        shiftDatatableUtils.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} ${shiftConfigs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        shiftDatatableUtils.configs.selected = [];
                        shiftConfigs.element.ladda.laddaDeleteBtn.stop();
                        App.unblockUI(shiftConfigs.tableId);
                        reloadDatatable(shiftConfigs.$table);
                    }
                });
            }
        });
    },
    /* Helper Methods */
    customConfigs: function () {
        switch (SHIFT_TAB_MODEL.shiftTab) {
            case SHIFT_TAB_TYPES.vehicle.id: {
                shiftConfigs.urls.assign = apiUrl.vehicle.assignToShift;
                shiftConfigs.urls.delete = apiUrl.vehicle.unAssignShift;
                break;
            }
            case SHIFT_TAB_TYPES.ownedPlantEquipment.id: {
                shiftConfigs.urls.assign = apiUrl.ownedPlantEquipment.assignToShift;
                shiftConfigs.urls.delete = apiUrl.ownedPlantEquipment.unAssignShift;
                break;
            }
            case SHIFT_TAB_TYPES.hiredPlantEquipment.id: {
                shiftConfigs.urls.assign = apiUrl.hiredPlantEquipment.assignToShift;
                shiftConfigs.urls.delete = apiUrl.hiredPlantEquipment.unAssignShift;
                break;
            }
            default: {
                console.error("shiftTab is required");
                break;
            }
        }
    },
    getSubmitModel: function () {
        var model = {
            id: SHIFT_TAB_MODEL.id,
            shiftIds: [shiftConfigs.$selectList.val()]
        };

        return model;
    }
}
