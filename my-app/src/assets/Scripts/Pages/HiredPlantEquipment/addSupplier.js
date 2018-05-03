function addSupplier(equipmentId) {
    const $form = $('#add_supplier_form');

    var objectData = $form.serializeObjectX();
    var equipment = "" + equipmentId;
    if (typeof (objectData.SupplierTypes) === "undefined") {
        objectData.SupplierTypes = equipment;
    } else if (objectData.SupplierTypes.length < 2) {
        var temp = objectData.SupplierTypes;
        objectData.SupplierTypes = [];
        objectData.SupplierTypes.push(temp);
        objectData.SupplierTypes.push(equipment);
    } else {
        objectData.SupplierTypes.push(equipment);
    }

    var formData = JSON.stringify(objectData);
    if ($form.valid()) {
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
                   $(`#SupplierTypes_${equipmentId}`).attr('checked', true);
                   $(`#SupplierTypes_${equipmentId}`).closest('span').addClass('checked');
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