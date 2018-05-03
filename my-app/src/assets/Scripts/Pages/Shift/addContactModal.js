function AddContactModal() {
    const $this = this;

    $this.configs = {
        modalId: null,
        formId: null,
        selectId: null,
        url: {
            add: null
        }
    };

    $this.funcs = {
        init: function (cfgs) {
            $this.configs = cfgs;
        },
        add: function () {
            var $form = $(`#${$this.configs.formId}`);
            if ($form != null && $form.valid()) {
                updateCheckboxValue($form);

                let formData = JSON.stringify($form.serializeObjectX());

                $.ajax({
                    type: "POST",
                    url: $this.configs.url.add,
                    data: formData,
                    dataType: "json",
                    contentType: "application/json",
                    success: function (response) {
                        showAjaxSuccessMessage(response.message);
                        if (response.value !== 0) {
                            $($this.configs.selectId).append($('<option>',
                                {
                                    value: response.value,
                                    text: response.text,
                                    selected: true
                                }));
                            $(`#${$this.configs.modalId}`).modal('toggle');
                            resetForm($this.configs.formId);
                        }
                    },
                    error: function (response) {
                        if (typeof (response.responseJSON) !== 'undefined') {
                            showAjaxFailureMessage(response.responseJSON.message);
                        } else {
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
    };
}

addContactModal = {
    configs: {
        modalId: null,
        formId: "add_contact_form",
        selectId: null,
        url: {
            add: apiUrl.contact.add
        }
    },
    init: function (configs) {
        addContactModal.configs = configs;
    },
    add: function () {
        var $form = $(`#${addContactModal.configs.formId}`);
        if ($form != null && $form.valid()) {
            updateCheckboxValue($form);

            let formData = JSON.stringify($form.serializeObjectX());

            $.ajax({
                type: "POST",
                url: addContactModal.configs.url.add,
                data: formData,
                dataType: "json",
                contentType: "application/json",
                success: function (response) {
                    showAjaxSuccessMessage(response.message);
                    if (response.value !== 0) {
                        $(`#${addContactModal.configs.selectId}`).append($('<option>',
                            {
                                value: response.value,
                                text: response.text,
                                selected: true
                            }));
                        $(`#${addContactModal.configs.modalId}`).modal('toggle');
                        resetForm(addContactModal.configs.formId);
                    }
                },
                error: function (response) {
                    if (typeof (response.responseJSON) !== 'undefined') {
                        showAjaxFailureMessage(response.responseJSON.message);
                    } else {
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
}