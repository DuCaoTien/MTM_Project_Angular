var configs = {
    $table: null,
    tableId: "#shiftDatatable",
    $datatable: $("#shiftDatatable"),
    urls: {
        getList: "",
        edit: apiUrl.shift.edit
    },
    $customFilterWrapper: $("#shiftCustomFilterWrapper"),
    $customFilter: $("#shiftCustomFilter")
};

var fncs = {
    initPage: function (confs) {
        if (confs != null) {
            configs = Object.assign({}, configs, confs);
        }

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
                    "filterStatus": configs.$customFilter.val(),
                };
            },
            "aaSorting": [[3, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Shift")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
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
                    "mData": "shiftStatusName",
                    "render": function (data) {
                        return '<span class="label label-sm label-success"> ' + data + ' </span>';
                    }
                }
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

                $('[data-toggle="tooltip"]').tooltip();
            },
        });
    },
    customFilter: function () {
        const filter = configs.$customFilterWrapper.html();
        $(filter).prependTo(".dataTables_filter");
        configs.$customFilterWrapper.html("");

        configs.$customFilter = $(".dataTables_filter #shiftCustomFilter");
        configs.$customFilter.on("change", function () {
            reloadDatatable(configs.$table);
        });
    },
    initEvents: function () {
        
    }
}