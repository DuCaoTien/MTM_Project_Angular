function Attachment(parentSelector) {
    const $this = this;
    $this.parentSelector = parentSelector;

    function findElement(selector) {
        if (!$this.parentSelector) return selector;
        return `${$this.parentSelector} ${selector}`;
    }

    const dropzone = new DropzoneCommon();

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
        // $btnCancel: $(findElement("#btnCancel")),
        $expiryDate: $(findElement("#ExpiryDate")),
        $allowToEdit: $(findElement("#AllowToEdit")),
        $allowToView: $(findElement("#AllowToView")),
        $willExpireLabel: $(findElement("#willExpireLabel")),
        $willExpireAgainLabel: $(findElement("#willExpireAgainLabel")),
        laddaDeleteAttachment: document.querySelector(findElement("#btnDeleteAttachment")) != null ? Ladda.create(document.querySelector(findElement("#btnDeleteAttachment"))) : null,
        urls: {
            getList: apiUrl.attachment.getDocumentList,
            upload: apiUrl.attachment.uploadDocument,
            delete: apiUrl.attachment.deleteDocument,
            download: apiUrl.attachment.downloadDocument,
            getAttachment: apiUrl.attachment.getAttachment,
            getExpireWithinMonths: apiUrl.configurations.getSupplierAttachmentExpireWithinMonths
        },
        removeItemClass: "removeItem",
        attachmentType: "",
        firstLoad: true,
        enableExpiryDate: false,
        enableShiftAttachmentMode: false,
        actionUrl: "",
        $cancel: $(findElement("#cancel"))
    };

    $this.funcs = {
        initPage: function (customFilters) {
            $this.configs.actionUrl = $this.configs.$fileUpload.attr("action");
            if ($this.configs.firstLoad === false) return;
            if ($this.configs.enableExpiryDate) {
                $this.funcs.getExpireWitinMonth();
            }
            $this.funcs.initEvents();
            $this.funcs.initDatatable(customFilters);
            dropzone.funcs.init($this.configs.fileUploadId);
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

            $(document).delegate(`.${$this.configs.removeItemClass}`, "click", function () {
                const itemId = $(this).data("id");
                const itemExtension = $(this).data("extension");
                $this.funcs.downloadAttachment(itemId, itemExtension);
            });

            $this.configs.$cancel.on("click", function () {
                $this.funcs.hideFormAttachment();
            });

            // Trigger changed date event incase have the expire time
            if ($this.configs.enableExpiryDate) {
                $this.configs.$expiryDate
                    .datepicker()
                    .on("changeDate", $this.funcs.expiryDateChanged)
                    .on("clearDate", $this.funcs.expiryDateCleared);
            }
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
                },
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $('[data-toggle="tooltip"]').tooltip();
                    if ($this.configs.enableExpiryDate) {
                        if (aData.expired === true) $(nRow).addClass("danger");
                        else if (aData.willExpireAgain === true) $(nRow).addClass("info");
                        else if (aData.willExpire === true) $(nRow).addClass("warning");
                    }
                    return nRow;
                }
            });
        },

        showFormAttachment: function () {
            // $this.configs.$btnCancel.show();
            $this.configs.$btnAddAttachment.hide();
            $this.configs.$btnDeleteAttachment.hide();
            $this.configs.$addAttachmentSection.show();
            $this.configs.$expiryDate.val('');
            if ($this.configs.$allowToEdit && $this.configs.$allowToEdit.length > 0) {
                $this.configs.$allowToEdit[0].checked = false;
                $this.configs.$allowToView[0].checked = false;
                $this.configs.$allowToEdit.closest('span').removeClass('checked');
                $this.configs.$allowToView.closest('span').removeClass('checked');
            }
            $(findElement("#attachmentDatatable_wrapper")).hide();
        },

        resetAttachments: function() {
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

        saveAttachments: function (id) {
            let newActionUrl = "";
            dropzone.configs.saveType = SAVE_TYPE.SAVE;
            if ($this.configs.$allowToEdit.length > 0) {
                const allowToEdit = $this.configs.$allowToEdit[0].checked;
                const allowToView = $this.configs.$allowToView[0].checked;
                if (id)
                    $this.configs.actionUrl = $this.configs.actionUrl.replace("-1", id);
                newActionUrl = `${$this.configs.actionUrl}&allowToEdit=${allowToEdit}&allowToView=${allowToView}`;
                $this.configs.$fileUpload.attr("action", newActionUrl);
            }
            try {
                result = {};
                result.action = newActionUrl;
                result.files = dropzone.configs.fileDropzone.files;
                return result;
            } catch (e) {
            }
        },

        getUploadAttachments: function () {
            dropzone.configs.saveType = SAVE_TYPE.SAVE;
            let allowToEdit = false;
            let allowToView = false;
            if ($this.configs.$allowToEdit.length > 0) {
                allowToEdit = $this.configs.$allowToEdit[0].checked;
                allowToView = $this.configs.$allowToView[0].checked;
            }

            result = {};
            result.files = {};
            try {
                result.files = dropzone.configs.fileDropzone.files;
            } catch (e) {
            }

            result.allowToEdit = allowToEdit;
            result.allowToView = allowToView;
            return result;
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

        setEnableExpiryDate: function (enableExpiryDate) {
            $this.configs.enableExpiryDate = enableExpiryDate;
        },

        setEnableShiftAttachmentMode: function (enableShiftAttachmentMode) {
            $this.configs.enableShiftAttachmentMode = enableShiftAttachmentMode;
        },

        /* Helper Methods */
        customFilter: function () {
        },

        validateSelected: function () {
            if ($this.configs.selected.length < 1) {
                toastr["error"](`Error - No files selected`);
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

        expiryDateChanged: function (ev) {
            var dateTime = moment(ev.date).format(constant.dateFormat);
            var newActionUrl = `${$this.configs.actionUrl}&expireDate=${dateTime}`;
            $this.configs.$fileUpload.attr("action", newActionUrl);
        },

        expiryDateCleared: function (ev) {
            var newActionUrl = `${$this.configs.actionUrl}`;
            $this.configs.$fileUpload.attr("action", newActionUrl);
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
                "sClass": "text-center",
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
                "sClass": "text-center",
                "render": function (data) {
                    return `<div><a href="javascript:void(0);" data-id="${data.guidId}" data-extension="${data.fileExtension}" class="${$this.configs.removeItemClass} btn btn-xs btn-primary" ${tooltipHelper.download($this.configs.attachmentType)}><i class="fa fa-download"></i></a></div>`;
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
            if ($this.configs.enableExpiryDate) {
                columns.push({
                    "mData": "fileExpiry",
                    "render": function (data) {
                        return moment(data).format(constant.dateFormat);
                    }
                });
            }
            if ($this.configs.enableShiftAttachmentMode) {
                columns.push({
                    "mData": null,
                    "render": function (data) {
                        return `<span data-id="${data.id}" class="lblallowedit label label-sm label-${(data.allowToEdit == true ? "success" : "danger")}"> ${(data.allowToEdit == true ? "Yes" : "No")} </span>`;
                    }
                });
                columns.push({
                    "mData": "allowToView",
                    "render": function (data) {
                        return `<span data-id="${data.id}" class="lblallowview label label-sm label-${(data == true ? "success" : "danger")}"> ${(data == true ? "Yes" : "No")} </span>`;
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
                url: $this.configs.urls.getExpireWithinMonths,
                type: 'GET',
                success: function (result) {
                    $this.configs.$willExpireLabel.html($this.configs.$willExpireLabel.html().replace("{months}", result.expire));
                    if (result.expireAgain == "1") {
                        $this.configs.$willExpireAgainLabel.html("Licence will expire in 1 month");
                    } else {
                        $this.configs.$willExpireAgainLabel.html($this.configs.$willExpireAgainLabel.html().replace("{months}", result.expireAgain));
                    }
                }
            });
        }
    };
}