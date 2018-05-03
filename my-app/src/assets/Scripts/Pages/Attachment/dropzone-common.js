var SAVE_TYPE = {
    SAVE: 1,
    SAVE_CLOSE: 2
}

function DropzoneCommon() {
    const $this = this;

    $this.configs = {
        imageType: ".jpeg,.jpg,.png,.gif,.JPEG,.JPG,.PNG,.GIF",
        defaultThumbnailUrl: "/Resource/document.png",
        deleteFileUrl: apiUrl.employee.deleteDocument,
        $save: $("#save"),
        $saveAndClose: $("#saveAndClose"),
        saveType: SAVE_TYPE.SAVE,
        acceptedFiles: ""
    };

    $this.funcs = {
        init: function (selector) {
            $this.configs.fileDropzone = new Dropzone(`${selector}`,
            {
                //maxFilesize: constant.maxFileSize,
                autoProcessQueue: false,
                uploadMultiple: true,
                parallelUploads: 100,
                maxFiles: 100,
                acceptedFiles: $this.configs.acceptedFiles
            });
            $this.configs.fileDropzone.on("successmultiple", function () {
                showAjaxSuccessMessage("Upload Successful!");
            });
            $this.configs.fileDropzone.on("error", function () {
                var args = Array.prototype.slice.call(arguments);
                showAjaxFailureMessage(args[1]);
            });
            $this.configs.$save.on("click", function () {
                $this.configs.saveType = SAVE_TYPE.SAVE;
                if (attachmentConfigs.$allowToEdit.length > 0) {
                    var allowToEdit = attachmentConfigs.$allowToEdit[0].checked;
                    var allowToView = attachmentConfigs.$allowToView[0].checked;
                    var newActionUrl = `${attachmentConfigs.actionUrl}&allowToEdit=${allowToEdit}&allowToView=${allowToView}`;
                    attachmentConfigs.$fileUpload.attr("action", newActionUrl);
                }
                $this.configs.fileDropzone.processQueue();
            });

            $this.configs.$saveAndClose.on("click", function () {
                $this.configs.saveType = SAVE_TYPE.SAVE_CLOSE;
                if (attachmentConfigs.$allowToEdit.length > 0) {
                    var allowToEdit = attachmentConfigs.$allowToEdit[0].checked;
                    var allowToView = attachmentConfigs.$allowToView[0].checked;
                    var newActionUrl = `${attachmentConfigs.actionUrl}&allowToEdit=${allowToEdit}&allowToView=${allowToView}`;
                    attachmentConfigs.$fileUpload.attr("action", newActionUrl);
                }
                $this.configs.fileDropzone.processQueue();
            });

            $this.configs.fileDropzone.on("thumbnail", function (file, dataUrl) {
                // Display the image in your file.previewElement
                $('.dz-image').last().find('img').attr({ width: '100%', height: '100%' });
            });

            $this.configs.fileDropzone.on("addedfile", function (file) {
                if (file.size === 0) {
                    showAjaxFailureMessage(file.name + " is Empty!")
                    $this.configs.fileDropzone.removeFile(file);
                } else if (file.size / 1024 / 1024 > constant.maxFileSize) {
                    showAjaxFailureMessage(file.name + " has exceeded file size limit of " + constant.maxFileSize + "MB");
                    $this.configs.fileDropzone.removeFile(file);
                } else {
                    if (!file.type.match(/image.*/)) {
                        // This is not an image, so Dropzone doesn't create a thumbnail.
                        // Create a default thumbnail:
                        $this.configs.fileDropzone.emit("thumbnail", file, $this.configs.defaultThumbnailUrl);
                    }
                }

                // Create the remove button
                const removeButton = Dropzone.createElement("<a href='javascript:;'' class='btn red btn-sm btn-block'>Remove</a>");

                // Capture the Dropzone instance as closure.
                var _this = this;

                // Listen to the click event
                removeButton.addEventListener("click", function (e) {
                    // Make sure the button click doesn't submit the form:
                    e.preventDefault();
                    e.stopPropagation();

                    // If you want to the delete the file on the server as well,
                    // you can do the AJAX request here.
                    if (!file.accepted || !file.filePath || file.id) {
                        // Remove the file preview.
                        _this.removeFile(file);
                        return;
                    }
                });

                // Add the button to the file preview element.
                file.previewElement.appendChild(removeButton);
            });

            $this.configs.fileDropzone.on("processing", function (file) {
                this.options.url = attachmentConfigs.$fileUpload.attr("action");
            });

            $this.configs.fileDropzone.on("completemultiple", function (progress) {
                $this.configs.fileDropzone.removeAllFiles(true);

                if ($this.configs.saveType === SAVE_TYPE.SAVE_CLOSE) {
                    attachmentFunctions.hideFormAttachment();
                }
            });

            return $this.configs.fileDropzone;
        },
        ajaxRemoveFile: function (_this, file) {
            $.ajax({
                type: "POST",
                url: `${$this.configs.deleteFileUrl}?filePath=${file.filePath}`,
                contentType: false,
                processData: false,
                success: function (response) {
                    _this.removeFile(file);
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
    };
}

var dropzoneConfigs = {
    imageType: ".jpeg,.jpg,.png,.gif,.JPEG,.JPG,.PNG,.GIF",
    defaultThumbnailUrl: "/Resource/document.png",
    deleteFileUrl: apiUrl.employee.deleteDocument,
    $save: $("#save"),
    $saveAndClose: $("#saveAndClose"),
    saveType: SAVE_TYPE.SAVE,
    acceptedFiles: ""
};

var dropzoneCommon = {
    init: function (elementId) {
        dropzoneConfigs.fileDropzone = new Dropzone(`#${elementId}`,
        {
            //maxFilesize: constant.maxFileSize,
            autoProcessQueue: false,
            uploadMultiple: true,
            parallelUploads: 100,
            maxFiles: 100,
            acceptedFiles: dropzoneConfigs.acceptedFiles
        });
        dropzoneConfigs.fileDropzone.on("successmultiple",function() {
            showAjaxSuccessMessage("Upload Successful!");
        });
        dropzoneConfigs.fileDropzone.on("error", function () {
            var args = Array.prototype.slice.call(arguments);
            showAjaxFailureMessage(args[1]);
        });
        dropzoneConfigs.$save.on("click", function () {
            dropzoneConfigs.saveType = SAVE_TYPE.SAVE;
            if (attachmentConfigs.$allowToEdit.length > 0) {
                var allowToEdit = attachmentConfigs.$allowToEdit[0].checked;
                var allowToView = attachmentConfigs.$allowToView[0].checked;
                var newActionUrl = `${attachmentConfigs.actionUrl}&allowToEdit=${allowToEdit}&allowToView=${allowToView}`;
                attachmentConfigs.$fileUpload.attr("action", newActionUrl);
            }
            dropzoneConfigs.fileDropzone.processQueue();
        });

        dropzoneConfigs.$saveAndClose.on("click", function () {
            dropzoneConfigs.saveType = SAVE_TYPE.SAVE_CLOSE;
            if (attachmentConfigs.$allowToEdit.length > 0) {
                var allowToEdit = attachmentConfigs.$allowToEdit[0].checked;
                var allowToView = attachmentConfigs.$allowToView[0].checked;
                var newActionUrl = `${attachmentConfigs.actionUrl}&allowToEdit=${allowToEdit}&allowToView=${allowToView}`;
                attachmentConfigs.$fileUpload.attr("action", newActionUrl);
            }
            dropzoneConfigs.fileDropzone.processQueue();
        });

        dropzoneConfigs.fileDropzone.on("thumbnail", function (file, dataUrl) {
            // Display the image in your file.previewElement
            $('.dz-image').last().find('img').attr({ width: '100%', height: '100%' });
        });

        dropzoneConfigs.fileDropzone.on("addedfile", function (file) {
            if (file.size === 0) {
                showAjaxFailureMessage(file.name + " is Empty!")
                dropzoneConfigs.fileDropzone.removeFile(file);
            }else if (file.size / 1024 / 1024 > constant.maxFileSize) {
                showAjaxFailureMessage(file.name + " has exceeded file size limit of " + constant.maxFileSize + " MB");
                dropzoneConfigs.fileDropzone.removeFile(file);
            } else {
                if (!file.type.match(/image.*/)) {
                    // This is not an image, so Dropzone doesn't create a thumbnail.
                    // Create a default thumbnail:
                    dropzoneConfigs.fileDropzone.emit("thumbnail", file, dropzoneConfigs.defaultThumbnailUrl);
                }
            }

            // Create the remove button
            const removeButton = Dropzone.createElement("<a href='javascript:;'' class='btn red btn-sm btn-block'>Remove</a>");

            // Capture the Dropzone instance as closure.
            var _this = this;

            // Listen to the click event
            removeButton.addEventListener("click", function (e) {
                // Make sure the button click doesn't submit the form:
                e.preventDefault();
                e.stopPropagation();

                // If you want to the delete the file on the server as well,
                // you can do the AJAX request here.
                if (!file.accepted || !file.filePath || file.id) {
                    // Remove the file preview.
                    _this.removeFile(file);
                    return;
                }
            });

            // Add the button to the file preview element.
            file.previewElement.appendChild(removeButton);
        });

        dropzoneConfigs.fileDropzone.on("processing", function (file) {
            this.options.url = attachmentConfigs.$fileUpload.attr("action");
        });

        dropzoneConfigs.fileDropzone.on("completemultiple", function (progress) {
            dropzoneConfigs.fileDropzone.removeAllFiles(true);

            if (dropzoneConfigs.saveType === SAVE_TYPE.SAVE_CLOSE) {
                attachmentFunctions.hideFormAttachment();
            }
        });

        return dropzoneConfigs.fileDropzone;
    },
    ajaxRemoveFile: function (_this, file) {
        $.ajax({
            type: "POST",
            url: `${dropzoneConfigs.deleteFileUrl}?filePath=${file.filePath}`,
            contentType: false,
            processData: false,
            success: function (response) {
                _this.removeFile(file);
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
}

