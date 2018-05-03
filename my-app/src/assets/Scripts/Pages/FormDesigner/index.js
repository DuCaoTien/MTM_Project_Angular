var configs = {
    moduleName: "Interactive Document",
    selected: [],
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    urls: {
        getList: apiUrl.form.getList,
        edit: apiUrl.form.edit,
        delete: apiUrl.form.delete,
        active: apiUrl.form.active,
        mandate: apiUrl.form.mandate
    },
    element: {
        btn: {
            btnDeleteId: "#btnDelete"
        },
        ladda: {
            laddaDeleteBtn: Ladda.create(document.querySelector("#btnDelete"))
        }
    }
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
            "aaSorting": [[3, "asc"]],
            "fnServerParams": function (aoData) {
            },
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
                        if (data.isUsed === false || data.status === 'InActive') {
                            return '<div class="checker">' +
                                '<span>' +
                                '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' + data.id + '">' +
                                '</span>' +
                                '</div>';
                        } else {
                            return '';
                        }
                        
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div>
                                    <a href="${configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Interactive Document")}>
                                        <i class="fa fa-edit"></i>
                                    </a>
                                </div>`;
                    }
                },
                {
                    "mData": "name"
                },
                {
                    "mData": "description"
                },
                {
                    "mData": "isPortrait",
                    "render": function (data) {
                        return `<span class="label label-sm label-${(data == true ? "success" : "danger")}"> ${(data == true ? "Portrait" : "Landscape")} </span>`;
                    }
                },
                {
                    "mData": "totalPages"
                },
                {
                    "mData": null,
                    "sClass": "text-center vertical-middle",
                    "render": function (data) {
                        var isactive = data.status == "Active";
                        var activeLabel = isactive ? "Deactivate" : "Activate";

                        return `<div data-id="${data.id}" class="btn-update-status">
                                     <div class="btn-switch " ${tooltipHelper.tooltips("", activeLabel, "")}>
                                        <i class="${isactive ? "text-primary" : ""} fa fa-${isactive ? "toggle-on" : "toggle-off"}"></i>
                                        ${data.status}
                                    </div>
                                </div>`;
                    }
                },
                {
                    "mData": null,
                    "sClass": "text-center vertical-middle",
                    "render": function (data) {
                        var isrequired = data.isRequired;
                        var requireLabel = isrequired ? "Deactivate" : "Activate";

                        return `<div data-id="${data.id}" class="btn-mandatory">   
                                    <div class="btn-switch" ${tooltipHelper.tooltips("", requireLabel, "")}>
                                        <i class="${isrequired ? "text-primary" : ""} fa fa-${isrequired ? "toggle-on" : "toggle-off"}"></i>
                                        ${data.isRequired ? "Yes" : "No"}
                                    </div>
                                </div>`;
                    }
                },
                {
                    "mData": "createdOnUtc",
                    "render": function (data) {
                        return getLocalFromUtc(data);
                    }
                },
                {
                    "mData": "createdByName"
                }
            ],
            "initComplete": function (settings, json) {
            },
            "fnDrawCallback": function (settings) {
                // datatable set cursor is pointer
                configs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                datatableUtils.initEvents(settings);

                fncs.initDrawEvents();
            }
        });
    },
    initDrawEvents: function() {
        $(".btn-update-status").on("click",
            function () {
                var actionName = "Update";

                var id = $(this).attr("data-id");

                $.ajax({
                    url: configs.urls.active + "/" + id,
                    type: 'POST',
                    data: {
                        "": id
                    },
                    success: function (result) {
                        toastr["success"](`${configs.moduleName}(s) updated`);
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
            });

        $(".btn-mandatory").on("click",
            function() {
                var actionName = "Update";

                var id = $(this).attr("data-id");

                $.ajax({
                    url: configs.urls.mandate + "/" + id,
                    type: 'POST',
                    data: {
                        "": id
                    },
                    success: function (result) {
                        toastr["success"](`${configs.moduleName}(s) updated`);
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
            });
    },
    initEvents: function () {
        $(configs.element.btn.btnDeleteId).on("click", function () {
            fncs.delete();
        });
    },

    delete: function () {
        var actionName = "Delete";
        if (!datatableUtils.validateSelected('interactive documents')) {
            return;
        }
        swal({
            title: "",
            text: 'Delete Interactive Document(s)!',
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: 'Confirm',
            cancelButtonText: "Cancel",
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
                        toastr["success"](`${configs.moduleName}(s) deleted successful`);
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
    }
}

