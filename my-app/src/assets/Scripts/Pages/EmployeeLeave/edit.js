var configs = {
    $btnSave: $("#btnSave"),
    $btnSaveAndClose: $("#btnSaveAndClose"),
    formId: "edit_employeeleave",
    indexUrl: null,
    saveUrl: apiUrl.employeeleave.edit,
    leaveId: 0, // need set leave id when use this file
    employeeId: 0 // need set value
};

var funcs = {
    Save: function () {
        if (submitAjaxForm(configs.saveUrl, configs.formId, "")) {
        }
    },
    SaveAndClose: function (obj) {
        submitAjaxForm(configs.saveUrl, configs.formId, '', redirectToUrl, [$(obj).data('url')]);
    },
    WireEvents: function() {
        configs.$btnSave.on("click", function () {
            funcs.Save();
        });

        configs.$btnSaveAndClose.on("click", function () {
            funcs.SaveAndClose(this);
        });
    }
}

