var EXPIRY_PERIOD = {
    EXPIRED: 1,
    WILL_EXPIRE_SOON: 2,
    WILL_EXPIRE_AGAIN: 3
};

var configs = {
    moduleName: "Owned Plant & Equipment",
    selected: [],
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    urls: {
        getList: apiUrl.ownedPlantEquipment.getList,
        edit: apiUrl.ownedPlantEquipment.edit,
        delete: apiUrl.ownedPlantEquipment.delete,
        getExpireWithinMonths: apiUrl.configurations.getOPEExpireWithinMonths
    },
    element: {
        btn: {
            btnDeleteId: "#btnDelete"
        },
        ladda: {
            laddaDeleteBtn: Ladda.create(document.querySelector("#btnDelete"))
        }
    },
    $customFilterWrapper: $("#customFilterWrapper"),
    $customFilter: $("#customFilter"),
};

var fncs = {
    initPage: function (confs) {
        if (confs != null) {
            configs = Object.assign({}, configs, confs);
        }

        datatableUtils.configs = configs;
        fncs.initDatatable();
        fncs.initEvents();
    },
    initDatatable: function () {
        configs.$table = configs.$datatable.dataTable({
            ajax: {
                url: configs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "filterByOwnedPlantEquipmentStatus": configs.$customFilter.val()
                };
            },
            "aaSorting": [[3, "asc"]],
            "aoColumns": [
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": true
                },
                {
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
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center action-column",
                    "render": function (data) {
                        return `<div><a href="${configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Owned Plant & Equipment")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "name",
                    "sClass": "text-center name-column",
                },
                {
                    "mData": "makeName",
                    "sClass": "text-center make-name-column",
                },
                {
                    "mData": "modelName",
                    "sClass": "text-center model-name-column",
                },
                {
                    "mData": "year",
                    "sClass": "text-center year-column",
                },
                {
                    "mData": "registrationNumber",
                    "sClass": "text-center registration-number-column",
                },
                {
                    "mData": "registrationExpiryDate",
                    "sClass": "text-center date-column",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": "calibrationExpiryDate",
                    "sClass": "text-center date-column",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": "testAndTagExpiryDate",
                    "sClass": "text-center date-column",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": "status",
                    "sClass": "text-center status-column",
                    "render": function (data) {
                        return getOPEStatus(data);
                    }
                },
            ],
            "initComplete": function (settings, json) {
                fncs.customFilter();
            },
            "fnDrawCallback": function (settings) {
                // datatable set cursor is pointer
                configs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                datatableUtils.initEvents(settings);
            },
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                $('[data-toggle="tooltip"]').tooltip();
                var $row = $(nRow);

                fncs.setExpiryClass($row, 8, aData.registrationExpiryStatus);
                fncs.setExpiryClass($row, 9, aData.calibrationExpiryStatus);
                fncs.setExpiryClass($row, 10, aData.testAndTagExpiryStatus);

                return nRow;
            }
        });
    },

    customFilter: function () {
        const filter = configs.$customFilterWrapper.html();
        $(filter).prependTo(".dataTables_filter");
        configs.$customFilterWrapper.html("");

        configs.$customFilter = $(".dataTables_filter #customFilter");
        configs.$customFilter.on("change", function () {
            reloadDatatable(configs.$table);
        });
    },

    initEvents: function () {
        $(configs.element.btn.btnDeleteId).on("click", function () {
            fncs.delete();
        });
    },

    delete: function () {
        var actionName = "Delete";
        if (!datatableUtils.validateSelected(configs.moduleName)) {
            return;
        }
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} ${configs.moduleName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                configs.element.ladda.laddaDeleteBtn.start();
                App.blockUI({
                    target: configs.tableId
                });
                $.ajax({
                    url: configs.urls.delete,
                    type: 'POST',
                    data: {
                        "": datatableUtils.configs.selected
                    },
                    success: function (result) {
                        toastr["success"](`${actionName} ${configs.moduleName}(s) successful`);
                        datatableUtils.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} ${configs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        datatableUtils.configs.selected = [];
                        configs.element.ladda.laddaDeleteBtn.stop();
                        App.unblockUI(configs.tableId);
                        reloadDatatable(configs.$table);
                    }
                });
            }
        });
    },

    getLicenceExpireWitinMonth: function () {
        $.ajax({
            url: licenceConfigs.urls.getExpireWithinMonths,
            type: 'GET',
            success: function (result) {
                $("#willExpireLabel").html(getExpireText("OP&E's date", result.expire));
                $("#willExpireAgainLabel").html(getExpireText("OP&E's date", result.expireAgain));
            },
            error: function (result) {
            },
            complete: function (result) {
                licenceConfigs.selected = [];
                licenceConfigs.laddateminateBtn.stop();
                App.unblockUI(licenceConfigs.tableId);
            }
        });
    },

    setExpiryClass: function ($row, cellIndex, period) {
        if (period == null) return;

        var periodClass = period == EXPIRY_PERIOD.WILL_EXPIRE_SOON ? "warning" : period == EXPIRY_PERIOD.WILL_EXPIRE_AGAIN ? "info" : "danger";

        $($row.children()[cellIndex]).addClass(periodClass);
    }
}

$(document).ready(function () {
    fncs.initPage();
});