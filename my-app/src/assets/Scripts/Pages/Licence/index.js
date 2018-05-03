var licenceConfigs = {
    modelName: "Licence",
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    selected: [],
    //btnActiveId: "#activeBtn",
    btnTeminateId: "#teminateBtn",
    btnAddId: "#btnAddLicence",
    //laddaActiveBtn: Ladda.create(document.querySelector("#activeBtn")),
    laddateminateBtn: Ladda.create(document.querySelector("#teminateBtn")),
    parentId: 0, // need set employee id or contact Id
    licenceType: 1, // Need set from caller
    urls: {
        getList: apiUrl.licence.getList,
        add: apiUrl.licence.add,
        edit: apiUrl.licence.edit,
        delete: apiUrl.licence.delete,
        getExpireWithinMonths: apiUrl.configurations.getLicenceExpireWithinMonths
    }
};

var fncs = {
    initPage: function (confs) {
        if (confs != null) {
            licenceConfigs = Object.assign({}, configs, confs);
        }

        fncs.getLicenceExpireWitinMonth();
        fncs.initDatatable();
        fncs.initEvents();
    },
    initDatatable: function () {
        licenceConfigs.$table = licenceConfigs.$datatable.dataTable({
            ajax: {
                url: licenceConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "parentId": licenceConfigs.parentId,
                    "licenceType": licenceConfigs.licenceType
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
                    "sClass": "hidden rowColor",
                    "bSearchable": false,
                    "render": function (value, type, data) {
                        if (data.expired === true) return "danger";
                        if (data.willExpireAgain === true) return "info";
                        if (data.willExpire === true) return "warning";
                        return "";
                    }
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
                        return `<div><a href="${licenceConfigs.urls.edit}/${data.id}" class="btn btn-xs btn-primary"><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "licenceName",
                    "render": function (value, type, data) {
                        return `<a href='${licenceConfigs.urls.edit}/${data.id}' ${tooltipHelper.edit(licenceConfigs.modelName)}>${data.licenceName}</a>`;
                    }
                },
                {
                    "mData": "licenceNumber"
                },
                {
                    "mData": "licenceExpiry",
                    "render": function (data) {
                        if (!data) return "Not Required";
                        return moment(data).format(constant.dateFormat);
                    }
                },
                 {
                     "mData": "attachment",
                     "render": function (value, type, data) {
                         return `<span>${data.attachment} ${data.attachment > 1 ? 'files' : 'file'}</span>`;
                     }
                 }
                  
            ],
            "initComplete": function (settings, json) {
                // fncs.customFilter();
            },
            "fnDrawCallback": function (settings) {
                // datable header checkboxes on click
                fncs.offBulkCheck();
                fncs.onBulkCheck();

                // datatable set cursor is pointer
                licenceConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");

                    const rowColor = $(this).find("td.rowColor").html();
                    if (rowColor !== "") {
                        $(this).addClass(rowColor);
                    }
                });

                // datatable tr on click
                licenceConfigs.$datatable.off("click", 'tbody tr');
                licenceConfigs.$datatable.on("click", 'tbody tr', function () {
                    $(this).toggleClass("active");
                    var checkboxes = $(this).find(".checkboxes");
                    $(checkboxes).parents("span").toggleClass("checked");
                    $.uniform.update(checkboxes);

                    // bind selected array
                    var id = $(checkboxes).data("id");
                    if ($(checkboxes).parents("span").hasClass("checked")) {
                        licenceConfigs.selected.push(id);
                        var totalRecords = settings.fnRecordsTotal();
                        if (licenceConfigs.selected.length === totalRecords) {
                            fncs.offBulkCheck();
                            fncs.checkBulkCheck();
                            fncs.onBulkCheck();
                        }
                    } else {
                        licenceConfigs.selected.remove(id);
                        fncs.offBulkCheck();
                        fncs.unCheckBulkCheck();
                        fncs.onBulkCheck();
                    }
                });

                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    },
    customFilter: function () {
        const filter = `<label>Type:<select class="form-control input-inline datatable-filter" id="customFilter"><option value="" selected="selected">All</option><option value="${roles.manager.id}">${roles.manager.display}</option></select></label>`;

        $(filter).prependTo(".dataTables_filter");

        $("#customFilter").on("change", function () {
            fncs.reloadDatatable(licenceConfigs.$table);
        });
    },
    validateSelected: function () {
        if (licenceConfigs.selected.length < 1) {
            toastr["error"]("Eror - No licences selected");
            return false;
        }
        return true;
    },
    deSelectAll: function () {
        licenceConfigs.selected = [];
        fncs.offBulkCheck();
        var groupCheck = $datatable.find(".group-checkable");
        if ($(groupCheck).parents("span").hasClass("checked")) {
            $(groupCheck).trigger("click");
        }
        fncs.onBulkCheck();
        licenceConfigs.$datatable.find('tbody tr').each(function () {
            if ($(this).hasClass("active")) {
                $(this).trigger("click");
            }
        });
    },
    onBulkCheck: function () {
        licenceConfigs.$datatable.find(".group-checkable").change(function () {
            var checkboxs = $(this).attr("data-set");
            var isCheckedAll = $(this).is(":checked");
            licenceConfigs.selected = [];
            $(checkboxs).each(function () {
                if (isCheckedAll === true) {
                    $(this).parents("tr").addClass("active");
                    $(this).parents("span").addClass("checked");

                    // bind selected array
                    var id = $(this).data("id");
                    licenceConfigs.selected.push(id);
                } else {
                    $(this).parents("tr").removeClass("active");
                    $(this).parents("span").removeClass("checked");
                }
            });
            $.uniform.update(checkboxs);
        });
    },
    offBulkCheck: function () {
        licenceConfigs.$datatable.find(".group-checkable").off("change");
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
    defaultAddForm: function () {
        /*$("#Email").val("");
        $("#userRole").val("4");
        $("#FirstName").val("");
        $("#LastName").val("");*/
    },
    active: function () {
        /*if (!fncs.validateSelected()) {
            return;
        }

        licenceConfigs.laddaActiveBtn.start();
        App.blockUI({
            target: licenceConfigs.tableId
        });
        $.ajax({
            url: apiUrl.activeUser,
            type: 'POST',
            data: {
                "": licenceConfigs.selected
            },
            success: function (result) {
                toastr["success"]("Active user(s) successful");
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"]("Active user(s) fail, please try again");
            },
            complete: function (result) {
                licenceConfigs.selected = [];
                licenceConfigs.laddaActiveBtn.stop();
                App.unblockUI('#datatable');
                reloadDatatable(licenceConfigs.$table);
            }
        });*/
    },
    teminate: function () {
        if (!fncs.validateSelected()) {
            return;
        }

        swal({
            title: "Are you sure?",
            text: `You will not be able to recover this ${licenceConfigs.modelName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                licenceConfigs.laddateminateBtn.start();
                App.blockUI({
                    target: licenceConfigs.tableId
                });
                $.ajax({
                    url: licenceConfigs.urls.delete,
                    type: 'POST',
                    data: {
                        "": licenceConfigs.selected
                    },
                    success: function (result) {
                        reloadDatatable(licenceConfigs.$table);
                        toastr["success"](`Delete ${licenceConfigs.modelName}(s) successful`);
                    },
                    error: function (result) {
                        toastr["error"](`Delete ${licenceConfigs.modelName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        licenceConfigs.selected = [];
                        licenceConfigs.laddateminateBtn.stop();
                        App.unblockUI(licenceConfigs.tableId);
                    }
                });
            }
        });

        
    },
    initEvents: function () {
        /*$(licenceConfigs.btnActiveId).on('click', function () {
            fncs.active();
        });*/

        $(licenceConfigs.btnTeminateId).on('click', function () {
            fncs.teminate();
        });

        $(licenceConfigs.btnAddId).on("click", function () {
            fncs.add();
        });
    },
    add: function () {
        window.location.href = `${licenceConfigs.urls.add}/${licenceConfigs.parentId}?type=${licenceConfigs.licenceType}`;
    },
    getLicenceExpireWitinMonth: function() {
        $.ajax({
            url: licenceConfigs.urls.getExpireWithinMonths,
            type: 'GET',
            success: function (result) {
                $("#willExpireLabel").html(getExpireText("Licence", result.expire));
                $("#willExpireAgainLabel").html(getExpireText("Licence", result.expireAgain));
            },
            error: function (result) {
            },
            complete: function (result) {
                licenceConfigs.selected = [];
                licenceConfigs.laddateminateBtn.stop();
                App.unblockUI(licenceConfigs.tableId);
            }
        });
    }
}

$(document).ready(function () {
    fncs.initPage();
});