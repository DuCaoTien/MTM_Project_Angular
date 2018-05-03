var service_history_configs = {
    moduleName: "Service History",
    selected: [],
    $table: null,
    tableId: "#service_history_datatable",
    $datatable: $("#service_history_datatable"),
    urls: {
        getList: apiUrl.serviceHistory.getList,
        edit: apiUrl.serviceHistory.edit,
        delete: apiUrl.serviceHistory.delete
    },
    element: {
        btn: {
            btnDeleteId: "#service_history_datatable_btnDelete"
        },
        ladda: {
            laddaDeleteBtn: Ladda.create(document.querySelector("#service_history_datatable_btnDelete"))
        }
    }
};

var service_history_fncs = {
    initPage: function (confs) {
        if (confs != null) {
            service_history_configs = Object.assign({}, service_history_configs, confs);
        }

        datatableUtils.configs = service_history_configs;
        service_history_fncs.initDatatable();
        service_history_fncs.initEvents();
    },
    initDatatable: function () {
        service_history_configs.$table = service_history_configs.$datatable.dataTable({
            ajax: {
                url: service_history_configs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "filterEntityId": FilterEntityId
                }
            },
            "aaSorting": [[3, "desc"]],
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
                        return `<div><a href="${service_history_configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Service History")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "date",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": "assetType"
                },
                {
                    "mData": "assetName"
                },
                {
                    "mData": "notes"
                }
            ],
            "fnDrawCallback": function (settings) {
                datatableUtils.initEvents(settings);
            }
        });
    },
    initEvents: function () {
        $(service_history_configs.element.btn.btnDeleteId).on("click", function () {
            service_history_fncs.delete();
        });
    },

    delete: function () {
        var actionName = "Delete";
        if (!datatableUtils.validateSelected("service histories")) {
            return;
        }
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} ${service_history_configs.moduleName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                service_history_configs.element.ladda.laddaDeleteBtn.start();
                App.blockUI({
                    target: service_history_configs.tableId
                });
                $.ajax({
                    url: service_history_configs.urls.delete,
                    type: 'POST',
                    data: {
                        "": datatableUtils.configs.selected
                    },
                    success: function (result) {
                        toastr["success"](`${actionName} ${service_history_configs.moduleName}(s) successful`);
                        datatableUtils.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} ${service_history_configs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        datatableUtils.configs.selected = [];
                        service_history_configs.element.ladda.laddaDeleteBtn.stop();
                        App.unblockUI(service_history_configs.tableId);
                        reloadDatatable(service_history_configs.$table);
                    }
                });
            }
        });
    },
    resetForm: function (args) {
        resetForm(args);
        reloadDatatable(service_history_configs.$table);
    }
}
