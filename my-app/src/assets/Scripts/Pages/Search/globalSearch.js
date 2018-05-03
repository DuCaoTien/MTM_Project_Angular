var globalSearchConfigs = {
    keyword: "",
    urls: {
        editContactPartial: apiUrl.contact.editPartial,
        editContact: apiUrl.contact.edit
    },
    $editModal: $("#EditContactModal"),
    $editModalContent: $("#EditContactModalContent"),
    editContactFormId: "edit_contact_form",
    customer: {
        $table: null,
        $datatable: $("#sectionCustomer .datatable"),
        $section: $("#sectionCustomer"),
        $totalRecords: $("#sectionCustomer .total-result"),
        $notFound: $("#sectionCustomer .not-found"),
        urls: {
            getList: apiUrl.customer.getList,
            edit: apiUrl.customer.edit
        }
    },
    supplier: {
        $table: null,
        $datatable: $("#sectionSupplier .datatable"),
        $section: $("#sectionSupplier"),
        $totalRecords: $("#sectionSupplier .total-result"),
        $notFound: $("#sectionSupplier .not-found"),
        urls: {
            getList: apiUrl.supplier.getList,
            edit: apiUrl.supplier.edit
        }
    },
    employee: {
        $table: null,
        $datatable: $("#sectionEmployee .datatable"),
        $section: $("#sectionEmployee"),
        $totalRecords: $("#sectionEmployee .total-result"),
        $notFound: $("#sectionEmployee .not-found"),
        urls: {
            getList: apiUrl.employee.getList,
            edit: apiUrl.employee.edit
        }
    },
    contact: {
        $table: null,
        $datatable: $("#sectionContact .datatable"),
        $section: $("#sectionContact"),
        $totalRecords: $("#sectionContact .total-result"),
        $notFound: $("#sectionContact .not-found"),
        urls: {
            getList: apiUrl.contact.getList,
            edit: apiUrl.contact.edit,
            editCustomer: apiUrl.customer.edit,
            editSupplier: apiUrl.supplier.edit
        }
    },
    shift: {
        $table: null,
        $datatable: $("#sectionShift .datatable"),
        $section: $("#sectionShift"),
        $totalRecords: $("#sectionShift .total-result"),
        $notFound: $("#sectionShift .not-found"),
        urls: {
            getList: apiUrl.shift.getList,
            edit: apiUrl.shift.edit
        }
    },
    ownedPlantEquipment: {
        $table: null,
        $datatable: $("#sectionOwnedPlantEquipment .datatable"),
        $section: $("#sectionOwnedPlantEquipment"),
        $totalRecords: $("#sectionOwnedPlantEquipment .total-result"),
        $notFound: $("#sectionOwnedPlantEquipment .not-found"),
        urls: {
            getList: apiUrl.ownedPlantEquipment.getList,
            edit: apiUrl.ownedPlantEquipment.edit,
        }
    },
    hiredPlantEquipment: {
        $table: null,
        $datatable: $("#sectionHiredPlantEquipment .datatable"),
        $section: $("#sectionHiredPlantEquipment"),
        $totalRecords: $("#sectionHiredPlantEquipment .total-result"),
        $notFound: $("#sectionHiredPlantEquipment .not-found"),
        urls: {
            getList: apiUrl.hiredPlantEquipment.getList,
            edit: apiUrl.hiredPlantEquipment.edit,
        }
    },
    vehicle: {
        $table: null,
        $datatable: $("#sectionVehicle .datatable"),
        $section: $("#sectionVehicle"),
        $totalRecords: $("#sectionVehicle .total-result"),
        $notFound: $("#sectionVehicle .not-found"),
        urls: {
            getList: apiUrl.vehicle.getList,
            edit: apiUrl.vehicle.edit,
        }
    }
}

var contactId = 0;

