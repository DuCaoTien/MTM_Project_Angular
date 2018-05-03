var attachmentConfigs = {
    selected: [],
    tableId: "#attachmentDatatable",
    fileUploadId: "fileDropzone",
    $fileUpload: $("#fileDropzone"),
    $table: null,
    $txtFilesId: $("#addAttachmentSection #Files"),
    $datatable: $("#attachmentDatatable"),
    $addAttachmentSection: $("#addAttachmentSection"),
    $btnAddAttachment: $("#btnAddAttachment"),
    $btnDeleteAttachment: $("#btnDeleteAttachment"),
    $btnCancel: $("#btnCancel"),
    $expiryDate: $("#ExpiryDate"),
    $allowToEdit: $("#AllowToEdit"),
    $allowToView: $("#AllowToView"),
    $willExpireLabel: $("#willExpireLabel"),
    $willExpireAgainLabel: $("#willExpireAgainLabel"),
    laddaDeleteAttachment: document.querySelector("#btnDeleteAttachment") != null ? Ladda.create(document.querySelector("#btnDeleteAttachment")) : null,
    urls: {
        getList: apiUrl.attachment.getDocumentList,
        upload: apiUrl.attachment.uploadDocument,
        delete: apiUrl.attachment.deleteDocument,
        download: apiUrl.attachment.downloadDocument,
        getAttachment: apiUrl.attachment.getAttachment,
        getExpireWithinMonths: apiUrl.configurations.getSupplierAttachmentExpireWithinMonths,
        editFileTitle: apiUrl.attachment.editFileTitle,
        updateEditView:  apiUrl.attachment.updateEditView
    },
    editItemClass: "editItem",
    removeItemClass: "removeItem",
    attachmentType: "",
    firstLoad: true,
    enableExpiryDate: false,
    enableShiftAttachmentMode: false,
    actionUrl: "",
    $cancel: $("#cancel"),
    $editFileModal: $('#EditFileModal')
};

var attachmentLocalConfigs = {
    datatableUtils: new DatatableUtil(attachmentConfigs)
}

