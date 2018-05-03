function ShiftForm(parentSelector) {
    const $this = this;
    $this.parentSelector = parentSelector;

    function findElement(selector) {
        if (!$this.parentSelector) return $(selector);
        return $(`${$this.parentSelector} ${selector}`);
    }

    function findFormElement(selector) {
        if (!$this.parentSelector) return $(selector);
        return $(`${$this.parentSelector}AddFormModal ${selector}`);
    }

    $this.configs = {
        moduleName: "Interactive Document",
        selected: [],
        data: [],
        formInfo: [],
        formMandatory: [],
        $table: null,
        $formSelectList: findFormElement("#formId"),
        $datatable: findElement("#formDatatable"),
        $formIds: findElement("#FormIds"),
        urls: {
            getMandatoryForm: apiUrl.shift.getMandatoryForm,
            getAvailableForm: apiUrl.shift.getAvailableForm,
            view: apiUrl.form.view,
        },
        element: {
            btn: {
                $btnDelete: findElement("#btnDeleteForm"),
                $btnAddForm: findFormElement("#btnAddForm")
            }
        },
        initial: false
    };

    const local = {
        datatableUtils: new DatatableUtil()
    }

    $this.funcs = {
        reset: function() {
            $this.configs.data = [];
            $this.configs.formInfo = [];
            $this.configs.selected = [];

            if ($this.configs.$table) return;
            $this.funcs.initDatatable();
            $this.configs.$table.dataTable().fnClearTable();
        },
        initPage: function (confs) {
            if (confs != null) {
                $this.configs = Object.assign({}, $this.configs, confs);
            }

            local.datatableUtils.configs = $this.configs;

            $this.funcs.initFormSelectList();
            $this.funcs.initFormMandatoryList();

            if ($this.configs.$table){
                $this.configs.$table.dataTable().fnClearTable();
                if ($this.configs.data.length > 0)
                    $this.configs.$table.dataTable().fnAddData($this.configs.data);

            } else {
                $this.funcs.initDatatable();
            }
            
            $this.funcs.initEvents();

            $this.configs.initial = true;
        },

        reloadLocalDataTable: function () {
            $this.configs.$table.dataTable().fnClearTable();
            if ($this.configs.data.length > 0)
                $this.configs.$table.dataTable().fnAddData($this.configs.data);
        },

        initDatatable: function () {
            //if ($this.configs.$table) return;

            $this.configs.$table = $this.configs.$datatable.dataTable({
                data: $this.configs.data,
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
                            return data.isRequired == false ? '<div class="checker">' +
                                '<span>' +
                                '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' + data.id + '">' +
                                '</span>' +
                                '</div>' : "";
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "bSearchable": false,
                        "sClass": "text-center",
                        "render": function (data) {
                            return `<div><a target="_blank" href="${$this.configs.urls.view}/${data.id}" class="btn btn-xs btn-primary" ${tooltipHelper.details("form")}><i class="fa fa-search"></i></a></div>`;
                        }
                    },
                    {
                        "mData": "name",
                        "sWidth": "200px",
                    },
                    {
                        "mData": "description",
                        "sWidth": "200px",
                    },
                    {
                        "mData": "isPortrait",
                        "render": function (data) {
                            return `<span class="label label-sm label-${(data == true ? "success" : "danger")}"> ${(data == true ? "Portrait" : "Landscape")} </span>`;
                        }
                    },
                    {
                        "mData": "totalPages"
                    },
                    {
                        "mData": "createdOnUtc",
                        "render": function (data) {
                            return getLocalFromUtc(data);
                        }
                    }
                ],
                "fnDrawCallback": function (settings) {
                    // datatable set cursor is pointer
                    $this.configs.$datatable.find('tbody tr').each(function () {
                        $(this).css("cursor", "pointer");
                        $(this).attr("role", "row");
                    });

                    local.datatableUtils.funcs.initEvents(settings);
                }
            });
        },
        initFormSelectList: function () {
            var formIds = [];
            var formIdsStr = "";

            if ($this.configs.data != null && $this.configs.data.length > 0) {
                for (var i = 0; i < $this.configs.data.length; i++) {
                    formIds.push($this.configs.data[i].id);
                    formIdsStr += $this.configs.data[i].id + ",";
                }
            }

            if (formIdsStr != "") {
                formIdsStr = formIdsStr.substr(0, formIdsStr.length - 1);
            } else {
                formIdsStr = "0";
            }

            $this.configs.$formIds.val(formIds);

            $.ajax({
                url: $this.configs.urls.getAvailableForm + "?formIds=" + formIdsStr,
                type: "POST",
                data: {},
                success: function (data) {
                    $this.configs.$formSelectList.empty();
                    if (data != null) {
                        $this.configs.formInfo = data;
                        for (var i = 0; i < data.length; i++) {
                            $this.configs.$formSelectList.append(`<option value="${data[i].id}">${data[i].name}</option>`);
                        }
                    }
                }
            });
        },
        initFormMandatoryList: function(){
            $.ajax({
                url: $this.configs.urls.getMandatoryForm,
                type: "POST",
                async: false,
                data: {},
                success: function (data) {
                    if (data != null) {
                        $this.configs.formMandatory = data;
                        for (var i = 0; i < data.length; i++) {
                            var formId = data[i].id;
                            let index = $this.funcs.getIndexById(formId, $this.configs.data);

                            if (index == -1) {
                                var formInfo = data[i];
                                formInfo.createdOnUtc = new Date();
                                $this.configs.data.push(formInfo);
                            }
                        }
                    }
                }
            });
        },
        initEvents: function () {
            $this.configs.element.btn.$btnDelete.on("click", function () {
                $this.funcs.delete();
            });

            $this.configs.element.btn.$btnAddForm.on("click", function () {
                $this.funcs.addForm();
            });
        },
        addForm: function () {
            var formId = $this.configs.$formSelectList.val();
            if (formId > 0) {
                let index = $this.funcs.getIndexById(formId, $this.configs.data);
                if (index == -1) {
                    var formInfo = $this.funcs.getFormInfoById(formId);
                    formInfo.createdOnUtc = new Date();
                    $this.configs.data.push(formInfo);
                    $this.funcs.reloadLocalDataTable();
                }
                $this.funcs.initFormSelectList();
                $(`${$this.parentSelector}AddFormModal`).modal("hide");
            }
        },
        delete: function () {
            if (!local.datatableUtils.funcs.validateSelected($this.configs.moduleName)) {
                return;
            }
            swal({
                title: "",
                text: "Delete Interactive Document(s)",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Confirm",
                cancelButtonText: "Cancel",
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    var array = $this.configs.data;
                    for (var i = 0; i < $this.configs.selected.length; i++) {
                        let index = $this.funcs.getIndexById($this.configs.selected[i], array);
                        if (index > -1) {
                            array.splice(index, 1);
                        }
                    }
                    $this.configs.data = array;
                    $this.configs.selected = [];
                    $this.funcs.reloadLocalDataTable();
                    $this.funcs.initFormSelectList();
                }
            });
        },
        getIndexById: function (id, array) {
            if (array != null && array.length > 0) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i].id == id)
                        return i;
                }
            }
            return -1;
        },
        getFormInfoById: function (id) {
            if ($this.configs.formInfo != null && $this.configs.formInfo.length > 0) {
                for (var i = 0; i < $this.configs.formInfo.length; i++) {
                    if ($this.configs.formInfo[i].id == id)
                        return $this.configs.formInfo[i];
                }
            }
            return null;
        }
    };
}

