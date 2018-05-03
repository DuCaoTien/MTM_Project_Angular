var SAVE_TYPE = {
    SAVE: 1,
    SAVE_CLOSE: 2
}

function JobDropzoneCommon(parentSelector, jobId) {
    var $this = this;
    $this.parentSelector = parentSelector;

    $this.configs = {
        imageType: ".jpeg,.jpg,.png,.gif,.JPEG,.JPG,.PNG,.GIF",
        defaultThumbnailUrl: "/Resource/document.png",
        deleteFileUrl: '',
        acceptedFiles: "image/*,.pdf",
        removeBtnClass: "remove-item",
        allowToEditClass: 'allow-to-edit',
        allowToViewClass: 'allow-to-view',
        $save: $("#save"),
        $saveAndClose: $("#saveAndClose"),
        saveType: SAVE_TYPE.SAVE,
        $fileUpload: $(findElement("#fileDropzone")),
        jobId: jobId,
        closeCallback: null
    };

    function findElement(selector) {
        if (!$this.parentSelector) return selector;
        return `${$this.parentSelector} ${selector}`;
    }

    $this.funcs = {
        init: function (selector) {
            $this.configs.fileDropzone = new Dropzone(`${selector}`,
                {
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

            $this.configs.fileDropzone.on("thumbnail", function (file, dataUrl) {
                // Display the image in your file.previewElement
                $('.dz-image').last().find('img').attr({ width: '100%', height: '100%' });
            });

            $this.configs.fileDropzone.on("addedfile", function (file) {
                if (file.size === 0) {
                    showAjaxFailureMessage(file.name + " is Empty!")
                    $this.configs.fileDropzone.removeFile(file);
                } else if (file.size / 1024 / 1024 > constant.maxFileSize) {
                    showAjaxFailureMessage(file.name + " is Out Of " + constant.maxFileSize + " MiB!");
                    $this.configs.fileDropzone.removeFile(file);
                } else {
                    if (!file.type.match(/image.*/)) {
                        // This is not an image, so Dropzone doesn't create a thumbnail.
                        // Create a default thumbnail:
                        $this.configs.fileDropzone.emit("thumbnail", file, $this.configs.defaultThumbnailUrl);
                    }
                }

                // Capture the Dropzone instance as closure.
                var _this = this;

                /* Add remove button */
                // Create the remove button
                var $removeButton = Dropzone.createElement(`<a href='javascript:;'' class='btn red btn-sm btn-block ${$this.configs.removeBtnClass}'>Remove</a>`);

                // Listen to the click event
                $removeButton.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    _this.removeFile(file);

                    return;
                });

                /* Add allow edit  */
                var $allowToEditElement = Dropzone.createElement(`<div data-file-name="${file.name}" class="${$this.configs.allowToEditClass}">
                    <input type="checkbox"/>
                    <label>Edit On Mobile</label>
                </div>`);

                /* Add allow edit  */
                var $allowToViewElement = Dropzone.createElement(`<div data-file-name="${file.name}" class="${$this.configs.allowToViewClass}">
                    <input type="checkbox"/>
                    <label>View On Mobile</label>
                </div>`);

                // Append
                file.previewElement.appendChild($allowToEditElement);
                file.previewElement.appendChild($allowToViewElement);
                file.previewElement.appendChild($removeButton);
            });

            $this.configs.fileDropzone.on("processingmultiple", function (file) {

            });

            $this.configs.fileDropzone.on("completemultiple", function (progress) {
                $this.configs.fileDropzone.removeAllFiles(true);

                if ($this.configs.saveType === SAVE_TYPE.SAVE_CLOSE) {
                    $this.configs.closeCallback();
                }
            });

            $this.configs.fileDropzone.on('sendingmultiple', function (file, xhr, formData) {
                var files = $this.configs.fileDropzone.files;
                var requestParam = $this.funcs.getRequestParam();

                // Add request params
                for (var key in requestParam) {
                    if (!requestParam.hasOwnProperty(key)) continue;

                    formData.append(key, requestParam[key]);
                }
            });

            $this.configs.$save.on("click", function () {
                $this.configs.saveType = SAVE_TYPE.SAVE;

                $this.configs.fileDropzone.processQueue();
            });

            $this.configs.$saveAndClose.on("click", function () {
                $this.configs.saveType = SAVE_TYPE.SAVE_CLOSE;

                $this.configs.fileDropzone.processQueue();
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
        },

        getRequestParam: function () {
            var files = $this.configs.fileDropzone == null ? null : $this.configs.fileDropzone.files;

            if (!files || files.length === 0) return null;

            var model = [];

            files.forEach(function (file) {
                var fileName = file.name;
                var $alowToEditItem = $this.configs.$fileUpload.find(`.${$this.configs.allowToEditClass}[data-file-name="${fileName}"]`);
                var $alowToViewItem = $this.configs.$fileUpload.find(`.${$this.configs.allowToViewClass}[data-file-name="${fileName}"]`);

                model.push({
                    fileName: fileName,
                    allowToEdit: $($alowToEditItem.find('input[type="checkbox"]')).is(':checked'),
                    allowToView: $($alowToViewItem.find('input[type="checkbox"]')).is(':checked')
                });
            });

            return {
                JobId: $this.configs.jobId,
                AttachmentConfigInString: JSON.stringify(model)
            };
        },
    };
}