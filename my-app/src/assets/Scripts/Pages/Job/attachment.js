function JobAttachment(parentSelector, jobId) {
    const $this = this;
    $this.parentSelector = parentSelector;

    function findElement(selector) {
        if (!$this.parentSelector) return selector;
        return `${$this.parentSelector} ${selector}`;
    }

    const dropzone = new JobDropzoneCommon(parentSelector, jobId);

    $this.configs = {
        selected: [],
        tableId: findElement("#attachmentDatatable"),
        fileUploadId: findElement("#fileDropzone"),
        $fileUpload: $(findElement("#fileDropzone")),
        $table: null,
        $txtFilesId: $(findElement("#addAttachmentSection #Files")),
        $datatable: $(findElement("#attachmentDatatable")),
        $addAttachmentSection: $(findElement("#addAttachmentSection")),
        $btnAddAttachment: $(findElement("#btnAddAttachment")),
        $btnDeleteAttachment: $(findElement("#btnDeleteAttachment")),
        laddaDeleteAttachment: document.querySelector(findElement("#btnDeleteAttachment")) != null ? Ladda.create(document.querySelector(findElement("#btnDeleteAttachment"))) : null,
        urls: {
            getList: apiUrl.attachment.getDocumentList,
            upload: apiUrl.attachment.addInJob,
            delete: apiUrl.attachment.deleteDocument,
            download: apiUrl.attachment.downloadDocument,
            getAttachment: apiUrl.attachment.getAttachment,
            editFileTitle: apiUrl.attachment.editFileTitle,
            updateEditView:  apiUrl.attachment.updateEditView
        },
        editItemClass: "editItem",
        removeItemClass: "removeItem",
        attachmentType: "",
        firstLoad: true,
        enableExpiryDate: false,
        actionUrl: "",
        $cancel: $(findElement("#cancel")),
        jobId: jobId,
        $editFileModal: $('#EditFileModal')
    };

    $this.funcs = {
        initPage: function (customFilters) {
            $this.configs.actionUrl = $this.configs.$fileUpload.attr("action");
            if ($this.configs.firstLoad === false) return;
            $this.funcs.initEvents();
            $this.funcs.initDatatable(customFilters);
            dropzone.funcs.init($this.configs.fileUploadId);
            dropzone.configs.closeCallback = $this.funcs.hideFormAttachment;
            $this.configs.firstLoad = false;
        },

        initEvents: function () {
            $this.configs.$btnAddAttachment.on("click", function (event) {
                event.preventDefault();
                $this.funcs.showFormAttachment();
            });

            $this.configs.$btnDeleteAttachment.on("click", function () {
                $this.funcs.deleteAttachments();
            });

            // Init edit file title event
            $(document).delegate(`.${$this.configs.editItemClass}`, "click", function () {
                const itemId = $(this).data("id");
                const fileTitle = $(this).data("filetitle");
                $this.funcs.editFile(itemId, fileTitle);
            });

            $(document).delegate(`.${$this.configs.removeItemClass}`, "click", function () {
                const itemId = $(this).data("id");
                const itemExtension = $(this).data("extension");
                $this.funcs.downloadAttachment(itemId, itemExtension);
            });

            $this.configs.$cancel.on("click", function () {
                $this.funcs.hideFormAttachment();
            });
        },

        initDatatable: function (customParams) {
            $this.configs.customParams = customParams;
            if ($this.configs.$table != null) return;

            $this.configs.$table = $this.configs.$datatable.dataTable({
                ajax: {
                    url: $this.configs.urls.getList,
                    type: "POST"
                },
                "serverSide": true,
                "fnServerParams": function (aoData) {
                    aoData.customParams = $this.configs.customParams;
                },
                "aaSorting": $this.funcs.getSorting(),
                "aoColumns": $this.funcs.getColumns(),
                "initComplete": function (settings, json) {
                    $this.funcs.customFilter();
                },
                "fnDrawCallback": function (settings) {
                    // datable header checkboxes on click
                    $this.funcs.offBulkCheck();
                    $this.funcs.onBulkCheck();

                    // datatable set cursor is pointer
                    $this.configs.$datatable.find('tbody tr').each(function () {
                        $(this).css("cursor", "pointer");
                        $(this).attr("role", "row");
                    });

                    // datatable tr on click
                    $this.configs.$datatable.off("click", "tbody tr");
                    $this.configs.$datatable.on("click", "tbody tr", function () {
                        $(this).toggleClass("active");
                        const checkboxes = $(this).find(".checkboxes");
                        $(checkboxes).parents("span").toggleClass("checked");
                        $.uniform.update(checkboxes);

                        // bind selected array
                        var id = $(checkboxes).data("id");
                        if ($(checkboxes).parents("span").hasClass("checked")) {
                            $this.configs.selected.push(id);
                            var totalRecords = settings.fnRecordsTotal();
                            if ($this.configs.selected.length === totalRecords) {
                                $this.funcs.offBulkCheck();
                                $this.funcs.checkBulkCheck();
                                $this.funcs.onBulkCheck();
                            }
                        } else {
                            $this.configs.selected.remove(id);
                            $this.funcs.offBulkCheck();
                            $this.funcs.unCheckBulkCheck();
                            $this.funcs.onBulkCheck();
                        }
                    });

                    $(".lblallowedit").on("click",
                    function() {
                        var request = {
                            id: $(this).attr("data-id"),
                            allowToEdit: $(this).attr("data-allow-edit") == "true" ? "false" : "true"
                        };

                        $.ajax({
                            url: $this.configs.urls.updateEditView,
                            type: 'POST',
                            data: request,
                            success: function (result) {
                                toastr["success"](`Update ${$this.configs.attachmentType}(s) successful`);
                                $this.funcs.unCheckBulkCheck();
                            },
                            error: function (result) {
                                console.log("error: " + result);
                                toastr["error"](`Update ${$this.configs.attachmentType}(s) fail, please try again`);
                            },
                            complete: function (result) {
                                $this.configs.selected = [];
                                $this.configs.laddaDeleteAttachment.stop();
                                App.unblockUI($this.configs.tableId);
                                reloadDatatable($this.configs.$table);
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
                                url: $this.configs.urls.updateEditView,
                                type: 'POST',
                                data: request,
                                success: function(result) {
                                    toastr["success"](`Update ${$this.configs.attachmentType}(s) successful`);
                                    $this.funcs.unCheckBulkCheck();
                                },
                                error: function(result) {
                                    console.log("error: " + result);
                                    toastr["error"](`Update ${$this.configs.attachmentType}(s) fail, please try again`);
                                },
                                complete: function(result) {
                                    $this.configs.selected = [];
                                    $this.configs.laddaDeleteAttachment.stop();
                                    App.unblockUI($this.configs.tableId);
                                    reloadDatatable($this.configs.$table);
                                }
                            });
                        }
                    );
                },
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $('[data-toggle="tooltip"]').tooltip();

                    return nRow;
                }
            });
        },

        showFormAttachment: function () {
            // $this.configs.$btnCancel.show();
            $this.configs.$btnAddAttachment.hide();
            $this.configs.$btnDeleteAttachment.hide();
            $this.configs.$addAttachmentSection.show();
            $(findElement("#attachmentDatatable_wrapper")).hide();
        },

        resetAttachments: function () {
            if (dropzone.configs.fileDropzone) {
                dropzone.configs.fileDropzone.removeAllFiles(true);
            }
        },

        hideFormAttachment: function () {
            // $this.configs.$btnCancel.hide();
            $this.configs.$btnAddAttachment.show();
            $this.configs.$btnDeleteAttachment.show();
            $this.configs.$addAttachmentSection.hide();
            if (dropzone.configs.fileDropzone) {
                dropzone.configs.fileDropzone.removeAllFiles(true);
            }

            $(findElement("#attachmentDatatable_wrapper")).show();
            reloadDatatable($this.configs.$table);
        },

        editFile: function (id, fileTitle) {
            var formId = 'edit_file_title_form';
            var $modal = $this.configs.$editFileModal;
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
                    reloadDatatable($this.configs.$table);
                };

                var errorCallback = function (response) {
                    console.log(response);
                    showAjaxFailureMessage(`Update file title fail, please try again!`);
                }

                if ($form != null && $form.valid()) {
                    $.ajax({
                        type: "POST",
                        url: $this.configs.urls.editFileTitle,
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
                var url = `${$this.configs.urls.getAttachment}/${id}`;
                if (isPdf(extension)) {
                    window.open(url);
                } else if (isImage(extension)) {
                    window.open(url);
                }
            } else {
                $this.funcs.openInNewTab(`${$this.configs.urls.download}/${id}`);
            }
        },

        deleteAttachments: function () {
            if (!$this.funcs.validateSelected("files")) {
                return;
            }

            swal({
                title: "Are you sure?",
                text: `You want to delete ${$this.configs.attachmentType}(s)!`,
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes, delete",
                cancelButtonText: "No, cancel",
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    $this.configs.laddaDeleteAttachment.start();
                    App.blockUI({
                        target: $this.configs.tableId
                    });
                    $.ajax({
                        url: $this.configs.urls.delete,
                        type: 'POST',
                        data: {
                            "": $this.configs.selected
                        },
                        success: function (result) {
                            toastr["success"](`Delete ${$this.configs.attachmentType}(s) successful`);
                            $this.funcs.unCheckBulkCheck();
                        },
                        error: function (result) {
                            console.log("error: " + result);
                            toastr["error"](`Delete ${$this.configs.attachmentType}(s) fail, please try again`);
                        },
                        complete: function (result) {
                            $this.configs.selected = [];
                            $this.configs.laddaDeleteAttachment.stop();
                            App.unblockUI($this.configs.tableId);
                            reloadDatatable($this.configs.$table);
                        }
                    });
                }
            });
        },

        /* Helper Methods */
        customFilter: function () {
        },

        validateSelected: function () {
            if ($this.configs.selected.length < 1) {
                toastr["error"]('Error - No files selected');
                return false;
            }
            return true;
        },

        deSelectAll: function () {
            $this.configs.selected = [];
            $this.funcs.offBulkCheck();
            var groupCheck = $this.funcs.getGroupChecked();
            if ($(groupCheck).parents("span").hasClass("checked")) {
                $(groupCheck).trigger("click");
            }
            $this.funcs.onBulkCheck();
            $this.configs.$datatable.find('tbody tr').each(function () {
                if ($(this).hasClass("active")) {
                    $(this).trigger("click");
                }
            });
        },

        onBulkCheck: function () {
            $this.funcs.getGroupChecked().change(function () {
                var checkboxs = $(this).attr("data-set");
                var isCheckedAll = $(this).is(":checked");
                $this.configs.selected = [];
                $(checkboxs).each(function () {
                    if (isCheckedAll === true) {
                        $(this).parents("tr").addClass("active");
                        $(this).parents("span").addClass("checked");

                        // bind selected array
                        var id = $(this).data("id");
                        $this.configs.selected.push(id);
                    } else {
                        $(this).parents("tr").removeClass("active");
                        $(this).parents("span").removeClass("checked");
                    }
                });
                $.uniform.update(checkboxs);
            });
        },

        offBulkCheck: function () {
            $this.funcs.getGroupChecked().off("change");
        },

        checkBulkCheck: function () {
            var groupCheckeds = $this.funcs.getGroupChecked();
            if (!groupCheckeds.parents("span").hasClass("checked")) {
                groupCheckeds.trigger("click");
            }
        },

        unCheckBulkCheck: function () {
            var groupCheckeds = $this.funcs.getGroupChecked();
            if (groupCheckeds.parents("span").hasClass("checked")) {
                groupCheckeds.trigger("click");
            }
        },

        getGroupChecked: function () {
            return $this.configs.$datatable.find(".group-checkable");
        },

        openInNewTab: function (url) {
            window.open(url, "_blank");
        },

        getSorting: function () {
            if (!$this.configs.enableExpiryDate) {
                return [[6, "desc"]];
            }

            return [[7, "desc"]];
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
                "sClass": "text-center ",
                "render": function (data) {
                    return '<div class="checker">' +
                        '<span>' +
                        '<input type="checkbox" class="checkboxes" style="cursor:pointer" data-id="' + data.id + '">' +
                        '</span>' +
                        '</div>';
                }
            });
            columns.push({
                "mData": null,
                "bSortable": false,
                "bSearchable": false,
                "sClass": "text-center action-column",
                "render": function (data) {
                    var html = '<div>';

                    html += `<a href="javascript:void(0);" data-id="${data.id}" data-filetitle="${data.fileTitle}" class="${$this.configs.editItemClass} btn btn-xs btn-primary" ${tooltipHelper.edit('Title')}><i class="fa fa-edit"></i></a>`;
                    html += `<a href="javascript:void(0);" data-id="${data.guidId}" data-extension="${data.fileExtension}" class="${$this.configs.removeItemClass} btn btn-xs btn-primary" ${tooltipHelper.download($this.configs.attachmentType)}><i class="fa fa-download"></i></a>`;

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
            columns.push({
                "mData": null,
                "sClass": "text-center vertical-middle",
                "render": function (data) {
                    return `<div data-id="${data.id}" data-allow-edit="${data.allowToEdit}" class="lblallowedit" > 
                        <i class="${data.allowToEdit == true ? "text-primary" : ""} fa fa-${data.allowToEdit == true ? "toggle-on" : "toggle-off"}"></i>
                        ${(data.allowToEdit == true ? "Yes" : "No")} 
                    </div>`;
                }
            });
            columns.push({
                "mData": null,
                "sClass": "text-center vertical-middle",
                "render": function (data) {
                    return `<div data-id="${data.id}" data-allow-view="${data.allowToView}" class="lblallowview"> 
                        <i class="${data.allowToView == true ? "text-primary" : ""} fa fa-${data.allowToView == true ? "toggle-on" : "toggle-off"}"></i>
                        ${(data.allowToView == true ? "Yes" : "No")} 
                    </div>`;
                }
            });
            columns.push({
                "mData": "createdOnUtc",
                "render": function (data) {
                    return getLocalFromUtc(data);
                }
            });

            return columns;
        }
    };
}