function Attachment(parentSelector) {
    const $this = this;
    $this.parentSelector = parentSelector;

    function findElement(selector) {
        if (!$this.parentSelector) return selector;
        return `${$this.parentSelector} ${selector}`;
    }

    const dropzone = new DropzoneCommon();

    $this.configs = {
        fileUploadId: findElement("#fileDropzone"),
        $fileUpload: $(findElement("#fileDropzone")),
        $txtFilesId: $(findElement("#addAttachmentSection #Files")),
        urls: {
            upload: apiUrl.attachment.addInShift,
            verifyUpload: apiUrl.attachment.validateAttachmentInShift,
        },
        firstLoad: true
    };

    $this.funcs = {
        initPage: function () {
            if ($this.configs.firstLoad === false) return;

            $this.funcs.initEvents();

            dropzone.funcs.init($this.configs.fileUploadId);

            $this.configs.firstLoad = false;
        },

        initEvents: function () {
        },

        resetAttachments: function() {
            if (dropzone.configs.fileDropzone) {
                dropzone.configs.fileDropzone.removeAllFiles(true);
            }
        },

        getFiles: function(){
            return dropzone.configs.fileDropzone == null ? null : dropzone.configs.fileDropzone.files;
        },

        getRequestParam: function (ids) {
            var files = $this.funcs.getFiles();

            if(!files || files.length == 0) return null;

            var model = [];

            files.forEach(function(file){
                var fileName = file.name;
                var $alowToEditItem = $this.configs.$fileUpload.find(`.${dropzone.configs.allowToEditClass}[data-file-name="${fileName}"]`);
                var $alowToViewItem = $this.configs.$fileUpload.find(`.${dropzone.configs.allowToViewClass}[data-file-name="${fileName}"]`);

                model.push({
                    fileName: fileName,
                    allowToEdit: $($alowToEditItem.find('input[type="checkbox"]')).is(':checked'),
                    allowToView: $($alowToViewItem.find('input[type="checkbox"]')).is(':checked')
                })
            })

            return {
                EntityIdIdString: JSON.stringify(ids),
                AttachmentConfigInString: JSON.stringify(model)
            };
        },
    };
}