var attachmentFunctions = {

    initPage: function (employeeId) {
        attachmentConfigs.actionUrl = attachmentConfigs.$fileUpload.attr("action");
        if (attachmentConfigs.firstLoad === false) return;
        if (attachmentConfigs.enableExpiryDate) {
            attachmentFunctions.getExpireWitinMonth();
        }
        attachmentFunctions.initEvents();
        attachmentFunctions.initDatatable(employeeId);
        dropzoneConfigs.fileDropzone = dropzoneCommon.init(attachmentConfigs.fileUploadId);
        attachmentConfigs.firstLoad = false;
    },

    initEvents: function () {
        attachmentConfigs.$btnAddAttachment.on("click", function () {
            attachmentFunctions.showFormAttachment();
        });

        attachmentConfigs.$btnDeleteAttachment.on("click", function () {
            attachmentFunctions.deleteAttachments();
        });

        attachmentConfigs.$btnCancel.on("click", function () {
            attachmentFunctions.hideFormAttachment();
        });

        // Init edit file title event
        $(document).delegate(`.${attachmentConfigs.editItemClass}`, "click", function () {
            const itemId = $(this).data("id");
            const fileTitle = $(this).data("filetitle");
            attachmentFunctions.editFile(itemId, fileTitle);
        });

        $(document).delegate(`.${attachmentConfigs.removeItemClass}`, "click", function () {
            const itemId = $(this).data("id");
            const itemExtension = $(this).data("extension");
            attachmentFunctions.downloadAttachment(itemId, itemExtension);
        });

        attachmentConfigs.$cancel.on("click", function () {
            attachmentFunctions.hideFormAttachment();
        });

        // Trigger changed date event incase have the expire time
        if (attachmentConfigs.enableExpiryDate) {

            attachmentConfigs.$expiryDate
                .datepicker()
                .on("changeDate", attachmentFunctions.expiryDateChanged)
                .on("clearDate", attachmentFunctions.expiryDateCleared);
        }
    },

    initDatatable: function (customParam) {
        if (attachmentConfigs.$table != null) return;

        attachmentConfigs.$table = attachmentConfigs.$datatable.dataTable({
            ajax: {
                url: attachmentConfigs.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "fnServerParams": function (aoData) {
                aoData.customParams = customParam;
            },
            "aaSorting": attachmentFunctions.getSorting(),
            "aoColumns": attachmentFunctions.getColumns(),
            "initComplete": function (settings, json) {
                attachmentFunctions.customFilter();
            },
            "fnDrawCallback": function (settings) {
                attachmentLocalConfigs.datatableUtils.funcs.initEvents(settings);

                attachmentConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                $(".lblallowedit").on("click",
                    function() {
                        var request = {
                            id: $(this).attr("data-id"),
                            allowToEdit: $(this).attr("data-allow-edit") == "true" ? "false" : "true"
                        };

                        $.ajax({
                            url: attachmentConfigs.urls.updateEditView,
                            type: 'POST',
                            data: request,
                            success: function (result) {
                                toastr["success"](`Update ${attachmentConfigs.attachmentType}(s) successful`);
                                attachmentLocalConfigs.datatableUtils.funcs.unCheckBulkCheck();
                            },
                            error: function (result) {
                                console.log("error: " + result);
                                toastr["error"](`Update ${attachmentConfigs.attachmentType}(s) fail, please try again`);
                            },
                            complete: function (result) {
                                attachmentConfigs.selected = [];
                                attachmentConfigs.laddaDeleteAttachment.stop();
                                App.unblockUI(attachmentConfigs.tableId);
                                reloadDatatable(attachmentConfigs.$table);
                            }
                        });
                    }
                );

                $(".lblallowview").on("click",
                    function() {
                        var request = {
                            id: $(this).attr("data-id"),
                            allowToView: $(this).attr("data-allow-view") == "true" ? "false" : "true"
                        };

                        $.ajax({
                            url: attachmentConfigs.urls.updateEditView,
                            type: 'POST',
                            data: request,
                            success: function (result) {
								toastr["success"](`Update ${attachmentConfigs.attachmentType}(s) successful`);                                attachmentLocalConfigs.datatableUtils.funcs.unCheckBulkCheck();
                            },
                            error: function (result) {
                                console.log("error: " + result);
                                toastr["error"](`Update ${attachmentConfigs.attachmentType}(s) fail, please try again`);
                            },
                            complete: function (result) {
                                attachmentConfigs.selected = [];
                                attachmentConfigs.laddaDeleteAttachment.stop();
                                App.unblockUI(attachmentConfigs.tableId);
                                reloadDatatable(attachmentConfigs.$table);
                            }
                        });
                    }
                );
            },
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                $('[data-toggle="tooltip"]').tooltip();
                if (attachmentConfigs.enableExpiryDate) {
                    if (aData.expired === true) $(nRow).addClass("danger");
                    else if (aData.willExpireAgain === true) $(nRow).addClass("info");
                    else if (aData.willExpire === true) $(nRow).addClass("warning");
                }
                return nRow;
            }
        });
    },

    showFormAttachment: function () {
        attachmentConfigs.$btnCancel.show();
        attachmentConfigs.$btnAddAttachment.hide();
        attachmentConfigs.$btnDeleteAttachment.hide();
        attachmentConfigs.$addAttachmentSection.show();
        attachmentConfigs.$expiryDate.val('');
        if (attachmentConfigs.$allowToEdit && attachmentConfigs.$allowToEdit.length > 0) {
            attachmentConfigs.$allowToEdit[0].checked = false;
            attachmentConfigs.$allowToView[0].checked = false;
            attachmentConfigs.$allowToEdit.closest('span').removeClass('checked');
            attachmentConfigs.$allowToView.closest('span').removeClass('checked');
        }
        $("#attachmentDatatable_wrapper").hide();
    },

    hideFormAttachment: function () {
        attachmentConfigs.$btnCancel.hide();
        attachmentConfigs.$btnAddAttachment.show();
        attachmentConfigs.$btnDeleteAttachment.show();
        attachmentConfigs.$addAttachmentSection.hide();
        dropzoneConfigs.fileDropzone.removeAllFiles(true);
        $("#attachmentDatatable_wrapper").show();
        reloadDatatable(attachmentConfigs.$table);
    },

    editFile: function (id, fileTitle) {
        var formId = 'edit_file_title_form';
        var $modal = attachmentConfigs.$editFileModal;
        var $id = $($modal.find('#Id'));
        var $fileTitle = $($modal.find('#FileTitle'));
        var $form = $($modal.find('#' + formId));

        $id.val(id);
        $fileTitle.val(fileTitle);
        
        resetFormValidator(formId);

        // Show modal
        $modal.modal('toggle');

        // Hide modal callback
        $modal.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
            $form.find('.field-validation-error span').html('');
            $form.find('.validation-summary-errors ul').html('');
        });

        // Save modal callback
        $modal.find('.btn-save').off('click').on('click', function (e) {
            var formData = {
                id: $id.val(),
                fileTitle: $fileTitle.val()
            };
            var successCallback = function (response) {
                showAjaxSuccessMessage(`File title has been updated successfully`);

                // Close modal
                $modal.modal('hide');
                reloadDatatable(attachmentConfigs.$table);
            };

            var errorCallback = function (response) {
                showAjaxFailureMessage(`Update file title fail, please try again!`);
            }

            if ($form != null && $form.valid()) {
                $.ajax({
                    type: "POST",
                    url: attachmentConfigs.urls.editFileTitle,
                    data: formData,
                    success: function (response) {
                        return successCallback(response);
                    },
                    error: function (response) {
                        errorCallback(response);
                    },
                    beforeSend: function () {
                        showAjaxLoadingMask();
                    },
                    complete: function () {
                        hideAjaxLoadingMask();
                    }
                });
            }
        })
    },

    downloadAttachment: function (id, extension) {
        extension = extension.replace(".", "").toLowerCase();

        var isViewOnly = isPdf(extension) || isImage(extension);

        if (isViewOnly) {
            var url = `${attachmentConfigs.urls.getAttachment}/${id}`;
            if (isPdf(extension)) {
                window.open(url);
            } else if (isImage(extension)) {
                window.open(url);
            }
        } else {
            attachmentFunctions.openInNewTab(`${attachmentConfigs.urls.download}/${id}`);
        }
    },

    deleteAttachments: function () {
        if (!attachmentLocalConfigs.datatableUtils.funcs.validateSelected("files")) {
            return;
        }

        swal({
            title: "Are you sure?",
            text: `You want to delete ${attachmentConfigs.attachmentType}(s)!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {

                attachmentConfigs.laddaDeleteAttachment.start();
                App.blockUI({
                    target: attachmentConfigs.tableId
                });
                $.ajax({
                    url: attachmentConfigs.urls.delete,
                    type: 'POST',
                    data: {
                        "": attachmentConfigs.selected
                    },
                    success: function (result) {
                        toastr["success"](`Delete ${attachmentConfigs.attachmentType}(s) successful`);
                        attachmentLocalConfigs.datatableUtils.funcs.unCheckBulkCheck();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`Delete ${attachmentConfigs.attachmentType}(s) fail, please try again`);
                    },
                    complete: function (result) {
                        attachmentConfigs.selected = [];
                        attachmentConfigs.laddaDeleteAttachment.stop();
                        App.unblockUI(attachmentConfigs.tableId);
                        reloadDatatable(attachmentConfigs.$table);
                    }
                });
            }
        });
    },

    setEnableExpiryDate: function (enableExpiryDate) {
        attachmentConfigs.enableExpiryDate = enableExpiryDate;
    },

    setEnableShiftAttachmentMode: function (enableShiftAttachmentMode) {
        attachmentConfigs.enableShiftAttachmentMode = enableShiftAttachmentMode;
    },

    /* Helper Methods */
    customFilter: function () {

    },

    getGroupChecked: function () {
        return attachmentConfigs.$datatable.find(".group-checkable");
    },

    openInNewTab: function (url) {
        window.open(url, "_blank");
    },

    expiryDateChanged: function (ev) {
        var dateTime = moment(ev.date).format(constant.dateFormat);
        var newActionUrl = `${attachmentConfigs.actionUrl}&expireDate=${dateTime}`;
        attachmentConfigs.$fileUpload.attr("action", newActionUrl);
    },

    expiryDateCleared: function (ev) {
        var newActionUrl = `${attachmentConfigs.actionUrl}`;
        attachmentConfigs.$fileUpload.attr("action", newActionUrl);
    },

    getSorting: function () {
        // if (!attachmentConfigs.enableExpiryDate) {
        //     return [[6, "desc"]];
        // }

        return [[0, "desc"]];
    },

    getColumns: function () {
        var columns = [];
        columns.push({
            "mData": "id",
            "sClass": "hidden",
            "bSearchable": false
        });
        columns.push({
            "mData": null,
            "bSortable": false,
            "bSearchable": false,
            "sClass": "text-center",
            "render": function (data) {
                var html = "";
                //if (data.jobId == null) {
                    html ='<div class="checker">' +
                    '<span>' +
                    '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' + data.id + '">' +
                    '</span>' +
                    '</div>';
                //}

                return html;
            }
        });
        columns.push({
            "mData": null,
            "bSortable": false,
            "bSearchable": false,
            "sClass": "text-center action-column",
            "render": function (data) {
                var html = '<div>';

                //if (data.jobId == null) {
                html += `<a href="javascript:void(0);" data-id="${data.id}" data-filetitle="${data.fileTitle}" class="${attachmentConfigs.editItemClass} btn btn-xs btn-primary" ${tooltipHelper.edit('Title')}><i class="fa fa-edit"></i></a>`;
                //}
                
                html += `<a href="javascript:void(0);" data-id="${data.guidId}" data-extension="${data.fileExtension}" class="${attachmentConfigs.removeItemClass} btn btn-xs btn-primary" ${tooltipHelper.download(attachmentConfigs.attachmentType)}><i class="fa fa-download"></i></a>`;

                html += '</div>';   
                return html;
            }
        });
        columns.push({
            "mData": "fileTitle"
        });
        columns.push({
            "mData": "fileName"
        });
        columns.push({
            "mData": "fileSize",
            "render": function (fileSize) {
                if (fileSize && fileSize > 0) {
                    var sizeInKb = fileSize / 1024 / 1024;
                    return Math.round(sizeInKb * 100) / 100;
                }

                return 0;
            }
        });
        if (attachmentConfigs.enableExpiryDate) {
            columns.push({
                "mData": "fileExpiry",
                "render": function (data) {
                    return moment(data).format(constant.dateFormat);
                }
            });
        }
        if (attachmentConfigs.enableShiftAttachmentMode) {
            columns.push({
                "mData": null,
                "sClass": "text-center vertical-middle",
                "render": function (data) {
                    //if (data.jobId == null) {
                        return `<div data-id="${data.id}" data-allow-edit="${data.allowToEdit}" class="lblallowedit" > 
                                    <i class="${data.allowToEdit == true ? "text-primary" : ""} fa fa-${data.allowToEdit == true
                                        ? "toggle-on"
                                        : "toggle-off"}"></i>
                                    ${(data.allowToEdit == true ? "Yes" : "No")} 
                                </div>`;
                    //} else {
                    //    return `<div>${(data.allowToEdit == true ? "Yes" : "No")} </div>`;
                    //}
                }
            });
            columns.push({
                "mData": null,
                "sClass": "text-center vertical-middle",
                "render": function(data) {

                    //if (data.jobId == null) {
                        return `<div data-id="${data.id}" data-allow-view="${data.allowToView}" class="lblallowview"> 
                                    <i class="${data.allowToView == true ? "text-primary" : ""} fa fa-${data.allowToView == true
                                        ? "toggle-on"
                                        : "toggle-off"}"></i>
                                    ${(data.allowToView == true ? "Yes" : "No")} 
                                </div>`;
                    //} else {
                    //   return `<div>${(data.allowToView == true ? "Yes" : "No")} </div>`;
                    //}
                }
            });
        }
        columns.push({
            "mData": "createdOnUtc",
            "render": function (data) {
                return getLocalFromUtc(data);
            }
        });

        return columns;
    },

    getExpireWitinMonth: function () {
        $.ajax({
            url: attachmentConfigs.urls.getExpireWithinMonths,
            type: 'GET',
            success: function (result) {
                attachmentConfigs.$willExpireLabel.html(getExpireText("Document", result.expire));
                attachmentConfigs.$willExpireAgainLabel.html(getExpireText("Document", result.expireAgain));
            }
        });
    }
}