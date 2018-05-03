var leaveConfigs = {
    modelName: "EmployeeLeave",
    $table: null,
    tableId: "#leavedatatable",
    $datatable: $("#leavedatatable"),
    selected: [],
    //btnActiveId: "#activeBtn",
    btnTeminateId: "#teminateBtn",
    btnAddId: "#btnAddLeave",
    //laddaActiveBtn: Ladda.create(document.querySelector("#activeBtn")),
    laddateminateBtn: Ladda.create(document.querySelector("#teminateBtn")),
    parentId: 0, // need set employee id 
    urls: {
        getList: apiUrl.employeeleave.getList,
        add: apiUrl.employeeleave.add,
        edit: apiUrl.employeeleave.edit,
        delete: apiUrl.employeeleave.delete
    }
};

var leavefncs = {
    initPage: function (confs) {
        if (confs != null) {
            leaveConfigs = Object.assign({}, configs, confs);
        }

        leavefncs.initDatatable();
        leavefncs.initEvents();
    },
    initDatatable: function () {
        leaveConfigs.$table = leaveConfigs.$datatable.dataTable({
            ajax: {
                url: leaveConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "employeeId": leaveConfigs.parentId
                };
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
                        return `<div class="checker"><span><input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="${data.id}"></span></div>`;
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (value, type, data) {
                        return `<div><a href="${leaveConfigs.urls.edit}/${data.id}" class="btn btn-xs btn-primary"><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": null,
                    "render": function (value, type, data) {
                        return `<a href='${leaveConfigs.urls.edit}/${data.id}' ${tooltipHelper.edit(leaveConfigs.modelName)}>${data.leaveType}</a>`;
                    }
                },
                {
                    "mData": "startDate",
                    "render": function (data) {
                        if (!data) return "Not Required";
                        return moment(data).format(constant.dateFormat);
                    }
                },
                {
                    "mData": "endDate",
                    "render": function (data) {
                        return moment(data).format(constant.dateFormat);
                    }
                },
                 {
                     "mData": "note"
                 }
                  
            ],
            "initComplete": function (settings, json) {
                // leavefncs.customFilter();
            },
            "fnDrawCallback": function (settings) {
                // datable header checkboxes on click
                leavefncs.offBulkCheck();
                leavefncs.onBulkCheck();

                // datatable set cursor is pointer
                leaveConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");

                    const rowColor = $(this).find("td.rowColor").html();
                    if (rowColor !== "") {
                        $(this).addClass(rowColor);
                    }
                });

                // datatable tr on click
                leaveConfigs.$datatable.off("click", 'tbody tr');
                leaveConfigs.$datatable.on("click", 'tbody tr', function () {
                    $(this).toggleClass("active");
                    var checkboxes = $(this).find(".checkboxes");
                    $(checkboxes).parents("span").toggleClass("checked");
                    $.uniform.update(checkboxes);

                    // bind selected array
                    var id = $(checkboxes).data("id");
                    if ($(checkboxes).parents("span").hasClass("checked")) {
                        leaveConfigs.selected.push(id);
                        var totalRecords = settings.fnRecordsTotal();
                        if (leaveConfigs.selected.length === totalRecords) {
                            leavefncs.offBulkCheck();
                            leavefncs.checkBulkCheck();
                            leavefncs.onBulkCheck();
                        }
                    } else {
                        leaveConfigs.selected.remove(id);
                        leavefncs.offBulkCheck();
                        leavefncs.unCheckBulkCheck();
                        leavefncs.onBulkCheck();
                    }
                });

                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    },
    validateSelected: function () {
        if (leaveConfigs.selected.length < 1) {
            toastr["error"]("Eror - No Leave Records selected");
            return false;
        }
        return true;
    },
    deSelectAll: function () {
        leaveConfigs.selected = [];
        leavefncs.offBulkCheck();
        var groupCheck = $datatable.find(".group-checkable");
        if ($(groupCheck).parents("span").hasClass("checked")) {
            $(groupCheck).trigger("click");
        }
        leavefncs.onBulkCheck();
        leaveConfigs.$datatable.find('tbody tr').each(function () {
            if ($(this).hasClass("active")) {
                $(this).trigger("click");
            }
        });
    },
    onBulkCheck: function () {
        leaveConfigs.$datatable.find(".group-checkable").change(function () {
            var checkboxs = $(this).attr("data-set");
            var isCheckedAll = $(this).is(":checked");
            leaveConfigs.selected = [];
            $(checkboxs).each(function () {
                if (isCheckedAll === true) {
                    $(this).parents("tr").addClass("active");
                    $(this).parents("span").addClass("checked");

                    // bind selected array
                    var id = $(this).data("id");
                    leaveConfigs.selected.push(id);
                } else {
                    $(this).parents("tr").removeClass("active");
                    $(this).parents("span").removeClass("checked");
                }
            });
            $.uniform.update(checkboxs);
        });
    },
    offBulkCheck: function () {
        leaveConfigs.$datatable.find(".group-checkable").off("change");
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
    },
    teminate: function () {
        if (!leavefncs.validateSelected()) {
            return;
        }

        swal({
            title: "Are you sure?",
            text: `You will not be able to recover this record(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                leaveConfigs.laddateminateBtn.start();
                App.blockUI({
                    target: leaveConfigs.tableId
                });
                $.ajax({
                    url: leaveConfigs.urls.delete,
                    type: 'POST',
                    data: {
                        "": leaveConfigs.selected
                    },
                    success: function (result) {
                        reloadDatatable(leaveConfigs.$table);
                        toastr["success"](`Delete ${leaveConfigs.modelName}(s) successful`);
                    },
                    error: function (result) {
                        toastr["error"](`Delete ${leaveConfigs.modelName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        leaveConfigs.selected = [];
                        leaveConfigs.laddateminateBtn.stop();
                        App.unblockUI(leaveConfigs.tableId);
                    }
                });
            }
        });

        
    },
    initEvents: function () {
       $(leaveConfigs.btnTeminateId).on('click', function () {
            leavefncs.teminate();
        });

        $(leaveConfigs.btnAddId).on("click", function () {
            leavefncs.add();
        });
    },
    add: function () {
        window.location.href = `${leaveConfigs.urls.add}/${leaveConfigs.parentId}`;
    }
}

$(document).ready(function () {
    leavefncs.initPage();
});