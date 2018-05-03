function Shift2Supplier(parentSelector, shift2Suppliers) {
    const $this = this;
    $this.parentSelector = parentSelector;
    $this.shift2Suppliers = shift2Suppliers;

    function findElement(selector) {
        if (!$this.parentSelector) return selector;
        return `${$this.parentSelector} ${selector}`;
    }

    $this.configs = {
        $addShift2SupplierSection: $(findElement("#addShift2SupplierSection")),
        urls: {
            getAvailableSupplier: apiUrl.supplier.getAvailableSupplier,
            delete: ""
        },
        element: {
            $shift2SupplierFormHtml: $(findElement("#shift2SupplierFormHtml")),
            $shift2SupplierOptionHtml: $(findElement("#shift2SupplierOptionHtml")),
            form: {
                formContentId: "addShiftSupplierContent",
                $formContent: $(findElement("#addShiftSupplierContent")),
                newRowId: "new-row",
                shiftId: "ShiftId"
            },
            btn: {
                btnSaveId: "btnSaveShift2Supplier",
                $btnSave: $(findElement("#btnSaveShift2Supplier"))
            }
        },
        availableSuppliers: [],
        firstLoad: true
    };

    $this.funcs = {
        reset: function() {
            $(findElement("#addShiftSupplierContent")).html('');
        },

        getData: function () {
            // Contractors
            var contractors = $this.funcs.getShift2Suppliers();
            if (contractors.length > 0) {
                $(findElement("#Schedule_ContractorJSONs")).val(JSON.stringify(contractors));
            } else {
                $(findElement("#Schedule_ContractorJSONs")).val('');
            }

            // Worlogs
            var worklogs = $this.funcs.getLogworks();
            if (worklogs.length > 0) {
                $(findElement("#Schedule_WorklogJSONs")).val(JSON.stringify(worklogs));
            }

            // Unknown Worklogs
            var unknowWorklogs = $this.funcs.getUnKnownWorklogs();//shiftFunctions.getCurrentUnKnowWorklogs();
            if (unknowWorklogs.length > 0) {
                $(findElement("#Schedule_UnKnowWorklogJSONs")).val(JSON.stringify(unknowWorklogs));
            }
        },

        initPage: function (shiftId) {
            $this.configs.shiftId = shiftId;
            if ($this.configs.firstLoad === false) return;

            $this.funcs.getAvailableSupplier();
            $this.funcs.renderDefaultOptions();

            $this.configs.firstLoad = false;
        },

        rebuildWorklogs: function() {
            if ($('#AddRecurrenceShiftModal').hasClass('in')) {
                addJobRecurrenceShift.funcs.rebuildWorklogTable();
            } else {
                addJobShift.funcs.rebuildWorklogTable();
            }
        },

        getLogworks: function () {
            var result = null;
            if ($('#AddRecurrenceShiftModal').hasClass('in')) {
                result = addJobRecurrenceShift.funcs.getCurrentWorklogs(-1);
            } else {
                result = addJobShift.funcs.getCurrentWorklogs(-1);
            }
            return result;
        },

        getUnKnownWorklogs: function () {
            var result = null;
            if ($('#AddRecurrenceShiftModal').hasClass('in')) {
                result = addJobRecurrenceShift.funcs.getCurrentUnKnownWorklogs();
            } else {
                result = addJobShift.funcs.getCurrentUnKnownWorklogs();
            }
            return result;
        },

        addOption: function (optionIndex, item) {
            optionIndex = optionIndex ? optionIndex : $this.funcs.getOptions().length + 1;
            const $option = $($this.funcs.getRowHtml());
            const $supplierId = $option.find("select");
            const $quantity = $option.find("input");
            const $btnRemove = $option.find(".btn-remove-contractor");

            $btnRemove.click(function () {
                $this.funcs.removeOption(this);
            });

            // Add custom class
            $supplierId.addClass("edited");
            $quantity.addClass("edited");

            $quantity.change(function () {
                $this.funcs.rebuildWorklogs();
            });

            // Init event
            $supplierId.on("change", function () {
                $this.funcs.rebuildWorklogs();

                const selectedSupplierIds = $this.funcs.getSelectedSupplierIds();
                $this.funcs.updateSelectBox($this.configs.availableSuppliers || [], selectedSupplierIds || []);
            });

            $option.find(".column-number").html(optionIndex);
            $this.funcs.setSelectOptions($supplierId, $this.configs.availableSuppliers, !item ? null : item.supplierId);
            $this.configs.$addShift2SupplierSection.find(`#${$this.configs.element.form.formContentId}`).append($option);

            // Edit mode
            if (item) {
                $quantity.val(item.quantity);
            } else {
                $quantity.val(1);
            }

            $this.funcs.updateOptionTemplate();
            const selectedSupplierIds = $this.funcs.getSelectedSupplierIds();
            $this.funcs.updateSelectBox($this.configs.availableSuppliers || [], selectedSupplierIds || []);
        },

        removeOption: function (e) {
            const rowCount = $this.funcs.getOptions().length;
            if (rowCount === 1) {
                $(findElement(".btn-add-option")).prop("disabled", false);
            };

            e.closest(".new-row").remove();
            const selectedSupplierIds = $this.funcs.getSelectedSupplierIds();
            $this.funcs.updateSelectBox($this.configs.availableSuppliers || [], selectedSupplierIds || []);
            $this.funcs.updateOptionTemplate();
        },

        getRowHtml: function () {
            return $this.configs.element.$shift2SupplierOptionHtml.html();
        },

        getOptions: function () {
            return $this.configs.$addShift2SupplierSection.find(`#${$this.configs.element.form.formContentId} .${$this.configs.element.form.newRowId}`);
        },

        updateOptionTemplate: function () {
            var $options = $this.funcs.getOptions();

            $options.each(function (index, option) {
                const rowIndex = index + 1;
                const $option = $(option);

                $option.find(".column-number").html(rowIndex);
                $(findElement(".btn-add-option")).hide();
                $(findElement(".btn-add-option")).prop("disabled", false);

                if (index === $options.length - 1) {
                    $(findElement(".btn-add-option")).show();
                }
            });

            if ($options.length === $this.configs.availableSuppliers.length) {
                $(findElement(".btn-add-option")).prop("disabled", true);
            }

            $this.funcs.rebuildWorklogs();
        },

        updateSelectBox: function (list, selectedIds) {
            list.forEach(function (item) {
                item.enabled = true;
            });

            selectedIds.forEach(function (id) {
                const option = list.find(function (item) {
                    return item.id === id;
                });

                if (option != null) option.enabled = false;
            });

            const $option = $this.funcs.getOptions().find("select");
            $option.each(function () {
                $this.funcs.updateSelectOptions($(this), list);
            });
        },

        getAvailableSupplier: function () {
            $.ajax({
                url: $this.configs.urls.getAvailableSupplier,
                type: "GET",
                async: false,
                success: function (result) {
                    const data = result || [];
                    $this.configs.availableSuppliers = data.map(function (item) {
                        return {
                            id: item.id,
                            text: item.text,
                            enabled: true
                        }
                    });
                }
            });
        },

        setSelectOptions: function ($element, list, selectedItem) {
            $element.find("option").remove();

            list = list || [];

            list = list.filter(function (item) {
                return item.enabled == true;
            });

            list.forEach(function (item, index) {
                $element
                    .append($("<option></option>")
                        .attr("value", item.id)
                        .text(item.text));

                if (index === 0 && !selectedItem) {
                    item.enabled = false;
                    $element.val(item.id);
                }
            });

            if (selectedItem) {
                $element.val(selectedItem);
                const item = list.find(function (listItem) {
                    return listItem.id == selectedItem;
                });
                if (item) item.enabled = false;
            }

            $element.select2();
        },

        updateSelectOptions: function ($element, list) {
            const $options = $element.find("option");
            if (!$options || $options.length === 0) return;

            $options.each(function () {
                const $option = $(this);
                if (!$option.is(":selected")) {
                    $option.remove();
                }
            });

            list = list || [];
            list = list.filter(function (item) {
                return item.enabled === true;
            });

            list.forEach(function (item) {
                $element
                    .append($("<option></option>")
                        .attr("value", item.id)
                        .text(item.text));
            });

            $element.trigger("change.select2");
        },

        removeSelectOption: function ($elements, value) {
            ($elements || []).each(function (index, $element) {
                $element.find(`option[value=${value}]`).remove();
            });
        },

        getSelectedSupplierIds: function () {
            const $selects = $this.funcs.getOptions().find("select");
            var selectedSupplierIds = [];

            $selects.each(function () {
                selectedSupplierIds.push(parseInt($(this).val()));
            });

            return selectedSupplierIds;
        },

        getShift2Suppliers: function () {
            const $options = $this.funcs.getOptions();
            var result = [];
            $options.each(function () {
                const $option = $(this);

                const supplierId = $option.find("select").val();
                const supplierName = $option.find("select option[value=" + supplierId + "]").text();
                const quantity = $option.find("input").val();
                const shiftId = $("#ShiftId").val();

                if (supplierId !== "" && parseFloat(supplierId) > 0) {
                    result.push({
                        SupplierId: supplierId,
                        SupplierName: supplierName,
                        Quantity: quantity,
                        ShiftId: shiftId
                    });
                }
            });

            return result;
        },

        renderDefaultOptions: function () {
            // Insert new mode
            if ($this.configs.availableSuppliers == null || $this.configs.availableSuppliers.length === 0) {
                $(findElement(".btn-add-option")).prop("disabled", false);
                return;
            }

            // Edit mode
            $this.shift2Suppliers.shift2Supplier.forEach(function (item, index) {
                const optionIndex = index + 1;
                $this.funcs.addOption(optionIndex, item);
            });
        }
    };
}

