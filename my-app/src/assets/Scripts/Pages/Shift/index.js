var shiftConfigs = {
    moduleName: "shift",
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    urls: {
        getList: apiUrl.shift.getList,
        edit: apiUrl.shift.edit,
        getClone: apiUrl.shift.getClone,
        clone: apiUrl.shift.clone,
        delete: apiUrl.shift.delete,
        getDelete: apiUrl.shift.getDelete
    },
    $customFilterWrapper: $("#customFilterWrapper"),
    $customFilter: $("#customFilter"),
    $cloneBtn: $("#cloneShift"),
    element: {
        btn: {
            btnCloneId: "#btnCloneShift",
            btnDeleteId: "#btnDeleteShift"

        },
        ladda: {
            laddaCloneBtn: Ladda.create(document.querySelector("#btnCloneShift")),
            laddaDeleteBtn: Ladda.create(document.querySelector("#btnDeleteShift"))
        },
        cloneModal: $('#CloneShiftModal')
    },
    selected: [],
};

var shiftFunctions = {
    initPage: function (confs) {
        if (confs != null) {
            shiftConfigs = Object.assign({}, shiftConfigs, confs);
        }

        datatableUtils.configs = shiftConfigs;

        shiftFunctions.initDatatable();
        shiftFunctions.initEvents();
    },
    initDatatable: function () {
        shiftConfigs.$table = shiftConfigs.$datatable.dataTable({
            ajax: {
                url: shiftConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "filterStatus": shiftConfigs.$customFilter.val(),
                };
            },
            "aaSorting": [[3, 'desc']],
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
                        var html = '<div>';

                        html += `<a href="${shiftConfigs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" data-toggle="tooltip" title="Edit"><i class="fa fa-edit"></i></a>`;
                        html += `<button class="btn btn-xs btn-warning btn-clone-shift" data-id="${data.id}" data-toggle="tooltip" title="Clone"><i class="fa fa-copy"></i></button></br>`;
                            
                        html += '</div>';

                        return html;
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
                    "mData": "jobReferenceNumber",
                    "bSearchable": true
                },
                {
                    "mData": "customer",
                    "bSearchable": true,
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

                datatableUtils.initEvents(settings);
            },
        });
    },
    customFilter: function () {
        const filter = shiftConfigs.$customFilterWrapper.html();
        $(filter).prependTo(".dataTables_filter");
        shiftConfigs.$customFilterWrapper.html("");

        shiftConfigs.$customFilter = $(".dataTables_filter #customFilter");
        shiftConfigs.$customFilter.on("change", function () {
            reloadDatatable(shiftConfigs.$table);
        });
    },
    initEvents: function () {
        // Edit shift time range event
        $(shiftConfigs.tableId).delegate('.btn-clone-shift', "click", function () {
            var id = $(this).data('id');
            shiftFunctions.clone(id);
        });
        $(shiftConfigs.element.btn.btnDeleteId).click(function () {
            shiftFunctions.delete();
        });
    },
    clone: function(id) {
        var $cloneShiftModal = shiftConfigs.element.cloneModal;
        var $cloneShiftBody = $cloneShiftModal.find('#cloneShiftBody');
        var formId = "clone-shift-form";

        // Remove old html
        $cloneShiftBody.html("");

        // Show modal
        $cloneShiftModal.modal('toggle');

        $.ajax({
            url: shiftConfigs.urls.getClone + "?shiftId=" + id,
            type: 'GET',
            success: function (result) {
                // Append html
                $cloneShiftBody.html(result);

                // Init events
                $cloneShiftBody.find('.date-picker').datepicker({
                    rtl: App.isRTL(),
                    orientation: "bottom",
                    autoclose: true,
                    format: constant.datePickerFormat
                });

                $cloneShiftBody.find('.time-picker').timepicker({
                    showMeridian: false,
                    orientation: "bottom",
                    autoclose: true,
                    minuteStep: 10,
                    defaultTime: null
                });

                resetFormValidator(formId);

                // Hide modal callback
                $cloneShiftModal.on('hidden.bs.modal', function (e) {
                    $cloneShiftBody.html();
                });

                // Save modal callback
                $cloneShiftModal.find('.btn-save').off('click').on('click', function (e) {
                    var startDate = $cloneShiftBody.find("#StartDate").val();
                    var finishDate = $cloneShiftBody.find("#EndDate").val();
                    var startTime = $cloneShiftBody.find("#StartTime").val();
                    var endTime = $cloneShiftBody.find("#EndTime").val();

                    var requestData = {
                        id: id,
                        startDate: startDate == "" ? null : moment(startDate, 'DD/MM/YYYY').format("MM/DD/YYYY"),
                        endDate: finishDate == "" ? null : moment(finishDate, 'DD/MM/YYYY').format("MM/DD/YYYY"),
                        startTime: startTime == "" ? null : startTime,
                        endTime: endTime == "" ? null : endTime
                    };

                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Shift have been cloned successfully`);
                        reloadDatatable(shiftConfigs.$table);
                        // Close modal
                        $cloneShiftModal.modal('hide');
                    };

                    var errorCallback = function (response) {
                        showAjaxFailureMessage(response.responseJSON.errorMessage);
                    }

                    $.ajax({
                        type: "POST",
                        url: shiftConfigs.urls.clone,
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
                        }
                    });
                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Edit resource fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    delete: function () {
        var actionName = "Delete";
        if (!datatableUtils.validateSelected(shiftConfigs.moduleName)) {
            return;
        }
        $.ajax({
            url: shiftConfigs.urls.getDelete,
            type: "POST",
            data: {
                "": datatableUtils.configs.selected
            },
            success: function (data) {
                if (data.allow.length > 0) {
                    swal({
                        title: 'Are you sure?',
                        text: 'You want to delete Shift(s)!',
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonClass: "btn-danger",
                        confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
                        cancelButtonText: "No, cancel",
                        closeOnConfirm: true,
                        closeOnCancel: true,
                        html: true
                    },
                        function (isConfirm) {
                            if (isConfirm) {

                                shiftConfigs.element.ladda.laddaDeleteBtn.start();
                                App.blockUI({
                                    target: shiftConfigs.tableId
                                });
                                $.ajax({
                                    url: shiftConfigs.urls.delete,
                                    type: 'POST',
                                    data: {
                                        "": datatableUtils.configs.selected
                                    },
                                    success: function (result) {
                                        toastr["success"](`${actionName} ${shiftConfigs.moduleName}(s) successful`);
                                        datatableUtils.unCheckBulkCheck();
                                    },
                                    error: function (result) {
                                        console.log("error: " + result);
                                        toastr["error"](
                                            `${actionName} ${shiftConfigs.moduleName}(s) fail, please try again`);
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
                } else {
                    toastr["warning"]('Selected Shifts cannot be deleted!');
                }
            }
        });
    }
}