var configsSystemNote = {
    $table: null,
    tableId: "#datatable-systemnote",
    $datatable: $("#datatable-systemnote"),
    selected: [],
    urls: {
        getList: apiUrl.systemnote.getList,
    },
    $customFilterWrapper: $("#custom-filter"),
    $customFilter: $("#system_note_customFilter")
};

var fncsSystemNote = {
    initPage: function (confs) {
        if (confs != null) {
            configsSystemNote = Object.assign({}, configsSystemNote, confs);
        }

        fncsSystemNote.initDatatable();
        fncsSystemNote.initEvents();
    },
    initDatatable: function () {
        configsSystemNote.$table = configsSystemNote.$datatable.dataTable({
            ajax: {
                url: configsSystemNote.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "filterEntities": $("#systemNoteFilter").val(),
                    "filterActivity": configsSystemNote.$customFilter.val(),
                };
            },
            "aaSorting" : [[7, 'desc']],
            "aoColumns": [
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "mData": "systemNoteTypeName"
                },
                {
                    "mData": "field"
                },
                {
                    "mData": "oldValue",
                    "render": function(data){
                        if(data == null) return "";

                        data = data.replace(new RegExp("\r\n", 'g'), "<br/>");
                        data = data.replace(new RegExp("\r\t", 'g'), "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

                        return data;
                    }
                },
                {
                    "mData": null,
                    "render": function(data){
                        if(data.newValue == null) return "";

                        if (data.field == "Signature"){
                            var html = "<img src='" + data.newValue + "' />";

                        } else {
                            data.newValue = data.newValue.replace(new RegExp("\r\n", 'g'), "<br/>");
                            data.newValue = data.newValue.replace(new RegExp("\r\t", 'g'), "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

                            return data.newValue;
                        }

                        
                    }
                },
                {
                    "mData": "activityName",
                    "render": function (data) {
                        if (data === 'Create') {
                            return '<span class="label label-sm label-success"> Create </span>';
                        } else if (data === 'Edit') {
                            return '<span class="label label-sm label-warning"> Edit </span>';
                        } 
                        return "";
                    }
                },
                {
                    "mData": "createdByName"
                },
                {
                    "mData": "date",
                    "render": function (data) {
                        return getLocalFromUtc(data.replace("Z", ""));
                    }

                },
            ],
            "initComplete": function (settings, json) {
                fncsSystemNote.customFilter();
            },
            "fnDrawCallback": function (settings) {
                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    },
    customFilter: function () {
        const filter = configsSystemNote.$customFilterWrapper.html();
        $(filter).prependTo(configsSystemNote.tableId + "_wrapper .dataTables_filter");
        configsSystemNote.$customFilterWrapper.html("");

        configsSystemNote.$customFilter = $(configsSystemNote.tableId + "_wrapper .dataTables_filter #system_note_customFilter");
        configsSystemNote.$customFilter.on("change", function () {
            reloadDatatable(configsSystemNote.$table);
        });
    },
    initEvents: function () {
        var components = [
            {
                id: "",
                type: constant.userSetting.tableLenght
            }, {
                id: "system_note_customFilter",
                type: constant.userSetting.type
            }
        ];
        initUserSetting("datatable-systemnote", constant.userSetting.systemNote, components);
    }
}

$(document).ready(function () {
    var systemNote = false;

    function initSystemNote(target) {
        if (target == "#system-note") {
            if (!systemNote) {
                systemNote = true;
                fncsSystemNote.initPage();
            } else {
                configsSystemNote.$table.DataTable().ajax.reload(null, false);
            }
        }
    }

    $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        var target = $(e.target).attr("href");
        initSystemNote(target);
    });

    initSystemNote(getActiveTab());
});

function getActiveTab() {
    var activeLi = $(".nav-tabs li.active");
    var aTag = !activeLi ? null : activeLi.find("a");
    return !aTag ? "" : aTag.attr("href");
}