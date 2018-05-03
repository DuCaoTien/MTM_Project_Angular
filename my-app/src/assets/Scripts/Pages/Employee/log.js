var logs_configs = {
    $table: null,
    $datatable: $("#logs_datatable"),
    urls: {
        getList: apiUrl.employee.getLogs
    }
};

var logs_fncs = {
    initPage: function () {
        logs_fncs.initDatatable();
    },
    initDatatable: function () {
        logs_configs.$table = logs_configs.$datatable.dataTable({
            ajax: {
                url: logs_configs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "aaSorting": [[1, "desc"]],
            "aoColumns": [
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "mData": "createdByName",
                    "bSearchable": false
                },
                {
                    "mData": "date",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateTimeFormat);
                        return "";
                    }
                },
                {
                    "mData": "notes"
                }
            ]
        });
    },
    resetForm: function (args) {
        resetForm(args);
        reloadDatatable(logs_configs.$table);
    }
}
