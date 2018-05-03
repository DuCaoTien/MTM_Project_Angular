function DropzoneCommon() {
    const $this = this;

    $this.configs = {
        imageType: ".jpeg,.jpg,.png,.gif,.JPEG,.JPG,.PNG,.GIF",
        defaultThumbnailUrl: "/Resource/document.png",
        deleteFileUrl: apiUrl.employee.deleteDocument,
        acceptedFiles: "image/*,.pdf",
        removeBtnClass: "remove-item",
        allowToEditClass: 'allow-to-edit',
        allowToViewClass: 'allow-to-view',
    };

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
                    showAjaxFailureMessage(file.name + " has exceeded file size limit of " + constant.maxFileSize + " MB");
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
                const $removeButton = Dropzone.createElement(`<a href='javascript:;'' class='btn red btn-sm btn-block ${$this.configs.removeBtnClass}'>Remove</a>`);

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
                    <label >Edit On Mobile</label>
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
            });

            $this.configs.fileDropzone.on('sendingmultiple', function(file, xhr, formData){
                var files = $this.configs.fileDropzone.files;

                console.log("Dropzone files: ", files);
            });

            return $this.configs.fileDropzone;
        }
    };
}