var globalSearchFunctions = {
    initPage: function (keyword) {
        globalSearchConfigs.keyword = keyword,
            showAjaxLoadingMask();
        globalSearchFunctions.initDataTable();
    },
    onSavedContactAndClose: function (modalId, formId) {
        $(`.contact-item[data-id=${contactId}] span`).text($(`#${modalId} #FirstName`).val() + ' ' + $(`#${modalId} #LastName`).val());
        $(`#${modalId}`).modal("hide");
        resetForm(formId);
    },
    editContact: function (obj) {
        contactId = $(obj).data("id");

        globalSearchConfigs.$editModalContent.load(`${globalSearchConfigs.urls.editContactPartial}/${contactId}`, function () {
            resetFormValidator(globalSearchConfigs.editContactFormId);
            $(`#${globalSearchConfigs.editContactFormId} select`).select2({
                placeholder: "Select an option"
            });
            $(`#${globalSearchConfigs.editContactFormId} .select2-container`).each(function () {
                $(this).removeClass('select2-container--bootstrap').addClass('select2-container--default');
            });
            globalSearchConfigs.$editModal.modal("show");
            globalSearchConfigs.$editModal.find("input:checkbox").uniform();
            globalSearchConfigs.$editModalContent.trigger("mouseover");
        });
    },
    initDataTable: function () {
        globalSearchConfigs.customer.$table = globalSearchConfigs.customer.$datatable.DataTable({
            ajax: {
                url: globalSearchConfigs.customer.urls.getList,
                type: "POST"
            },
            "lengthChange": false,
            "searching": false,
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.search.value = globalSearchConfigs.keyword;
            },
            "aaSorting": [[1, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${globalSearchConfigs.customer.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Customer")}><i class="fa fa-edit"></i></a></div>`;
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
                    "render": function (data) {
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
                            index++;
                            var a = `<a class='contact-item' style="font-size: 12px;" href="javascript:void(0);" alt="${item.fullName}" data-id="${item.id}" onclick="globalSearchFunctions.editContact(this);">${index + '. <span>' + item.fullName}</span></a><br/>`;
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
            "initComplete": function () {
                globalSearchFunctions.initComplete(globalSearchConfigs.customer);
            }
        });
        globalSearchConfigs.supplier.$table = globalSearchConfigs.supplier.$datatable.DataTable({
            ajax: {
                url: globalSearchConfigs.supplier.urls.getList,
                type: "POST"
            },
            "lengthChange": false,
            "searching": false,
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.search.value = globalSearchConfigs.keyword;
            },
            "aaSorting": [[1, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${globalSearchConfigs.supplier.urls.edit}/${data.id}" class="btn btn-xs btn-primary"><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
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
                            var a = `<a class='contact-item' style="font-size: 12px;" href="javascript:void(0);" alt="${item.fullName}" data-id="${item.id}" onclick="globalSearchFunctions.editContact(this);">${index + '. <span>' + item.fullName}</span></a><br/>`;
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
            "initComplete": function () {
                globalSearchFunctions.initComplete(globalSearchConfigs.supplier);
            }
        });
        globalSearchConfigs.employee.$table = globalSearchConfigs.employee.$datatable.DataTable({
            ajax: {
                url: globalSearchConfigs.employee.urls.getList,
                type: "POST"
            },
            "lengthChange": false,
            "searching": false,
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.search.value = globalSearchConfigs.keyword;
            },
            "aaSorting": [[2, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${globalSearchConfigs.employee.urls.edit}/${data.id}" class ="btn btn-xs btn-primary" ${tooltipHelper.edit("Employee")}><i class ="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
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
                    "mData": "status",
                    "render": function (data) {
                        return getUserStatus(data);
                    }
                }
            ],
            "initComplete": function () {
                globalSearchFunctions.initComplete(globalSearchConfigs.employee);
            }
        });
        globalSearchConfigs.contact.$table = globalSearchConfigs.contact.$datatable.DataTable({
            ajax: {
                url: globalSearchConfigs.contact.urls.getList,
                type: "POST"
            },
            "lengthChange": false,
            "searching": false,
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.search.value = globalSearchConfigs.keyword;
            },
            "aaSorting": [[1, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a class='btn btn-xs btn-primary' data-id="${data.id}" onclick="globalSearchFunctions.editContact(this);" href="javascript:void(0);"><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "sClass": "text-center",
                    "mData": "contactType",
                    "bSearchable": false
                },
                {
                    "sClass": "text-center",
                    "mData": "fullName",
                    "render": function (data, display, obj) {
                        return `<div class='contact-item' data-id="${obj.id}"><span>${data}</span></div>`;
                    }
                },
                {
                    "sClass": "text-center",
                    "mData": "type",
                    "bSearchable": false
                },
                {
                    "sClass": "text-center",
                    "mData": "email",
                    "render": function (data) {
                        if (data == null) return "";
                        return `<a href="mailto:${data}?Subject=">${data}</a>`;
                    }
                },
                {
                    "sClass": "text-center",
                    "mData": "contactNumber",
                    "render": function (data) {
                        return formatPhoneNumber(data);
                    },
                    "bSearchable": false
                },
                {
                    "sClass": "text-center",
                    "mData": "department",
                    "bSearchable": false
                },
                {
                    "sClass": "text-center",
                    "mData": "jobTitle",
                    "bSearchable": false
                },
            ],
            "initComplete": function () {
                //globalSearchFunctions.initComplete(globalSearchConfigs.contact);
            }
        });
        globalSearchConfigs.shift.$table = globalSearchConfigs.shift.$datatable.DataTable({
            ajax: {
                url: globalSearchConfigs.shift.urls.getList,
                type: "POST"
            },
            "lengthChange": false,
            "searching": false,
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.search.value = globalSearchConfigs.keyword;
            },
            "aaSorting": [[1, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${globalSearchConfigs.shift.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Shift")}><i class="fa fa-edit"></i></a></div>`;
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
                    },
                    "bSearchable": false
                },
                {
                    "mData": "finishDateTime",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateTimeFormat);
                        return "";
                    },
                    "bSearchable": false
                },
                {
                    "mData": "jobReferenceNumber",
                    "bSearchable": true
                },
                {
                    "mData": "customer",
                    "bSearchable": true,
                },
                {
                    "mData": "city",
                    "bSearchable": true
                },
                {
                    "mData": "teamLeaderName",
                    "bSearchable": false
                },
                {
                    "mData": "teamMemberNames",
                    "bSortable": false,
                    "bSearchable": false
                },
                {
                    "mData": "shiftStatusName",
                    "render": function (data) {
                        return '<span class="label label-sm label-success"> ' + data + ' </span>';
                    },
                    "bSearchable": false
                }
            ],
            "initComplete": function () {
                globalSearchFunctions.initComplete(globalSearchConfigs.shift);
            }
        });
        globalSearchConfigs.ownedPlantEquipment.$table = globalSearchConfigs.ownedPlantEquipment.$datatable.DataTable({
            ajax: {
                url: globalSearchConfigs.ownedPlantEquipment.urls.getList,
                type: "POST"
            },
            "lengthChange": false,
            "searching": false,
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.search.value = globalSearchConfigs.keyword;
            },
            "aaSorting": [[1, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${globalSearchConfigs.ownedPlantEquipment.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Owned Plant & Equipment")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "mData": "name",
                    "sClass": "text-center name-column",
                },
                {
                    "mData": "makeName",
                    "sClass": "text-center make-name-column",
                },
                {
                    "mData": "modelName",
                    "sClass": "text-center model-name-column",
                },
                {
                    "mData": "year",
                    "sClass": "text-center year-column",
                },
                {
                    "mData": "registrationNumber",
                    "sClass": "text-center registration-number-column",
                },
                {
                    "mData": "registrationExpiryDate",
                    "sClass": "text-center date-column",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": "calibrationExpiryDate",
                    "sClass": "text-center date-column",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": "testAndTagExpiryDate",
                    "sClass": "text-center date-column",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": "status",
                    "sClass": "text-center status-column",
                    "render": function (data) {
                        return getOPEStatus(data);
                    }
                },
            ],
            "initComplete": function () {
                globalSearchFunctions.initComplete(globalSearchConfigs.ownedPlantEquipment);
            }
        });
        globalSearchConfigs.hiredPlantEquipment.$table = globalSearchConfigs.hiredPlantEquipment.$datatable.DataTable({
            ajax: {
                url: globalSearchConfigs.hiredPlantEquipment.urls.getList,
                type: "POST"
            },
            "lengthChange": false,
            "searching": false,
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.search.value = globalSearchConfigs.keyword;
            },
            "aaSorting": [[1, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${globalSearchConfigs.hiredPlantEquipment.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Hired Plant & Equipment")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "sClass": "text-center",
                    "mData": "name"
                },
                {
                    "sClass": "text-center",
                    "mData": "supplierName"
                },
                {
                    "sClass": "text-center",
                    "mData": "description"
                },
            ],
            "initComplete": function () {
                globalSearchFunctions.initComplete(globalSearchConfigs.hiredPlantEquipment);
            }
        });
        globalSearchConfigs.vehicle.$table = globalSearchConfigs.vehicle.$datatable.DataTable({
            ajax: {
                url: globalSearchConfigs.vehicle.urls.getList,
                type: "POST"
            },
            "lengthChange": false,
            "searching": false,
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.search.value = globalSearchConfigs.keyword;
            },
            "aaSorting": [[2, 'desc']],
            "aoColumns": [
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="${globalSearchConfigs.vehicle.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.edit("Vehicle")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "mData": "name",
                    "sClass": "text-center name-column",
                },
                {
                    "mData": "makeName",
                    "sClass": "text-center make-column",
                },
                {
                    "mData": "modelName",
                    "sClass": "text-center model-column",
                },
                {
                    "mData": "year",
                    "sClass": "text-center year-column",
                },
                {
                    "mData": "vehicleType",
                    "sClass": "text-center vehicle-column"
                },
                {
                    "mData": "fuelTypeName",
                    "sClass": "text-center fuel-type-column",
                    "bSortable": false,
                    "bSearchable": false,
                },
                {
                    "mData": "registrationNumber",
                    "sClass": "text-center registration-number-column",
                    "bSortable": false,
                    "bSearchable": false,
                },
                {
                    "mData": "registrationExpiryDate",
                    "sClass": "text-center date-column",
                    "render": function (data) {
                        if (data)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center fuel-type-column",
                    "render": function (data) {
                        return data.transmissionName;
                    }
                },
                {
                    "mData": "status",
                    "sClass": "text-center status-column",
                    "render": function (data) {
                        return getVehicleStatus(data);
                    }
                },
            ],
            "initComplete": function () {
                globalSearchFunctions.initComplete(globalSearchConfigs.vehicle);
            }
        });
    },
    initComplete: function (table) {
        var total = table.$table.data().length;
        var uiElement = table.$totalRecords;
        if (total > 1) {
            uiElement.html(` - ${total} results`);
            hideAjaxLoadingMask();
            table.$section.insertBefore("#flag");
            table.$notFound.hide();
        } else if (total === 1) {
            uiElement.html(" - 1 result");
            table.$section.insertBefore("#flag");
            table.$notFound.hide();
        } else {
            table.$section.find(".dataTables_wrapper").hide();
        }
        table.$section.show();
        hideAjaxLoadingMask();
    }
}
