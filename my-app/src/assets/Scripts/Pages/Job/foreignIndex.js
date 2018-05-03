var job_configs = {
    moduleName: "Job",
    selected: [],
    $table: null,
    tableId: "#job_datatable",
    $datatable: $("#job_datatable"),
    urls: {
        getList: apiUrl.job.getList,
        edit: apiUrl.job.edit
    }
};

var job_fncs = {
    initPage: function (confs) {
        if (confs != null) {
            job_configs = Object.assign({}, job_configs, confs);
        }

        datatableUtils.configs = job_configs;
        job_fncs.initDatatable();
    },
    initDatatable: function () {
        job_configs.$table = job_configs.$datatable.dataTable({
            ajax: {
                url: job_configs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "aaSorting": [[2, "desc"]],
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
                        return `<div><a href="${job_configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Job")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "jobNumber"
                },
                {
                    "mData": "numberOfShifts"
                },
                {
                    "mData": "description"
                }
            ],
            "fnDrawCallback": function (settings) {
                datatableUtils.initEvents(settings);
            }
        });
    }
    , resetForm: function (args) {
        resetForm(args);
        reloadDatatable(job_configs.$table);
    }
}
