var configs = {     
    $btnSave: $("#btnSave"),
    $btnSaveAndClose: $("#btnSaveAndClose"),
    formId: "add_employeeleave",
    indexUrl: null,
    saveUrl: apiUrl.employeeleave.add,
    editUrl: apiUrl.employeeleave.edit,
    employeeId: 0, // need set value
};

var funcs = {
    Save: function () {
        funcs.SubmitAjaxForm(configs.saveUrl, configs.formId, "");

    },
    SubmitAjaxForm: function(url, formId, replaceText) {
        const $form = $(`#${formId}`);

        if ($form != null && $form.valid()) {
            clearSummaryValidation($form);

            let formData = JSON.stringify($form.serializeObjectX());
            if (replaceText !== "") {
                formData = replaceAll(formData, replaceText + ".", "");
            }
            $.ajax({
                type: "POST",
                url: url,
                data: formData,
                dataType: "json",
                contentType: "application/json",
                success: function (response) {
                    window.location.href = configs.editUrl + "/" + response.id;
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
        return false;
    },
    SaveAndClose: function (obj) {
        submitAjaxForm(configs.saveUrl, configs.formId, '', redirectToUrl, [$(obj).data('url')]);
    },
    WireEvents: function () {
        configs.$btnSave.on("click", function () {
            funcs.Save();
        });

        configs.$btnSaveAndClose.on("click", function () {
            funcs.SaveAndClose(this);
        });
    },
}

