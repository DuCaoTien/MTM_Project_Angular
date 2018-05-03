var vehicleConfigs = {
    moduleName: "vehicle",
    selected: [],
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    $willExpireLabel: $("#willExpireLabel"),
    $willExpireAgainLabel: $("#willExpireAgainLabel"),
    urls: {
        getList: apiUrl.vehicle.getList,
        edit: apiUrl.vehicle.edit,
        delete: apiUrl.vehicle.delete,
        getExpireWithinMonths: apiUrl.vehicle.getExpireWithinMonths
    },
    element: {
        btn: {
            btnDeleteId: "#btnDelete"
        },
        ladda: {
            //laddaDeleteBtn: Ladda.create(document.querySelector("#btnDelete"))
        }
    },
    $customFilterWrapper: $("#customFilterWrapper"),
    $customFilter: $("#customFilter"),
    pagePermission: PAGE_PERMISSION.FULL_PERMISSION
};

var vehicleFunctions = {

    initPage: function (confs) {
        if (confs != null) {
            vehicleConfigs = Object.assign({}, vehicleConfigs, confs);
        }

        if (!vehicleConfigs.pagePermission) {
            console.error("PAGE_PERMISSION is null");
            return;
        }

        vehicleFunctions.getExpireWitinMonth();

        datatableUtils.configs = vehicleConfigs;
        vehicleFunctions.initDatatable();
        vehicleFunctions.initEvents();
    },

    initDatatable: function () {
        vehicleConfigs.$table = vehicleConfigs.$datatable.dataTable({
            ajax: {
                url: vehicleConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "filterByVehicleStatus": vehicleConfigs.$customFilter.val()
                };
            },
            "aaSorting": [[3, "asc"]],
            "aoColumns": vehicleConfigs.pagePermission === PAGE_PERMISSION.FULL_PERMISSION
                ? vehicleFunctions.getFullPermissionColumnDefinations()
                : vehicleFunctions.getViewOnlyPermissionColumnDefinations(),
            "initComplete": function (settings, json) {
                vehicleFunctions.customFilter();
            },
            "fnDrawCallback": function (settings) {
                // datatable set cursor is pointer
                vehicleConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                datatableUtils.initEvents(settings);
            },
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                $('[data-toggle="tooltip"]').tooltip();
                if (aData.expired === true) $(nRow).addClass("danger");
                else if (aData.willExpireAgain === true) $(nRow).addClass("warning-soft");
                else if (aData.willExpire === true) $(nRow).addClass("warning");
                return nRow;
            }
        });
    },

    customFilter: function () {
        const filter = vehicleConfigs.$customFilterWrapper.html();
        $(filter).prependTo(".dataTables_filter");
        vehicleConfigs.$customFilterWrapper.html("");

        vehicleConfigs.$customFilter = $(".dataTables_filter #customFilter");
        vehicleConfigs.$customFilter.on("change", function () {
            reloadDatatable(vehicleConfigs.$table);
        });
    },

    initEvents: function () {
        if (vehicleConfigs.pagePermission === PAGE_PERMISSION.FULL_PERMISSION) {
            $(vehicleConfigs.element.btn.btnDeleteId).on("click", function () {
                vehicleFunctions.delete();
            });
        }
    },

    getViewOnlyPermissionColumnDefinations: function () {
        var columnDefinations = vehicleFunctions.getBaseColumnDefinations();

        columnDefinations.unshift({
            "mData": "id",
            "sClass": "hidden",
            "bSearchable": false
        });

        return columnDefinations;
    },

    getFullPermissionColumnDefinations: function () {
        var columnDefinations = vehicleFunctions.getBaseColumnDefinations();

        columnDefinations.unshift({
            "mData": null,
            "bSortable": false,
            "bSearchable": false,
            "sClass": "text-center action-column",
            "render": function (data) {
                return `<div><a href="${vehicleConfigs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Vehicle")}><i class="fa fa-edit"></i></a></div>`;
            }
        });

        columnDefinations.unshift({
            "mData": null,
            "bSortable": false,
            "bSearchable": false,
            "sClass": "text-center select-column",
            "render": function (data) {
                return '<div class="checker">' +
                    '<span>' +
                    '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' + data.id + '">' +
                    '</span>' +
                    '</div>';
            }
        });

        columnDefinations.unshift({
            "mData": "id",
            "sClass": "hidden",
            "bSearchable": true
        });

        return columnDefinations;
    },

    getBaseColumnDefinations: function () {
        return [
            {
                "mData": "name",
                "sClass": "text-center name-column",
            },
            {
                "mData": "makeName",
                "sClass": "text-center make-column",
            },
            {
                "mData": "modelName",
                "sClass": "text-center model-column",
            },
            {
                "mData": "year",
                "sClass": "text-center year-column",
            },
            {
                "mData": "vehicleType",
                "sClass": "text-center vehicle-column"
            },
            {
                "mData": "fuelTypeName",
                "sClass": "text-center fuel-type-column",
                "bSortable": false,
                "bSearchable": false,
            },
            {
                "mData": "registrationNumber",
                "sClass": "text-center registration-number-column",
                "bSortable": false,
                "bSearchable": false,
            },
            {
                "mData": "registrationExpiryDate",
                "sClass": "text-center date-column",
                "render": function (data) {
                    if (data)
                        return getLocalFromUtcWithFormat(data, constant.dateFormat);
                    return "";
                }
            },
            {
                "mData": "transmissionName",
                "sClass": "text-center fuel-type-column",
            },
            {
                "mData": "status",
                "sClass": "text-center status-column",
                "render": function (data) {
                    return getVehicleStatus(data);
                }
            },
        ];
    },

    delete: function () {
        var actionName = "Delete";
        if (!datatableUtils.validateSelected(vehicleConfigs.moduleName)) {
            return;
        }
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} ${vehicleConfigs.moduleName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                vehicleConfigs.element.ladda.laddaDeleteBtn = Ladda.create(document.querySelector("#btnDelete"));

                vehicleConfigs.element.ladda.laddaDeleteBtn.start();
                App.blockUI({
                    target: vehicleConfigs.tableId
                });
                $.ajax({
                    url: vehicleConfigs.urls.delete,
                    type: 'POST',
                    data: {
                        "": datatableUtils.configs.selected
                    },
                    success: function (result) {
                        toastr["success"](`${actionName} ${vehicleConfigs.moduleName}(s) successful`);
                        datatableUtils.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} ${vehicleConfigs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        datatableUtils.configs.selected = [];
                        vehicleConfigs.element.ladda.laddaDeleteBtn.stop();
                        App.unblockUI(vehicleConfigs.tableId);
                        reloadDatatable(vehicleConfigs.$table);
                    }
                });
            }
        });
    },

    getExpireWitinMonth: function () {
        $.ajax({
            url: vehicleConfigs.urls.getExpireWithinMonths,
            type: 'GET',
            success: function (result) {
                vehicleConfigs.$willExpireLabel.html(getExpireText("Document", result.expire));
                vehicleConfigs.$willExpireAgainLabel.html(getExpireText("Document", result.expireAgain));
            }
        });
    }
}