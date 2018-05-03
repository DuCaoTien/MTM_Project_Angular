var plantEquipmentConfigs = {
    $table: null,
    tableId: "#plantEquipmentDatatable",
    $editModal: $("#EditPlantEquipmentModal"),
    $editModalContent: $("#EditPlantEquipmentModalContent"),
    $datatable: $("#plantEquipmentDatatable"),
    firstLoad: true,
    urls: {
        getList: apiUrl.storage.getPlantEquipmentList,
        delete: apiUrl.storage.deletePlantEquipmentStorage,
        getPlantEquipment: apiUrl.plantEquipment.quickSearch
    },
    action: {
        btnEdit: "btnEdit",
    },
    moduleName: "plant & equipment",
    selected: [],
    element: {
        btn: {
            btnDeleteId: "#btnDelete",
            txtSearchId: "#PlantEquipmentId"
        },
        ladda: {
            laddaDeleteBtn: Ladda.create(document.querySelector("#btnDelete"))
        }
    },
};

var plantEquipmentFunctions = {
    reloadDatatableAndResetForm: function (modalId, formId) {
        plantEquipmentConfigs.$table.DataTable().ajax.reload(null, false);
        if ($('#' + modalId).length > 0)
            $('#' + modalId).modal('hide');
        $('#' + formId)[0].reset();
        $('#PlantEquipmentId').val('');
        $('#PlantEquipmentId').trigger("change");;
        $('#' + formId + ' .select2').trigger("change");;
    },
    initPage: function () {
        if (plantEquipmentConfigs.firstLoad === false) return;

        datatableUtils.configs = plantEquipmentConfigs;

        plantEquipmentFunctions.initEvents();
        plantEquipmentFunctions.initDatatable();

        plantEquipmentConfigs.firstLoad = false;
    },
    initEvents: function () {
        $(document).delegate(`.${plantEquipmentConfigs.action.btnEdit}`, "click", function () {
            const plantEquipmentStorageId = $(this).data("id");
            const plantEquipmentId = $(this).data("plantEquipmentId");
            plantEquipmentConfigs.$editModalContent.load(`${apiUrl.plantEquipment.editPartial}?id=${plantEquipmentId}&plantEquipmentStorageId=${plantEquipmentStorageId}`, function() {
                resetFormValidator('edit_plant_equipment_form');
                $("#edit_plant_equipment_form .select2").select2({
                    placeholder: "Select an option",
                });
                plantEquipmentConfigs.$editModal.modal("show");
            });
        });

        $(plantEquipmentConfigs.element.btn.txtSearchId).select2({
            placeholder: "Input at least 1 character to search",
            minimumInputLength: 1,
            ajax: {
                url: plantEquipmentConfigs.urls.getPlantEquipment,
                data: function (params) {
                    return {
                        term: params.term, // search term
                        storageId: $('#StorageId').val()
                    };
                },
                dataType: "json",
                type: "GET",
                delay: 250,
                quietMillis: 100,
                processResults: function (data) {
                    return {
                        results: data
                    };
                },
                cache: true
            }
        });

        $(plantEquipmentConfigs.element.btn.btnDeleteId).on("click", function () {
            plantEquipmentFunctions.delete();
        });
    },
    initDatatable: function () {
        plantEquipmentConfigs.$table = plantEquipmentConfigs.$datatable.dataTable({
            ajax: {
                url: plantEquipmentConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = customFilterStorageParam;
            },
            "aaSorting": [[5, "desc"]],
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
                        return '<div class="checker">' +
                            '<span>' +
                            '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' + data.id + '">' +
                            '</span>' +
                            '</div>';
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function (data) {
                        return `<div><a href="javascript:void(0);" data-id="${data.id}" data-plant-equipment-id="${data.plantEquipmentId}" class="btn btn-xs btn-primary ${plantEquipmentConfigs.action.btnEdit}" ${tooltipHelper.edit("Plant & Equipment")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "plantEquipmentName"
                },
                {
                    "mData": "sizeName"
                },
                {
                     "mData": "classTypeName"
                 },
                {
                      "mData": "quantity"
                  },
                {
                    "mData": "createdOnUtc",
                    "render": function (data) {
                        return getLocalFromUtc(data);
                    }
                }
            ],
            "initComplete": function (settings, json) {

            },
            "fnDrawCallback": function (settings) {
                // datatable set cursor is pointer
                plantEquipmentConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                datatableUtils.initEvents(settings);
            }
        });
    },

    delete: function () {
        var actionName = "Delete";
        if (!datatableUtils.validateSelected(plantEquipmentConfigs.moduleName)) {
            return;
        }
        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} ${plantEquipmentConfigs.moduleName}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                plantEquipmentConfigs.element.ladda.laddaDeleteBtn.start();
                App.blockUI({
                    target: plantEquipmentConfigs.tableId
                });
                $.ajax({
                    url: plantEquipmentConfigs.urls.delete + "?storageId=" + $("#Id").val(),
                    type: 'POST',
                    data: {
                        "": datatableUtils.configs.selected
                    },
                    success: function (result) {
                        toastr["success"](`${actionName} ${plantEquipmentConfigs.moduleName}(s) successful`);
                        datatableUtils.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} ${plantEquipmentConfigs.moduleName}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        datatableUtils.configs.selected = [];
                        plantEquipmentConfigs.element.ladda.laddaDeleteBtn.stop();
                        App.unblockUI(plantEquipmentConfigs.tableId);
                        reloadDatatable(plantEquipmentConfigs.$table);
                    }
                });
            }
        });
    }
}