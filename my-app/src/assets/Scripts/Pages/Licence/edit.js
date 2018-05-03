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
    saveUrl: apiUrl.licence.edit,
    deleteFileUrl: apiUrl.licence.deleteFile,
    getFileUrl: apiUrl.licence.getFiles,
    licenceId: 0, // need set licence id when use this file
    employeeId: 0, // need set value
    contactId: 0, // need set value
    supplierId: 0, // need set value
    licenceType: 0 // need set value
};

var funcs = {
    AddFilesToForm: function() {
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
        if (submitAjaxForm(configs.saveUrl, configs.formId, "")) {
            configs.fileDropzone.removeAllFiles();
            setTimeout(function() {
                dropzoneCommon.getExistsFileFromServer(configs.getFileUrl + "?id=" + configs.licenceId);
            }, 100);
        }
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
        dropzoneCommon.getExistsFileFromServer(configs.getFileUrl + "?id=" + configs.licenceId);
    },
    WireEvents: function() {
        configs.$btnSave.on("click", function () {
            funcs.Save();
        });

        configs.$btnSaveAndClose.on("click", function () {
            funcs.SaveAndClose(this);
        });
    },
    InitLicenceTypeEvent: function () {
        configs.currentExpiryDate = $("#LicenceExpiry").val();

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
    }
}

