function addShift() {
    const $form = $('#add_shift_form');
    var formData = JSON.stringify($form.serializeObjectX());
    if ($form.valid()) {
        $.ajax({
            type: "POST",
            url: apiUrl.shift.add,
            data: formData,
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                showAjaxSuccessMessage(response);
                 $("#AddShiftModal").modal('toggle');
                 resetForm('add_shift_form');
                configs.$datatable.DataTable().ajax.reload(null, false);
            },
            error: function (response) {
                if (typeof (response.responseJSON) !== 'undefined') {
                    showAjaxFailureMessage(response.responseJSON);
                }
                else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            }
        });
    }
}