var shift2SupplierConfigs = {
    $addShift2SupplierSection: $("#addShift2SupplierSection"),
    urls: {
        getAvailableSupplier: apiUrl.supplier.getAvailableSupplier,
        delete: "",
    },
    element: {
        $shift2SupplierFormHtml: $("#shift2SupplierFormHtml"),
        $shift2SupplierOptionHtml: $("#shift2SupplierOptionHtml"),
        form: {
            formContentId: "addShiftSupplierContent",
            $formContent: $("#addShiftSupplierContent"),
            newRowId: "new-row",
            shiftId: "ShiftId"
        },
        btn: {
            btnSaveId: "btnSaveShift2Supplier",
            $btnSave: $("#btnSaveShift2Supplier")
        }
    },
    availableSuppliers: [],
    firstLoad: true
};

var shift2SupplierFunctions = {
    save: function (url, formId, replaceText, callback, args) {
        var contractors = shift2SupplierFunctions.getShift2Suppliers();
        if (contractors.length > 0) {
            $("#Schedule_ContractorJSONs").val(JSON.stringify(contractors));
        } else {
            $("#Schedule_ContractorJSONs").val('');
        }
        var worklogs = shiftFunctions.getCurrentWorklogs(-1);
        if (worklogs.length > 0) {
            $("#Schedule_WorklogJSONs").val(JSON.stringify(worklogs));
        }
        var unknowWorklogs = shiftFunctions.getCurrentUnKnowWorklogs();
        if (unknowWorklogs.length > 0) {
            $("#Schedule_UnKnowWorklogJSONs").val(JSON.stringify(unknowWorklogs));
        }

        // Replace team leader ID
        var $form = $('#' + formId);
        var $teamLeaderId = $form.find('#Schedule_TeamLeaderId');
        var teamLeaderId = ($form.find('#Schedule_TeamLeaderId').val()+"").replace("[Team Leader - select if TL unknown]", "");
        $teamLeaderId.val(teamLeaderId);

        submitAjaxForm(url, formId, replaceText, callback, args);
    },

    initPage: function (shiftId) {
        shift2SupplierConfigs.shiftId = shiftId;
        if (shift2SupplierConfigs.firstLoad === false) return;

        shift2SupplierFunctions.getAvailableSupplier();
        shift2SupplierFunctions.renderDefaultOptions();

        shift2SupplierConfigs.firstLoad = false;
    },

    addOption: function (optionIndex, item, isRebuildTable) {
        optionIndex = optionIndex ? optionIndex : shift2SupplierFunctions.getOptions().length + 1;
        const $option = $(shift2SupplierFunctions.getRowHtml());
        const $supplierId = $option.find("select");
        const $quantity = $option.find("input");
        const $btnRemove = $option.find(".btn-remove-contractor");

        $btnRemove.click(function () {
            shift2SupplierFunctions.removeOption(this);
        });

        $quantity.change(function () {
            shift2SupplierFunctions.updateOptionTemplate();
        });

        // Add custom class
        $supplierId.addClass("edited");
        $quantity.addClass("edited");

        // Init event
        $supplierId.on("change", function () {
            shift2SupplierFunctions.updateOptionTemplate();

            const selectedSupplierIds = shift2SupplierFunctions.getSelectedSupplierIds();
            shift2SupplierFunctions.updateSelectBox(shift2SupplierConfigs.availableSuppliers || [], selectedSupplierIds || []);
        });

        $option.find(".column-number").html(optionIndex);
        shift2SupplierFunctions.setSelectOptions($supplierId, shift2SupplierConfigs.availableSuppliers, !item ? null : item.supplierId);
        shift2SupplierConfigs.$addShift2SupplierSection.find("#" + shift2SupplierConfigs.element.form.formContentId).append($option);

        // Edit mode
        if (item) {
            $quantity.val(item.quantity);
        } else {
            $quantity.val(1);
        }
        
        shift2SupplierFunctions.updateOptionTemplate(isRebuildTable);

        const selectedSupplierIds = shift2SupplierFunctions.getSelectedSupplierIds();
        shift2SupplierFunctions.updateSelectBox(shift2SupplierConfigs.availableSuppliers || [], selectedSupplierIds || []);
    },

    removeOption: function (obj) {
        const rowCount = shift2SupplierFunctions.getOptions().length;
        if (rowCount === 1) {
            $(".btn-add-option").prop("disabled", false);
        };

        $(obj).closest(".new-row").remove();
        const selectedSupplierIds = shift2SupplierFunctions.getSelectedSupplierIds();
        shift2SupplierFunctions.updateSelectBox(shift2SupplierConfigs.availableSuppliers || [], selectedSupplierIds || []);
        shift2SupplierFunctions.updateOptionTemplate();
    },

    getRowHtml: function () {
        return shift2SupplierConfigs.element.$shift2SupplierOptionHtml.html();
    },

    getOptions: function () {
        return shift2SupplierConfigs.$addShift2SupplierSection.find("#" + shift2SupplierConfigs.element.form.formContentId + " ." + shift2SupplierConfigs.element.form.newRowId);
    },

    updateOptionTemplate: function (isRebuildTable) {
        var $options = shift2SupplierFunctions.getOptions();

        $options.each(function (index, option) {
            const rowIndex = index + 1;
            const $option = $(option);

            $option.find(".column-number").html(rowIndex);
            $(".btn-add-option").hide();
            $(".btn-add-option").prop("disabled", false);

            if (index == $options.length - 1) {
                $(".btn-add-option").show();
            }
        });

        if ($options.length == shift2SupplierConfigs.availableSuppliers.length) {
            $(".btn-add-option").prop("disabled", true);
        }

        if (isRebuildTable != true) {
            shiftFunctions.rebuildWorklogTable();
        }
    },

    updateSelectBox: function (list, selectedIds) {
        list.forEach(function (item) {
            item.enabled = true;
        });

        selectedIds.forEach(function (id) {
            const option = list.find(function (item) {
                return item.id == id;
            });

            if (option != null) option.enabled = false;
        });

        const $option = shift2SupplierFunctions.getOptions().find("select");
        $option.each(function () {
            shift2SupplierFunctions.updateSelectOptions($(this), list);
        });
    },

    getAvailableSupplier: function () {
        $.ajax({
            url: shift2SupplierConfigs.urls.getAvailableSupplier,
            type: "GET",
            async: false,
            success: function (result) {
                const data = result || [];
                shift2SupplierConfigs.availableSuppliers = data.map(function (item) {
                    return {
                        id: item.id,
                        text: item.text,
                        enabled: true
                    }
                });
            }
        });
    },

    setSelectOptions: function ($element, list, selectedItem) {
        $element.find("option").remove();

        list = list || [];

        list = list.filter(function (item) {
            return item.enabled == true;
        });

        list.forEach(function (item, index) {
            $element
                .append($("<option></option>")
                    .attr("value", item.id)
                    .text(item.text));

            if (index === 0 && !selectedItem) {
                item.enabled = false;
                $element.val(item.id);
            }
        });

        if (selectedItem) {
            $element.val(selectedItem);
            const item = list.find(function (listItem) {
                return listItem.id == selectedItem;
            });
            if (item) item.enabled = false;
        }

        $element.select2();
    },

    updateSelectOptions: function ($element, list) {
        const $option = $element.find("option");
        if (!$option || $option.length === 0) return;

        $option.each(function () {
            const $option = $(this);
            if (!$option.is(":selected")) {
                $option.remove();
            }
        });

        list = list || [];
        list = list.filter(function (item) {
            return item.enabled === true;
        });

        list.forEach(function (item) {
            $element
                .append($("<option></option>")
                    .attr("value", item.id)
                    .text(item.text));
        });

        $element.trigger("change.select2");
    },

    removeSelectOption: function ($elements, value) {
        ($elements || []).each(function (index, $element) {
            $element.find(`option[value=${value}]`).remove();
        });
    },

    getSelectedSupplierIds: function () {
        const $selects = shift2SupplierFunctions.getOptions().find("select");
        var selectedSupplierIds = [];

        $selects.each(function () {
            selectedSupplierIds.push(parseInt($(this).val()));
        });

        return selectedSupplierIds;
    },

    getShift2Suppliers: function () {
        const $options = shift2SupplierFunctions.getOptions();
        var shift2Suppliers = [];
        $options.each(function () {
            const $option = $(this);

            const supplierId = $option.find("select").val();
            const supplierName = $option.find("select option[value=" + supplierId + "]").text();
            const quantity = $option.find("input").val();
            const shiftId = $("#ShiftId").val();

            if (supplierId != "" && parseFloat(supplierId) > 0) {
                shift2Suppliers.push({
                    SupplierId: supplierId,
                    SupplierName: supplierName,
                    Quantity: quantity,
                    ShiftId: shiftId,
                });
            }
        });

        return shift2Suppliers;
    },

    renderDefaultOptions: function () {
        // Insert new mode
        if (shift2SupplierConfigs.availableSuppliers == null || shift2SupplierConfigs.availableSuppliers.length <= 0) {
            $(".btn-add-option").prop("disabled", true);
            return;
        }

        // Edit mode
        shift2Suppliers.shift2Supplier.forEach(function (item, index) {
            const optionIndex = index + 1;
            shift2SupplierFunctions.addOption(optionIndex, item, true);
        });
        shift2SupplierFunctions.updateOptionTemplate();
    }
}