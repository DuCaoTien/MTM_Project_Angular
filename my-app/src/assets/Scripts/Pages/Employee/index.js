var configs = {
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    selected: [],
    terminateBtnId: "#terminateBtn",
    showinactiveBtnId: "#showinactiveBtn",
    laddaterminateBtn: Ladda.create(document.querySelector('#terminateBtn')),
    laddashowinactiveBtn: Ladda.create(document.querySelector('#showinactiveBtn')),
    urls: {
        getList: apiUrl.employee.getList,
        edit: apiUrl.employee.edit,
        makeactive: apiUrl.employee.makeactive,
        makeinactive: apiUrl.employee.makeinactive
    },
    $customFilterWrapper: $("#customFilterWrapper"),
    customFilterBySystemAccessId: "#customFilterBySystemAccess",
    customFilterByRoleId: "#customFilterByRole",
    customFilterByUserStatusId: "#customFilterByUserStatus",
    $customFilterBySystemAccess: $("#" + this.customFilterBySystemAccessId),
    $customFilterByRole: $("#" + this.customFilterByRoleId),
    $customFilterByUserStatus: $("#" + this.customFilterByUserStatusId),
    $showinactiveEmployee: "false"
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
                    "filterBySystemAccess": configs.$customFilterBySystemAccess.val(),
                    "filterByRole": configs.$customFilterByRole.val(),
                    "filterByUserStatus": configs.$customFilterByUserStatus.val(),
                    "showinactiveEmployee": configs.$showinactiveEmployee
                };
            },
            "aaSorting": [[3, 'asc']],
            "aoColumns": [
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false,
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        if (data.id == currentUser.id || data.activeStatus == "Inactive") return '';
                         
                        var html = '<div class="checker">';

                            html = html + '<span>' +
                            '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' + data.id + '">' +
                            '</span>';

                            html = html + '</div>';

                        return html;
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        var html = '<div>';

                        if (data.activeStatus != "Inactive"){
                            html = html + `<a href="${configs.urls.edit}/${data.id}" class ="btn btn-xs btn-primary" ${tooltipHelper.edit("Employee")}><i class ="fa fa-edit"></i></a>`;    
                            //html = html + `<a class ="btn btn-xs btn-primary makeinactiveBtn" empId='${data.id}' ${tooltipHelper.active("Employee", true)}><i class ="fa fa-times"></i></a>`;    
                        } else {
                            //html = html + `<a class ="btn btn-xs btn-primary makeactiveBtn" empId='${data.id}' ${tooltipHelper.active("Employee", false)}><i class ="fa fa-check-square"></i></a>`;    
                        }
                        
                        html = html + '</div>';

                        return html;
                    }
                },
                {
                    "mData": "firstName",
                    "sClass": "text-center",
                },
                {
                    "mData": "lastName",
                    "sClass": "text-center",
                },
                {
                    "mData": "mobilePhoneNumber",
                    "sClass": "text-center",
                },
                {
                    "mData": "email",
                    "sClass": "text-center",
                    "render": function (data) {
                        return '<a href="mailto:' + data + '?Subject=">' + data + '</a>';
                    }
                },
                {
                    "mData": "systemAccess",
                    "sClass": "text-center",
                    "render": function (data) {
                        return getSystemAccess(data);
                    }
                },
                {
                    "mData": "role",
                    "sClass": "text-center",
                    "render": function (data) {
                        return getPermission(data);
                    }
                },
                {
                    "mData": null,
                    "render": function (data) {
                        if (data.activeStatus === "Inactive"){
                            return "Inactive";
                        }

                        return getUserStatus(data.status);
                    }
                }
            ],
            "initComplete": function (settings, json) {
                fncs.customFilter();
            },
            "fnDrawCallback": function (settings) {
                // datable header checkboxes on click
                fncs.offBulkCheck();
                fncs.onBulkCheck();

                // datatable set cursor is pointer
                configs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                // datatable tr on click
                configs.$datatable.off("click", "tbody tr");
                configs.$datatable.on("click", "tbody tr", function () {
                    $(this).toggleClass("active");
                    const checkboxes = $(this).find(".checkboxes");
                    $(checkboxes).parents("span").toggleClass("checked");
                    $.uniform.update(checkboxes);

                    // bind selected array
                    var id = $(checkboxes).data("id");
                    if ($(checkboxes).parents("span").hasClass("checked")) {
                        configs.selected.push(id);
                        var totalRecords = settings.fnRecordsTotal();
                        if (configs.selected.length === totalRecords) {
                            fncs.offBulkCheck();
                            fncs.checkBulkCheck();
                            fncs.onBulkCheck();
                        }
                    } else {
                        configs.selected.remove(id);
                        fncs.offBulkCheck();
                        fncs.unCheckBulkCheck();
                        fncs.onBulkCheck();
                    }
                });

                configs.$datatable.off("click", ".makeactiveBtn");
                configs.$datatable.on("click", ".makeactiveBtn", function(){
                    var empId = $(this).attr("empId");
                    var ids = [];
                    ids.push(empId);

                    swal({
                        title: "Are you sure?",
                        text: "You want to re-active employee!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonClass: "btn-warning",
                        confirmButtonText: "Yes, re-active",
                        cancelButtonText: "No, cancel",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    }, function (isConfirm) {
                        if (isConfirm) {

                            App.blockUI({
                                target: configs.tableId
                            });
                            $.ajax({
                                url: apiUrl.employee.makeactive,
                                type: 'POST',
                                data: {
                                    "": ids
                                },
                                success: function (result) {
                                    toastr["success"]("Active employee successful");
                                    fncs.unCheckBulkCheck();
                                },
                                error: function (result) {
                                    console.log("error: " + result);
                                    toastr["error"]("Active employee(s) fail, please try again");
                                },
                                complete: function (result) {
                                    configs.selected = [];
                                    
                                    App.unblockUI(configs.tableId);
                                    reloadDatatable(configs.$table);
                                }
                            });
                        }
                    });
                });

                configs.$datatable.off("click", ".makeinactiveBtn");
                configs.$datatable.on("click", ".makeinactiveBtn", function(){
                    var empId = $(this).attr("empId");
                    var ids = [];
                    ids.push(empId);

                    swal({
                        title: "Are you sure?",
                        text: "You want to de-active employee!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonClass: "btn-warning",
                        confirmButtonText: "Yes, de-active",
                        cancelButtonText: "No, cancel",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    }, function (isConfirm) {
                        if (isConfirm) {

                            App.blockUI({
                                target: configs.tableId
                            });
                            $.ajax({
                                url: apiUrl.employee.makeinactive,
                                type: 'POST',
                                data: {
                                    "": ids
                                },
                                success: function (result) {
                                    toastr["success"]("De-active employee successful");
                                    fncs.unCheckBulkCheck();
                                },
                                error: function (result) {
                                    console.log("error: " + result);
                                    toastr["error"]("de-active employee(s) fail, please try again");
                                },
                                complete: function (result) {
                                    configs.selected = [];
                                    
                                    App.unblockUI(configs.tableId);
                                    reloadDatatable(configs.$table);
                                }
                            });
                        }
                    });
                });

                $('[data-toggle="tooltip"]').tooltip();
            },
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                $('[data-toggle="tooltip"]').tooltip();
                if (aData.activeStatus === "Inactive") $(nRow).addClass("danger");
                
                return nRow;
            }
        });
    },
    customFilter: function () {
        const filter = configs.$customFilterWrapper.html();
        $(filter).prependTo(".dataTables_filter");
        configs.$customFilterWrapper.html("");

        // Filter by system access
        configs.$customFilterBySystemAccess = $(".dataTables_filter " + configs.customFilterBySystemAccessId);
        configs.$customFilterBySystemAccess.on("change", function () {
            reloadDatatable(configs.$table);
        });

        // Filter by roles
        configs.$customFilterByRole = $(".dataTables_filter " + configs.customFilterByRoleId);
        configs.$customFilterByRole.on("change", function () {
            reloadDatatable(configs.$table);
        });

        // Filter by user status
        configs.$customFilterByUserStatus = $(".dataTables_filter " + configs.customFilterByUserStatusId);
        configs.$customFilterByUserStatus.on("change", function () {
            reloadDatatable(configs.$table);
        });
    },
    initEvents: function () {
        $(configs.terminateBtnId).on('click', function () {
            fncs.terminate();
        });

        $(configs.showinactiveBtnId).on('click', function () {
            fncs.showinactive();
        });
    },
    terminate: function () {
        if (!fncs.validateSelected()) {
            return;
        }

        swal({
            title: "Are you sure?",
            text: "You want to terminate employee(s)!",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, terminate",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                configs.laddaterminateBtn.start();
                App.blockUI({
                    target: configs.tableId
                });
                $.ajax({
                    url: apiUrl.employee.terminate,
                    type: 'POST',
                    data: {
                        "": configs.selected
                    },
                    success: function (result) {
                        toastr["success"]("Terminate employee(s) successful");
                        fncs.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"]("Terminate employee(s) fail, please try again");
                    },
                    complete: function (result) {
                        configs.selected = [];
                        configs.laddaterminateBtn.stop();
                        App.unblockUI(configs.tableId);
                        reloadDatatable(configs.$table);
                    }
                });
            }
        });
    },
    showinactive: function(){
        configs.$showinactiveEmployee = "true";

        reloadDatatable(configs.$table);
    },
    validateSelected: function () {
        if (configs.selected.length < 1) {
            toastr["error"]("Error - No employees selected");
            return false;
        }
        return true;
    },
    deSelectAll: function () {
        configs.selected = [];
        fncs.offBulkCheck();
        var groupCheck = configs.$datatable.find(".group-checkable");
        if ($(groupCheck).parents("span").hasClass("checked")) {
            $(groupCheck).trigger("click");
        }
        fncs.onBulkCheck();
        configs.$datatable.find('tbody tr').each(function () {
            if ($(this).hasClass("active")) {
                $(this).trigger("click");
            }
        });
    },
    onBulkCheck: function () {
        configs.$datatable.find(".group-checkable").change(function () {
            var checkboxs = $(this).attr("data-set");
            var isCheckedAll = $(this).is(":checked");
            configs.selected = [];
            $(checkboxs).each(function () {
                if (isCheckedAll === true) {
                    $(this).parents("tr").addClass("active");
                    $(this).parents("span").addClass("checked");

                    // bind selected array
                    var id = $(this).data("id");
                    configs.selected.push(id);
                } else {
                    $(this).parents("tr").removeClass("active");
                    $(this).parents("span").removeClass("checked");
                }
            });
            $.uniform.update(checkboxs);
        });
    },
    offBulkCheck: function () {
        configs.$datatable.find(".group-checkable").off("change");
    },
    checkBulkCheck: function () {
        if (!$(".group-checkable").parents("span").hasClass("checked")) {
            $(".group-checkable").trigger("click");
        }
    },
    unCheckBulkCheck: function () {
        if ($(".group-checkable").parents("span").hasClass("checked")) {
            $(".group-checkable").trigger("click");
        }
    }
}

$(document).ready(function () {
    $(document).ready(function () {
        fncs.initPage();
    });
});