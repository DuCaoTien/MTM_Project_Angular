$(document).ready(function () {
    var configurationInit = [];

    function initDropdownList(target) {
        // remove # char: #licence -> licence
        var element = target.replace("#", "");

        // check if list not contain element then init tab
        if (!configurationInit.contains(element)){
            // tab is init
            configurationInit.push(element);

            fncs.initPage(generateConfig(element));
        }
    }

    $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        var target = $(e.target).attr("href");
        initDropdownList(target);
    });

    initDropdownList(getActiveTab());
});
var configs = null;
var isAccountPermission = false;
function getActiveTab() {
    var activeLi = $(".nav-tabs li.active");
    var aTag = !activeLi ? null : activeLi.find("a");
    return !aTag ? "" : aTag.attr("href");
}
function generateConfig(type) {
    return {
        modelName: "Configuration",
        entityType: type,
        $table: null,
        tableId: `#${type}-datatable`,
        $datatable: $(`#${type}-datatable`),
        selected: [],
        btnAddId: `#${type}-addBtn`,
        urls: {
            getList: apiUrl.configurations.getList + "?group=" + $(`#${type}-addBtn`).data("group"),
            add: apiUrl.configurations.add,
            edit: apiUrl.configurations.edit,
            delete: apiUrl.configurations.delete
        },
        $customFilterWrapper: $(`#${type}-custom-filter`),
        $customFilter: $(`#${type}-customFilter`),
        customFilter: `#${type}-customFilter`,
        removeItemClass: "removeItem",
        aoColunms: [
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
                "render": function (value, type, data) {
                    let html = `<div>`;
                    if (!data.allowChange || isAccountPermission) {
                        html += `<a href="javascript:void(0)" class="btn btn-xs btn-danger" disabled="disabled" ${
                            tooltipHelper.edit("Configuration")}><i class="fa fa-edit"></i></a>&nbsp;&nbsp;&nbsp;`;
                        html += `<a href="javascript:void(0);" class="btn btn-danger btn-xs" disabled="disabled" ${
                            tooltipHelper.canNotRemove("Configuration")}><i class="fa fa-trash"></i></a>`;
                    } else {
                        html += `<a href="${configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${
                            tooltipHelper.edit("Configuration")}><i class="fa fa-edit"></i></a>&nbsp;&nbsp;&nbsp;`;
                        if (data.deleteable === true) {
                            html += `<a href="javascript:void(0);" data-id="${data.id}" class="${configs.removeItemClass
                                } btn btn-xs btn-primary" ${tooltipHelper.remove("Configuration")
                                }><i class="fa fa-trash"></i></a>`;
                        } else {
                            html += `<a href="javascript:void(0);" class="btn btn-danger btn-xs" disabled="disabled" ${
                                tooltipHelper.canNotRemove("Configuration")}><i class="fa fa-trash"></i></a>`;
                        }
                    }
                    html += `</div>`;
                    return html;
                }
            },
            {
                "mData": "configTypeName"
            },
            {
                "mData": "configValue",
                "render": function (value, type, data) {
                    if (!data.allowChange) {
                        return `<a href='javascript:void(0);' ${tooltipHelper.edit("Configuration")}>${data.configValue
                            }</a>`;
                    } else {
                        return `<a href='${configs.urls.edit}/${data.id}' ${tooltipHelper.edit("Configuration")}>${data
                            .configValue}</a>`;
                    }
                }
            },
            {
                "mData": "description"
            }
        ]
    };
}
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
                aoData.columns[2].search.value = configs.$customFilter.val();
            }, "aaSorting": [[2, 'asc']],
            "aoColumns": configs.aoColunms,
            "initComplete": function (settings, json) {
                fncs.customFilter();
            },
            "fnDrawCallback": function (settings) {
                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    },
    customFilter: function () {
        const filter = configs.$customFilterWrapper.html();
        $(filter).prependTo(`#${configs.entityType}-datatable_filter`);
        configs.$customFilterWrapper.html("");

        configs.$customFilter = $(`.dataTables_filter ${configs.customFilter}`);
        configs.$customFilter.on("change", function () {
            reloadDatatable(configs.$table);
        });
    },
    delete: function (itemId) {

        swal({
            title: "Are you sure?",
            text: `You will not be able to recover this ${configs.modelName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                App.blockUI({
                    target: configs.tableId
                });

                $.ajax({
                    url: configs.urls.delete,
                    type: 'POST',
                    data: {
                        "": [itemId]
                    },
                    success: function (result) {
                        reloadDatatable(configs.$table);
                        toastr["success"](`Delete ${configs.modelName}(s) successful`);
                    },
                    error: function (result) {
                        toastr["error"](`Delete ${configs.modelName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        configs.selected = [];
                        App.unblockUI(configs.tableId);
                    }
                });
            }
        });
    },
    initEvents: function () {
        $(configs.btnAddId).on("click", function () {
            fncs.add($(this).data("group"));
        });
        $(document).delegate(`.${configs.removeItemClass}`, "click", function () {
            const itemId = $(this).data("id");
            fncs.delete(itemId);
        });
    },
    add: function (group) {
        window.location.href = configs.urls.add+"?group="+group;
    }
}