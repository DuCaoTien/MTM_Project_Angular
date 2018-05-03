var contactConfigs = {
    tag: "Contact",
    $table: null,
    tableId: "#contact_datatable",
    $datatable: $("#contact_datatable"),
    selected: [],
    isInTag: false,
    urls: {
        getList: apiUrl.contact.getList,
        edit: apiUrl.contact.edit,
        delete: apiUrl.contact.delete,
        editCustomer: apiUrl.customer.edit,
        editSupplier: apiUrl.supplier.edit
    },
    tableLength: "#contact_datatable_length",
    datatableFilter: "#contact_datatable_filter",
    customFilterWrapper: "#contact_customFilterWrapper",
    customFilterByContactTypeId: "#contact_customFilterByContactType",
    customFilterByTypeId: "#contact_customFilterByType",
    customFilterByJobTitleId: "#contact_customFilterByJobTitle",
    $customFilterWrapper: $("#contact_customFilterWrapper"),
    $customFilterByContactType: $("#contact_customFilterByContactType"),
    $customFilterByType: $("#contact_customFilterByType"),
    $customFilterByJobTitle: $("#contact_customFilterByJobTitle"),
    btnDeleteId: "#btnDelete",
    btnAddId: "#btnAdd",
    btnEditRow: "btnEditRow",
    laddateminateBtn: Ladda.create(document.querySelector("#btnDelete"))
};

