var configs = {
    moduleName: "hired plant & equipment",
    selected: [],
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    urls: {
        getList: apiUrl.hiredPlantEquipment.getList,
        edit: apiUrl.hiredPlantEquipment.edit,
        delete: apiUrl.hiredPlantEquipment.delete
    },
    element: {
        btn: {
            btnDeleteId: "#btnDelete"
        },
        ladda: {
            laddaDeleteBtn: Ladda.create(document.querySelector("#btnDelete"))
        }
    },
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
            },
            "aaSorting": [[3, 'asc']],
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
                        return `<div><a href="${configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Hired Plant & Equipment")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "sClass": "text-center",
                    "mData": "name"
                },
                {
                    "sClass": "text-center",
                    "mData": "supplierName"
                },
                {
                    "sClass": "text-center",
                    "mData": "description"
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
            }
        });
    },

    initEvents: function () {

    },

    initEvents: function () {
        $(configs.element.btn.btnDeleteId).on("click", function () {
            fncs.delete();
        });
    },

    delete: function () {
        var actionName = "Delete";
        if (!datatableUtils.validateSelected("hired plant & equipment")) {
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
    }
}

$(document).ready(function () {
    fncs.initPage();
});