var job_configs = {
    moduleName: "Job",
    selected: [],
    $table: null,
    tableId: "#job_datatable",
    $datatable: $("#job_datatable"),
    urls: {
        getList: apiUrl.job.getList,
        edit: apiUrl.job.edit,
        delete: apiUrl.job.delete
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

var job_fncs = {
    initPage: function (confs) {
        if (confs != null) {
            job_configs = Object.assign({}, job_configs, confs);
        }

        job_fncs.initDatatable();
        job_fncs.initEvents();
    },
    initDatatable: function () {
        job_configs.$table = job_configs.$datatable.dataTable({
            ajax: {
                url: job_configs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
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
                        if (data.numberOfShifts == 0) {
                            return '<div class="checker">' +
                                '<span>' +
                                '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' +
                                data.id +
                                '">' +
                                '</span>' +
                                '</div>';
                        } else {
                            return "";
                        }
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center action-column",
                    "render": function (data) {
                        return `<div><a href="${job_configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Job")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "customerName",
                    "sClass": "text-center customer-column",
                },
                {
                    "mData": "location",
                    "sClass": "text-center location-column",
                    "render": function(data){
                        if(data == null || data == "") return "";

                        return data.replace(/^,/, "");
                    }
                },
                {
                    "mData": "numberOfShifts",
                    "sClass": "text-center number-of-shift-column",
                },
                {
                    "mData": "description",
                    "sClass": "text-center description-column",
                }
            ],
            "fnDrawCallback": function (settings) {
                datatableUtils.configs = job_configs;
                datatableUtils.initEvents(settings);
            }
        });
    },
    initEvents: function () {
        $(job_configs.element.btn.btnDeleteId).on("click", function () {
            job_fncs.delete();
        });
    },

    delete: function () {
        var actionName = "Delete";
        if (!datatableUtils.validateSelected(job_configs.moduleName + "s")) {
            return;
        }
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} ${job_configs.moduleName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                job_configs.element.ladda.laddaDeleteBtn.start();
                App.blockUI({
                    target: job_configs.tableId
                });
                $.ajax({
                    url: job_configs.urls.delete,
                    type: 'POST',
                    data: {
                        "": datatableUtils.configs.selected
                    },
                    success: function (result) {
                        toastr["success"](`${actionName} ${job_configs.moduleName}(s) successful`);
                        datatableUtils.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} ${job_configs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        datatableUtils.configs.selected = [];
                        job_configs.element.ladda.laddaDeleteBtn.stop();
                        App.unblockUI(job_configs.tableId);
                        reloadDatatable(job_configs.$table);
                    }
                });
            }
        });
    }
}
