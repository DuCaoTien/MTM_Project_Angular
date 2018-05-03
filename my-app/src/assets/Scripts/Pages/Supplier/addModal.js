function addSupplier() {
    const $form = $('#add_supplier_form');
    var formData = JSON.stringify($form.serializeObjectX());
    if ($form != null && $form.valid()) {
        $.ajax({
            type: "POST",
            url: apiUrl.supplier.addWithReturnId,
            data: formData,
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                showAjaxSuccessMessage(response.message);
                if (response.value != 0) {
                    $('#SupplierId').append($('<option>', {
                        value: response.value,
                        text: response.text,
                        selected: true
                    }));
                    $('#AddSupplierModal').modal('toggle');
                    resetForm('add_supplier_form');
                }
            },
            error: function (response) {
                if (typeof (response.responseJSON) !== 'undefined') {
                    showAjaxFailureMessage(response.message.responseJSON);
                }
                else {
                    showAjaxFailureMessage(response.message.statusText);
                }
            }
        });
    }


}