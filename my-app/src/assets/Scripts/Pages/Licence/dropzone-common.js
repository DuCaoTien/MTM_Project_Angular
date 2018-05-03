var dropzoneConfigs = {
    imageType: ".jpeg,.jpg,.png,.gif,.JPEG,.JPG,.PNG,.GIF",
    defaultThumbnailUrl: "/Resource/document.png",
    deleteFileUrl: "",
    licenceId: 0, // need set licence id when use this file
    urls: {
        download: apiUrl.attachment.downloadDocument,
        getAttachment: apiUrl.attachment.getAttachment
    }
};

var dropzoneCommon = {
    init: function (elementId, deleteFileUrl) {
        dropzoneConfigs.deleteFileUrl = deleteFileUrl;

        dropzoneConfigs.fileDropzone = new Dropzone(`#${elementId}`,
        {
            maxFilesize: constant.maxFileSize,
            // acceptedFiles: ".jpeg,.jpg,.png,.gif,.JPEG,.JPG,.PNG,.GIF,.pdf,.pub",
        });

        dropzoneConfigs.fileDropzone.on("thumbnail", function (file, dataUrl) {
            // Display the image in your file.previewElement
            $('.dz-image').last().find('img').attr({ width: '100%', height: '100%' });
        });
        dropzoneConfigs.fileDropzone.on("success", function () {
            var args = Array.prototype.slice.call(arguments);
            var file = args[0];
            showAjaxSuccessMessage("Success Upload: "+file.name);
        });
        dropzoneConfigs.fileDropzone.on("error", function () {
            var args = Array.prototype.slice.call(arguments);
            var file = args[0];
            showAjaxFailureMessage("Failure Upload: " + file.name);
            dropzoneConfigs.fileDropzone.removeFile(file);
        });
        dropzoneConfigs.fileDropzone.on("addedfile", function (file) {
            if (!file.type.match(/image.*/)) {
                // This is not an image, so Dropzone doesn't create a thumbnail.
                // Create a default thumbnail:
                dropzoneConfigs.fileDropzone.emit("thumbnail", file, dropzoneConfigs.defaultThumbnailUrl);
            }

            // Create the remove button
            const removeButton = Dropzone.createElement("<a href='javascript:;'' class='btn red btn-sm btn-block'>Remove</a>");
            const viewButton = Dropzone.createElement("<a href='javascript:;'' class='btn green btn-sm btn-block'>View</a>");

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

                dropzoneCommon.ajaxRemoveFile(_this, file);
            });

            viewButton.addEventListener("click", function (e) {
                // Make sure the button click doesn't submit the form:
                e.preventDefault();
                e.stopPropagation();

                if (!file.id) {
                    dropzoneCommon.openInNewTab(file.filePath);
                } else {
                    var extension = file.fileExtension.replace(".", "").toLowerCase();
                    var id = file.guidId;
                    var isViewOnly = isPdf(extension) || isImage(extension);

                    if (isViewOnly) {
                        var url = `${dropzoneConfigs.urls.getAttachment}/${id}`;
                        window.open(url);
                    } else {
                        dropzoneCommon.openInNewTab(`${dropzoneConfigs.urls.download}/${id}`);
                    }
                }
            });

            // Add the button to the file preview element.
            file.previewElement.appendChild(viewButton);
            file.previewElement.appendChild(removeButton);
        });

        dropzoneConfigs.fileDropzone.on("complete", function (file) {
            if (file.accepted) {
                var tempfileName = file.name;
                if (tempfileName == null || tempfileName.length < 1){
                    tempfileName = file.fileName;
                }
                const fileInfo = tempfileName.split(".");
                let filePath = file.xhr.responseText;
                try {
                    filePath = JSON.parse(file.xhr.responseText);
                }
                catch (e) {
                    // ignore
                }
                file.filePath = filePath;
                file.fileSize = file.size;
                file.fileName = fileInfo[0];
                file.fileDescription = file.fileName;
                if (file.fileExtension == null){
                    file.fileExtension = `.${fileInfo[fileInfo.length - 1]}`;
                }
                //file.fileExtension = `.${fileInfo[fileInfo.length - 1]}`;
            }
        });

        return dropzoneConfigs.fileDropzone;
    },
    getExistsFileFromServer: function (getFileUrl) {
        $.getJSON(getFileUrl, function (data) {
            $.each(data, function (index, file) {

                file.name = file.fileDescription;
                file.size = file.fileSize;
                file.accepted = true;
                file.xhr = {
                    responseText: file.filePath
                };

                let thumbnailUrl = "";
                if (dropzoneConfigs.imageType.indexOf(file.fileExtension) > -1) {
                    file.type = `image/${file.fileExtension.replace(".", "")}`;
                    thumbnailUrl = file.filePath;
                } else {
                    file.type = "file";
                    thumbnailUrl = dropzoneConfigs.defaultThumbnailUrl;
                }

                dropzoneConfigs.fileDropzone.emit("addedfile", file);
                dropzoneConfigs.fileDropzone.emit("thumbnail", file, thumbnailUrl);
                dropzoneConfigs.fileDropzone.files.push(file);
                dropzoneConfigs.fileDropzone.emit("complete", file);
            });
        });
    },
    ajaxRemoveFile: function (_this, file) {
        $.ajax({
            type: "POST",
            url: `${dropzoneConfigs.deleteFileUrl}?filePath=${file.filePath}`,
            contentType: false,
            processData: false,
            success: function (response) {
                _this.removeFile(file);
                // showAjaxSuccessMessage(response);
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
    },
    openInNewTab: function (url) {
        var win = window.open(url, '_blank');
        win.focus();
    }
}

