function addCustomer(callback) {
    const $form = $('#add_customer_form');
    var formData = JSON.stringify($form.serializeObjectX());
    if ($form != null && $form.valid()) {
        $.ajax({
            type: "POST",
            url: apiUrl.customer.addWithReturnId,
            data: formData,
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                showAjaxSuccessMessage(response.message);
                if (response.value != 0) {
                    $('#CustomerId').append($('<option>', {
                        value: response.value,
                        text: response.text,
                        selected: true
                    }));
                    $('#CustomerId').trigger("change");
                    $('#AddCustomerModal').modal('toggle');
                    resetForm('add_customer_form');
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
