    var addConfigData = {};

function addConfig(configModel, callbackFuncs) {
    var $modal = $(`#${configModel.modalId}`);
    var $form = $(`#${configModel.formId}`);
    var $parentModal = $('#EditContactModal');
    if (!$parentModal.hasClass('in')) {
        $parentModal = $('#AddContactModal');
    }
    if ($parentModal.length == 0) {
        $parentModal = $("body");
    }
    var $callbackId = $parentModal.find(`#${configModel.callbackId}`).length > 0 ? $parentModal.find(`#${configModel.callbackId}`) : $("body").find(`#${configModel.callbackId}`);
    var formData = JSON.stringify($form.serializeObjectX());

    if ($form != null && $form.valid()) {
        $.ajax({
            type: "POST",
            url: apiUrl.configurations.addPartial,
            data: formData,
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                showAjaxSuccessMessage(`${configModel.modalName} has been saved successfully`);

                try{
                    callbackFuncs(response);
                }catch(err){

                }

                $callbackId.append($('<option>', {
                    value: response.id,
                    text: response.configValue,

                    selected: true
                }));
                $callbackId.trigger("change");
                $modal.modal('toggle');
                resetForm(configModel.formId);
            },
            error: function (response) {
                showAjaxFailureMessage(`Save ${configModel.modalName} fail, please try again!`);
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