var formConfigs = {
    shiftId : 0,
    moduleName: "Interactive Document",
    selected: [],
    $table: null,
    tableId: "#formDatatable",
    $datatable: $("#formDatatable"),
    $formSelectList: $("#formId"),
    element: {
        btn: {
            btnDeleteId: "#btnDeleteForm",
            btnAddFormId: "#btnAddForm"
        },
    }
};
var formFunctions = {
    initPage: function (confs) {
        if (confs != null) {
            formConfigs = Object.assign({}, formConfigs, confs);
        }

        formFunctions.initDatatable();
        formFunctions.initFormSelectList();
        formFunctions.initEvents();
    },

    initDatatable: function () {
        if (formConfigs.$table) return;
        formConfigs.$table = formConfigs.$datatable.dataTable({
            ajax: {
                url: formConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
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
                        return `<div><a target="_blank" href="${formConfigs.urls.view}/${data.id}" class="btn btn-xs btn-primary" data-toggle="tooltip" data-placement="top" title="View"><i class="fa fa-search"></i></a></div>`;
                    }
                },
                {
                    "mData": "name",
                    "sWidth": "200px"
                },
                {
                    "mData": "description",
                },
                {
                    "mData": "isPortrait",
                    "render": function (data) {
                        return `<span class="label label-sm label-${(data == true ? "success" : "danger")}"> ${(data == true ? "Portrait" : "Landscape")} </span>`;
                    }
                },
                {
                    "mData": "totalPages"
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
                formConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                datatableUtils.initEvents(settings, formConfigs);
            }
        });
    },

    initFormSelectList: function() {
        $.ajax({
            url: formConfigs.urls.getFormSelectList,
            type:"GET",
            success : function(data) {
                formConfigs.$formSelectList.empty();
                if (data != null) {
                    for (var i = 0; i < data.length;  i++) {
                        formConfigs.$formSelectList.append(`<option value="${data[i].id}">${data[i].text}</option>`);
                    }    
                }
            }
        });
    },
    initEvents: function () {
        $(formConfigs.element.btn.btnDeleteId).on("click", function () {
            formFunctions.delete();
        });
        $(formConfigs.element.btn.btnAddFormId).on("click", function () {
            formFunctions.addForm();
        });
    },
    addForm :function() {
        var formId = formConfigs.$formSelectList.val();
        if (formId > 0) {
            $.ajax({
                type: "POST",
                url: formConfigs.urls.addForm,
                data: {
                    "formId": formId,
                    "id": formConfigs.shiftId
                },
                success: function (response) {
                    showAjaxSuccessMessage(response);
                    formFunctions.initFormSelectList();
                    formConfigs.$datatable.DataTable().ajax.reload(null, false);
                    $('#addFormModal').modal('hide');
                },
                error: function (response) {
                    if (typeof (response.responseJSON) !== 'undefined') {
                        showAjaxFailureMessage(response.responseJSON);
                    }
                    else {
                        var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                        showAjaxFailureMessage(text);
                    }
                },
                beforeSend: function () {
                    showAjaxLoadingMask();
                },
                complete: function () {
                    hideAjaxLoadingMask();
                }
            });
        }
    },
    delete: function () {
        if (!datatableUtils.validateSelected(formConfigs.moduleName, formConfigs)) {
            return;
        }
        swal({
            title: "",
            text: "Delete Interactive Document(s)",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                $.ajax({
                    url: formConfigs.urls.delete,
                    type: 'POST',
                    data: {
                        "shiftformIds": formConfigs.selected
                    },
                    success: function (result) {
                        formFunctions.initFormSelectList();
                        toastr["success"]('Interactive Document(s) deleted sucessfully');
                        datatableUtils.unCheckBulkCheck();
                    },
                    complete: function (result) {
                        formConfigs.selected = [];
                        reloadDatatable(formConfigs.$table);
                        hideAjaxLoadingMask();
                    },
                    error: function (response) {
                        if (typeof (response.responseJSON) !== 'undefined') {
                            showAjaxFailureMessage(response.responseJSON);
                        }
                        else {
                            var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                            showAjaxFailureMessage(text);
                        }
                    },
                    beforeSend: function () {
                        showAjaxLoadingMask();
                    },
                });
            }
        });
    }
}

