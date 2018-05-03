var supplierConfigs = {
    modelName: "Supplier",
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    selected: [],
    btnDeleteId: "#btnDelete",
    btnAddId: "#btnAdd",
    laddateminateBtn: Ladda.create(document.querySelector("#btnDelete")),
    urls: {
        getList: apiUrl.supplier.getList,
        add: apiUrl.supplier.add,
        edit: apiUrl.supplier.edit,
        delete: apiUrl.supplier.delete,
        editContactPartial: apiUrl.contact.editPartial,
        editContact: apiUrl.contact.edit
    },
    $editModal: $("#EditContactModal"),
    $editModalContent: $("#EditContactModalContent"),
    editContactFormId: "edit_contact_form",
};

var contactId = 0;

var fncs = {
    initPage: function (confs) {
        if (confs != null) {
            supplierConfigs = Object.assign({}, configs, confs);
        }

        fncs.initDatatable();
        fncs.initEvents();
    },
    initDatatable: function () {
        supplierConfigs.$table = supplierConfigs.$datatable.dataTable({
            ajax: {
                url: supplierConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = {
                    "employeeId": supplierConfigs.employeeId
                };
            },
            "aaSorting": [[3, 'asc']],
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
                        return `<div class="checker"><span><input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="${data.id}"></span></div>`;
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center action-column",
                    "render": function (value, type, data) {
                        return `<div><a href="${supplierConfigs.urls.edit}/${data.id}" class="btn btn-xs btn-primary"><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "companyName",
                    "sClass": "text-center company-name-column",
                },
                {
                    "mData": "email",
                    "sClass": "text-center email-column",
                    "render": function (data) {
                        if (data == null) return "";
                        return '<a href="mailto:' + data + '?Subject=">' + data + '</a>';
                    }
                },
                {
                    "mData": "phoneNumber",
                    "sClass": "text-center phone-number-column",
                },
                {
                    "mData": "contacts",
                    "bSortable": false,
                    "bSearchable": false,
                    "render": function (data) {
                        var $html = $('<div/>');
                        var index = 0;
                        (data || []).forEach(function (item) {
                            index++;
                            var a = `<a class='contact-item' style="font-size: 12px;" href="javascript:void(0);" alt="${item.fullName}" data-id="${item.id}" onclick="fncs.editContact(this);">${index + '. <span>' + item.fullName}</span></a><br/>`;
                            var $a = $(a);
                            $html.append($a);
                        })

                        return `<div>${$html.html()}</div>`;
                    }
                },
                {
                    "mData": "type",
                    "sClass": "text-center type-name-column",
                    "render": function (data) {
                        return getSupplierType(data);
                    }
                },
                {
                    "mData": "status",
                    "sClass": "text-center status-column",
                    "render": function (data) {
                        return getSupplierStatus(data);
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
                supplierConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                // datatable tr on click
                supplierConfigs.$datatable.off("click", "tbody tr");
                supplierConfigs.$datatable.on("click", "tbody tr", function () {
                    $(this).toggleClass("active");
                    const checkboxes = $(this).find(".checkboxes");
                    $(checkboxes).parents("span").toggleClass("checked");
                    $.uniform.update(checkboxes);

                    // bind selected array
                    var id = $(checkboxes).data("id");
                    if ($(checkboxes).parents("span").hasClass("checked")) {
                        supplierConfigs.selected.push(id);
                        var totalRecords = settings.fnRecordsTotal();
                        if (supplierConfigs.selected.length === totalRecords) {
                            fncs.offBulkCheck();
                            fncs.checkBulkCheck();
                            fncs.onBulkCheck();
                        }
                    } else {
                        supplierConfigs.selected.remove(id);
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
            fncs.reloadDatatable(supplierConfigs.$table);
        });
    },
    validateSelected: function () {
        if (supplierConfigs.selected.length < 1) {
            toastr["error"]("Eror - No suppliers selected");
            return false;
        }
        return true;
    },
    deSelectAll: function () {
        supplierConfigs.selected = [];
        fncs.offBulkCheck();
        var groupCheck = $datatable.find(".group-checkable");
        if ($(groupCheck).parents("span").hasClass("checked")) {
            $(groupCheck).trigger("click");
        }
        fncs.onBulkCheck();
        supplierConfigs.$datatable.find('tbody tr').each(function () {
            if ($(this).hasClass("active")) {
                $(this).trigger("click");
            }
        });
    },
    onBulkCheck: function () {
        supplierConfigs.$datatable.find(".group-checkable").change(function () {
            var checkboxs = $(this).attr("data-set");
            var isCheckedAll = $(this).is(":checked");
            supplierConfigs.selected = [];
            $(checkboxs).each(function () {
                if (isCheckedAll === true) {
                    $(this).parents("tr").addClass("active");
                    $(this).parents("span").addClass("checked");

                    // bind selected array
                    var id = $(this).data("id");
                    supplierConfigs.selected.push(id);
                } else {
                    $(this).parents("tr").removeClass("active");
                    $(this).parents("span").removeClass("checked");
                }
            });
            $.uniform.update(checkboxs);
        });
    },
    offBulkCheck: function () {
        supplierConfigs.$datatable.find(".group-checkable").off("change");
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
        if (!fncs.validateSelected()) {
            return;
        }

        swal({
            title: "Are you sure?",
            text: `You will not be able to recover this ${supplierConfigs.modelName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                supplierConfigs.laddateminateBtn.start();
                App.blockUI({
                    target: supplierConfigs.tableId
                });
                $.ajax({
                    url: supplierConfigs.urls.delete,
                    type: 'POST',
                    data: {
                        "": supplierConfigs.selected
                    },
                    success: function (result) {
                        reloadDatatable(supplierConfigs.$table);
                        toastr["success"](`Delete ${supplierConfigs.modelName}(s) successful`);
                    },
                    error: function (result) {
                        toastr["error"](`Delete ${supplierConfigs.modelName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        supplierConfigs.selected = [];
                        supplierConfigs.laddateminateBtn.stop();
                        App.unblockUI(supplierConfigs.tableId);
                    }
                });
            }
        });


    },
    initEvents: function () {
        $(supplierConfigs.btnDeleteId).on('click', function () {
            fncs.delete();
        });

        $(supplierConfigs.btnAddId).on("click", function () {
            fncs.add();
        });
    },
    add: function () {
        window.location.href = `${supplierConfigs.urls.add}`;
    },
    editContact: function(obj) {
        contactId = $(obj).data("id");

        supplierConfigs.$editModalContent.load(`${supplierConfigs.urls.editContactPartial}/${contactId}`, function () {
            resetFormValidator(supplierConfigs.editContactFormId);
            $(`#${supplierConfigs.editContactFormId} select`).select2({
                placeholder: "Select an option"
            });
            $(`#${supplierConfigs.editContactFormId} .select2-container`).each(function () {
                $(this).removeClass('select2-container--bootstrap').addClass('select2-container--default');
            });
            supplierConfigs.$editModal.modal("show");
            supplierConfigs.$editModal.find("input:checkbox").uniform();
            supplierConfigs.$editModalContent.trigger("mouseover");
        });
    },
    onSavedContactAndClose: function (modalId, formId) {
        $(`.contact-item[data-id=${contactId}] span`).text($(`#${modalId} #FirstName`).val() + ' ' + $(`#${modalId} #LastName`).val());
        $(`#${modalId}`).modal("hide");
        resetForm(formId);
    },
}

$(document).ready(function () {
    fncs.initPage();
});