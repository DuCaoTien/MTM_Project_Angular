var supplierConfig = {
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

var supplierFunctions = {
    initEvents: function () {
        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            var tabId = $(e.target).attr("href");

            supplierFunctions.triggerEvents(tabId);
        });

        $(document).delegate(`.${contactConfigs.btnEditRow}`, "click", function (e) {
            e.preventDefault();
            const contactId = $(this).data("id");

            supplierConfig.$editModalContent.load(`${supplierConfig.urls.editContactPartial}/${contactId}`, function () {
                resetFormValidator(supplierConfig.editContactFormId);
                $(`#${supplierConfig.editContactFormId} select`).select2({
                    placeholder: "Select an option"
                });
                $(`#${supplierConfig.editContactFormId} .select2-container`).each(function () {
                    $(this).removeClass('select2-container--bootstrap').addClass('select2-container--default');
                });
                supplierConfig.$editModal.modal("show");
                supplierConfig.$editModal.find("input:checkbox").uniform();
            });
        });
    },
    initPage: function () {
        supplierFunctions.initEvents();
        supplierFunctions.initMap(supplierConfig.billingAddressMap, supplierConfig.billingAddressMapId, supplierConfig.$btnReloadBillingAddressMap, supplierFunctions.getBillingAddress);
        // Trigger active tab
        var tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        supplierFunctions.triggerEvents(tabId);
    },
    triggerEvents: function (tabId) {
        switch (tabId) {
            case "#contacts": {
                if (supplierConfig.initContact) return;
                contactConfigs.isInTag = true;
                contactFunctions.initPage();
                supplierConfig.initContact = true;
                break;
            }
            case "#documents": {
                attachmentConfigs.attachmentType = "document";
                attachmentFunctions.initPage(customParam);
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
        var $address1 = $("#ShippingAddress_Address1"),
            $address2 = $("#ShippingAddress_Address2"),
            $city = $("#ShippingAddress_City"),
            $state = $("#ShippingAddress_StateId");

        var selectedState = $state.find("option:selected");
        var state = !selectedState ? "" : selectedState.text();

        return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
    },
    getBillingAddress: function () {
        var $address1 = $("#BillingAddress_Address1"),
            $address2 = $("#BillingAddress_Address2"),
            $city = $("#BillingAddress_City"),
            $state = $("#BillingAddress_StateId");

        var selectedState = $state.find("option:selected");
        var state = !selectedState ? "" : selectedState.text();

        return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
    },
    onSavedContactAndClose: function (modalId, formId) {
        contactConfigs.$table.DataTable().ajax.reload(null, false);
        $(`#${modalId}`).modal("hide");
        resetForm(formId);
    },
    editContactMore: function () {
        const contactId = $(`#${supplierConfig.editContactFormId}`).find("#Id").val();
        if (contactId) {
            window.location.href = `${supplierConfig.urls.editContact}/${contactId}?directly=true`;
        }
    }
}

$(document).ready(function () {
    supplierFunctions.initPage();
});