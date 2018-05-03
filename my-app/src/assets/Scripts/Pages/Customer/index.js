var configs = {
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    urls: {
        getList: apiUrl.customer.getList,
        edit: apiUrl.customer.edit,
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
            "aaSorting": [[2, 'asc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${configs.urls.edit}/${data.id}" class="btn btn-xs btn-primary" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "mData": "companyName",
                    "sClass": "text-center"
                },
                {
                    "mData": "abn",
                    "sClass": "text-center"
                },
                {
                    "mData": "email",
                    "sClass": "text-center",
                    "render": function (data) {
                        if (data == null) return "";
                        return '<a href="mailto:' + data + '?Subject=">' + data + '</a>';
                    }
                },
                {
                    "mData": "phoneNumber",
                    "sClass": "text-center",
                    "render": function(data) {
                        return formatPhoneNumber(data);
                    }
                },
                {
                    "mData": "contacts",
                    "bSortable": false,
                    "bSearchable": false,
                    "render": function (data) {
                        var $html = $('<div/>');
                        var index = 0;
                        (data || []).forEach(function (item) {
                            index ++;
                            var a = `<a class='contact-item' style="font-size: 12px;" href="javascript:void(0);" alt="${item.fullName}" data-id="${item.id}" onclick="fncs.editContact(this);">${index + '. <span>' + item.fullName}</span></a><br/>`;
                            var $a = $(a);
                            $html.append($a);
                        })

                        return `<div>${$html.html()}</div>`;
                    }
                },
                {
                    "mData": "customerType",
                    "sClass": "text-center",
                }
            ],
            "initComplete": function (settings, json) {
            },
            "fnDrawCallback": function (settings) {
                // datatable set cursor is pointer
                configs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    },
    initEvents: function () {
        
    },
    editContact: function(obj) {
        contactId = $(obj).data("id");

        configs.$editModalContent.load(`${configs.urls.editContactPartial}/${contactId}`, function () {
            resetFormValidator(configs.editContactFormId);
            $(`#${configs.editContactFormId} select`).select2({
                placeholder: "Select an option"
            });
            $(`#${configs.editContactFormId} .select2-container`).each(function () {
                $(this).removeClass('select2-container--bootstrap').addClass('select2-container--default');
            });
            configs.$editModal.modal("show");
            configs.$editModal.find("input:checkbox").uniform();
            configs.$editModalContent.trigger("mouseover");
        });
    },
    onSavedContactAndClose: function (modalId, formId) {
        $(`.contact-item[data-id=${contactId}] span`).text($(`#${modalId} #FirstName`).val() + ' ' + $(`#${modalId} #LastName`).val());
        $(`#${modalId}`).modal("hide");
        resetForm(formId);
    },
}