var contactFunctions = {
    initPage: function (confs) {
        if (confs != null) {
            contactConfigs = Object.assign({}, configs, confs);
        }

        contactFunctions.initDatatable();
        contactFunctions.initEvents();
    },
    initDatatable: function () {
        contactConfigs.$table = contactConfigs.$datatable.dataTable({
            ajax: {
                url: contactConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.columns[2].search.value = contactConfigs.$customFilterByContactType.val();
                aoData.columns[4].search.value = contactConfigs.$customFilterByType.val();
                aoData.columns[7].search.value = contactConfigs.$customFilterByJobTitle.val();
                aoData.customParams = {
                    "contactType": contactConfigs.$customFilterByContactType.val()
                };
            },
            "aaSorting": [[0, "desc"]],
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
                    "render": function (data) {
                        return `<a href="javascript:void(0);" class="btn btn-xs btn-primary ${contactConfigs.btnEditRow}" data-id="${data.id}" ${tooltipHelper.edit(contactConfigs.tag)}><i class="fa fa-edit"></i></a>`;
                    }
                },
                {
                    "mData": "contactType",
                    "sClass": contactConfigs.isInTag ? "hidden" : "",
                    "render": function (value, type, data) {
                        return value;
                    }
                },
                {
                    "mData": "fullName"
                },
                {
                    "mData": "email",
                    "render": function (data) {
                        if (data == null) return "";
                        return `<a href="mailto:${data}?Subject=">${data}</a>`;
                    }
                },
                {
                    "mData": "contactNumber",
                    "render": function (data) {
                        return formatPhoneNumber(data);
                    }
                },
                {
                    "mData": "jobTitle"
                }
            ],
            "initComplete": function (settings, json) {
                contactFunctions.customFilter();
            },
            "fnDrawCallback": function (settings) {
                // datable header checkboxes on click
                contactFunctions.offBulkCheck();
                contactFunctions.onBulkCheck();

                // datatable set cursor is pointer
                contactConfigs.$datatable.find("tbody tr").each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");

                    const rowColor = $(this).find("td.rowColor").html();
                    if (rowColor !== "") {
                        $(this).addClass(rowColor);
                    }
                });

                // datatable tr on click
                contactConfigs.$datatable.off("click", "tbody tr");
                contactConfigs.$datatable.on("click", "tbody tr", function () {
                    $(this).toggleClass("active");
                    const checkboxes = $(this).find(".checkboxes");
                    $(checkboxes).parents("span").toggleClass("checked");
                    $.uniform.update(checkboxes);

                    // bind selected array
                    const id = $(checkboxes).data("id");
                    if ($(checkboxes).parents("span").hasClass("checked")) {
                        contactConfigs.selected.push(id);
                        const totalRecords = settings.fnRecordsTotal();
                        if (contactConfigs.selected.length === totalRecords) {
                            contactFunctions.offBulkCheck();
                            contactFunctions.checkBulkCheck();
                            contactFunctions.onBulkCheck();
                        }
                    } else {
                        contactConfigs.selected.remove(id);
                        contactFunctions.offBulkCheck();
                        contactFunctions.unCheckBulkCheck();
                        contactFunctions.onBulkCheck();
                    }
                });

                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    },
    customFilter: function () {
        const filter = contactConfigs.$customFilterWrapper.html();
        $(filter).prependTo(`${contactConfigs.datatableFilter}`);
        contactConfigs.$customFilterWrapper.html("");

        $(`${contactConfigs.tableLength}`).closest("div.col-sm-6")
            .removeClass("col-md-6").removeClass("col-sm-6")
            .addClass("col-md-3").addClass("col-sm-3");

        $(`${contactConfigs.datatableFilter}`).closest("div.col-sm-6")
            .removeClass("col-md-6").removeClass("col-sm-6")
            .addClass("col-md-9").addClass("col-sm-9");

        contactConfigs.$customFilterByContactType = $(`${contactConfigs.customFilterByContactTypeId}`);
        contactConfigs.$customFilterByType = $(`${contactConfigs.customFilterByTypeId}`);
        contactConfigs.$customFilterByJobTitle = $(`${contactConfigs.customFilterByJobTitleId}`);

        $(`${contactConfigs.datatableFilter}`).delegate(`${contactConfigs.customFilterByContactTypeId}, ${contactConfigs.customFilterByTypeId}, ${contactConfigs.customFilterByJobTitleId}`, "change", function () {
            reloadDatatable(contactConfigs.$table);
        });
    },
    validateSelected: function () {
        if (contactConfigs.selected.length < 1) {
            toastr["error"](`Error - No contacts selected`);
            return false;
        }
        return true;
    },
    deSelectAll: function () {
        contactConfigs.selected = [];
        contactFunctions.offBulkCheck();
        const groupCheck = $datatable.find(".group-checkable");
        if ($(groupCheck).parents("span").hasClass("checked")) {
            $(groupCheck).trigger("click");
        }
        contactFunctions.onBulkCheck();
        contactConfigs.$datatable.find("tbody tr").each(function () {
            if ($(this).hasClass("active")) {
                $(this).trigger("click");
            }
        });
    },
    onBulkCheck: function () {
        contactConfigs.$datatable.find(".group-checkable").change(function () {
            const checkboxs = $(this).attr("data-set");
            var isCheckedAll = $(this).is(":checked");
            contactConfigs.selected = [];
            $(checkboxs).each(function () {
                if (isCheckedAll === true) {
                    $(this).parents("tr").addClass("active");
                    $(this).parents("span").addClass("checked");

                    // bind selected array
                    const id = $(this).data("id");
                    contactConfigs.selected.push(id);
                } else {
                    $(this).parents("tr").removeClass("active");
                    $(this).parents("span").removeClass("checked");
                }
            });
            $.uniform.update(checkboxs);
        });
    },
    offBulkCheck: function () {
        contactConfigs.$datatable.find(".group-checkable").off("change");
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
    delete: function () {
        if (!contactFunctions.validateSelected("contacts")) {
            return;
        }

        swal({
            title: "Are you sure?",
            text: `You will not be able to recover this ${contactConfigs.tag}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                contactConfigs.laddateminateBtn.start();
                App.blockUI({
                    target: contactConfigs.tableId
                });
                $.ajax({
                    url: contactConfigs.urls.delete,
                    type: "POST",
                    data: {
                        "": contactConfigs.selected
                    },
                    success: function (result) {
                        reloadDatatable(contactConfigs.$table);
                        toastr["success"](`Delete ${contactConfigs.tag}(s) successful`);
                    },
                    error: function (result) {
                        toastr["error"](`Delete ${contactConfigs.tag}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        contactConfigs.selected = [];
                        contactConfigs.laddateminateBtn.stop();
                        App.unblockUI(contactConfigs.tableId);
                    }
                });
            }
        });


    },
    initEvents: function () {

        $(contactConfigs.btnDeleteId).on("click", function () {
            contactFunctions.delete();
        });

        $(contactConfigs.btnAddId).on("click", function () {
            contactFunctions.add();
        });
    }
}