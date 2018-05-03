var customerConfig = {
    shippingAddressMap: null,
    billingAddressMap: null,
    initContact: null,
    shippingAddressMapId: "map_shipping_address",
    billingAddressMapId: "map_billing_address",
    $btnReloadShippingAddressMap: $("#btnReloadShippingAddress"),
    $btnReloadBillingAddressMap: $("#btnReloadBillingAddress"),
    editContactFormId: "edit_contact_form",
    $editModal: $("#EditContactModal"),
    $editModalContent: $("#EditContactModalContent"),
    urls: {
        editContactPartial: apiUrl.contact.editPartial,
        editContact: apiUrl.contact.edit
    }
};

var customerFunctions = {
    initEvents: function () {
        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            const tabId = $(e.target).attr("href");

            customerFunctions.triggerEvents(tabId);
        });

        $(document).delegate(`.${contactConfigs.btnEditRow}`, "click", function (e) {
            e.preventDefault();
            const contactId = $(this).data("id");

            customerConfig.$editModalContent.load(`${customerConfig.urls.editContactPartial}/${contactId}`, function () {
                resetFormValidator(customerConfig.editContactFormId);
                $(`#${customerConfig.editContactFormId} select`).select2({
                    placeholder: "Select an option"
                });
                $(`#${customerConfig.editContactFormId} .select2-container`).each(function () {
                    $(this).removeClass('select2-container--bootstrap').addClass('select2-container--default');
                });
                customerConfig.$editModal.modal("show");
                customerConfig.$editModal.find("input:checkbox").uniform();
                customerConfig.$editModalContent.trigger("mouseover");
            });
        });
    },
    initPage: function () {
        customerFunctions.initEvents();
        customerFunctions.initMap(customerConfig.billingAddressMap, customerConfig.billingAddressMapId, customerConfig.$btnReloadBillingAddressMap, customerFunctions.getBillingAddress);
        customerFunctions.initMap(customerConfig.shippingAddressMap, customerConfig.shippingAddressMapId, customerConfig.$btnReloadShippingAddressMap, customerFunctions.getShippingAddress);
        // Trigger active tab
        const tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        customerFunctions.triggerEvents(tabId);
    },
    triggerEvents: function (tabId) {
        switch (tabId) {
            case "#contacts": {
                if (customerConfig.initContact) return;
                contactConfigs.isInTag = true;
                contactFunctions.initPage();
                customerConfig.initContact = true;
                break;
            }
            case "#shifts": {
                break;
            }
            case "#documents": {
                attachmentConfigs.attachmentType = "document";
                attachmentFunctions.initPage(customParam);
                break;
            }
            case "#system-note": {
                break;
            }
            default: {
                break;
            }
        }
    },
    initMap: function (customerMap, geoMapId, $btnReloadMap, getAddressCallback) {
        if (customerMap) return;

        customerMap = geoMap.getMap(geoMapId);

        $btnReloadMap.on("click", function () {
            geoMap.loadMap(customerMap, getAddressCallback());
        });

        geoMap.loadMap(customerMap, getAddressCallback());
    },
    /* Helper Methods */
    getShippingAddress: function () {
        const $address1 = $("#ShippingAddress_Address1");
        const $address2 = $("#ShippingAddress_Address2");
        const $city = $("#ShippingAddress_City");
        const $state = $("#ShippingAddress_StateId");

        const selectedState = $state.find("option:selected");
        const state = !selectedState ? "" : selectedState.text();

        return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
    },
    getBillingAddress: function () {
        const $address1 = $("#BillingAddress_Address1");
        const $address2 = $("#BillingAddress_Address2");
        const $city = $("#BillingAddress_City");
        const $state = $("#BillingAddress_StateId");

        const selectedState = $state.find("option:selected");
        const state = !selectedState ? "" : selectedState.text();

        return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
    },
    onSavedContactAndClose: function (modalId,formId) {
        contactConfigs.$table.DataTable().ajax.reload(null, false);
        $(`#${modalId}`).modal("hide");
        resetForm(formId);
    },
    editContactMore: function () {
        const contactId = $(`#${customerConfig.editContactFormId}`).find("#Id").val();
        if (contactId) {
            window.location.href = `${customerConfig.urls.editContact}/${contactId}?directly=true`;
        }
    }
}

$(document).ready(function () {
    customerFunctions.initPage();
});