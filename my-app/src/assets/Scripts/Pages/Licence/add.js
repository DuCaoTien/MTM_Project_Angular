var configs = {     
    fileUploadId: "file-dropzone",
    $txtFilesId: $("#Files"),
    $licenceType: $("#LicenceNameId"),
    licenceTypes: [],
    currentExpiryDate: "",
    $btnSave: $("#btnSave"),
    $btnSaveAndClose: $("#btnSaveAndClose"),
    formId: "add_licence",
    indexUrl: null,
    saveUrl: apiUrl.licence.add,
    editUrl: apiUrl.licence.edit,
    deleteFileUrl: apiUrl.licence.deleteFile,
    employeeId: 0, // need set value
    contactId: 0, // need set value
    supplierId: 0, // need set value
    licenceType: 0 // need set value
};

var funcs = {
    AddFilesToForm: function () {
        if (configs.saveUrl == null || configs.saveUrl === "") {
            return;
        }

        const files = configs.fileDropzone.getAcceptedFiles();
        const jsonFiles = JSON.stringify(files);
        configs.$txtFilesId.val(jsonFiles);
    },
    Save: function () {
        funcs.AddFilesToForm();
        if (configs.$txtFilesId.val().length === 0) {
            toastr.error("The files is required", notifyResult.title);
            return;
        }
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
                    window.location.href = configs.editUrl + "/" + response.id + "?type=" + response.type;
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
        funcs.AddFilesToForm();
        if (configs.$txtFilesId.val().length === 0) {
            toastr.error("The files is required", notifyResult.title);
            return;
        }
        submitAjaxForm(configs.saveUrl, configs.formId, '', redirectToUrl, [$(obj).data('url')]);
    },
    FileInit: function () {
        configs.fileDropzone = dropzoneCommon.init(configs.fileUploadId, configs.deleteFileUrl);
    },
    WireEvents: function () {
        configs.$btnSave.on("click", function () {
            funcs.Save();
        });

        configs.$btnSaveAndClose.on("click", function () {
            funcs.SaveAndClose(this);
        });
    },
    InitLicenceTypeEvent: function() {
        configs.$licenceType.on("change", function() {
            funcs.SetupExpiryDate();
        });
    },
    AddLicenceType: function(id, name, isRequired){
        configs.licenceTypes.push({
            'id': id,
            'name': name,
            'isRequired': isRequired
        });
    },
    SetupExpiryDate: function(){
        var licenceType = configs.$licenceType.val();

        var licence = (configs.licenceTypes || []).find(function(item){
            return item.id == licenceType;
        });

        if (licence != null && licence.isRequired == "true"){
            $("#expiry-required").css({ "display": "block"});
            $("#expiry-not-required").css({ "display": "none"});

            $("#LicenceExpiry").off("keyup change");
            $("#LicenceExpiryNotRequired").off("keyup change");

            $("#LicenceExpiry").val(configs.currentExpiryDate);
            
            $("#LicenceExpiry").on("keyup change", function(){
                configs.currentExpiryDate = $(this).val();
            });
        } else {
            $("#expiry-not-required").css({ "display": "block"});
            $("#expiry-required").css({ "display": "none"});

            $("#LicenceExpiry").off("keyup change");
            $("#LicenceExpiryNotRequired").off("keyup change");

            $("#LicenceExpiry").val("1/1/1800");
            $("#LicenceExpiryNotRequired").val(configs.currentExpiryDate);
            
            $("#LicenceExpiryNotRequired").on("keyup change", function(){
                configs.currentExpiryDate = $(this).val();
            });
        }
    },
    AddNewConfig: function(config){
        console.log(config);

        funcs.AddLicenceType(config.id, config.configType, config.additionValue);
    }
}

