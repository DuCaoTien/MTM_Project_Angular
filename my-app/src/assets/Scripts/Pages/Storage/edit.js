var storageConfig = {
};

var storageFunctions = {
    initEvents: function () {
        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            var tabId = $(e.target).attr("href");

            storageFunctions.triggerEvents(tabId);
        });
    },
    initPage: function () {
        storageFunctions.initEvents();

        // Trigger active tab
        var tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        storageFunctions.triggerEvents(tabId);
    },
    triggerEvents: function (tabId) {
        switch (tabId) {
            case "#documents": {
                attachmentConfigs.attachmentType = "document";
                attachmentFunctions.initPage(customParam);
                break;
            }
            case "#shipping-address": {
                initShippingAddress();
                break;
            }
            case "#plant-equipment": {
                plantEquipmentFunctions.initPage();
                break;
            }
            default: {
                break;
            }
        }
    }
}

$(document).ready(function () {
    storageFunctions.initPage();
});

var shippingMap;

function initShippingAddress() {
    if (shippingMap) return;
    shippingMap = geoMap.getMap("map_shipping_address");
    var $btnReloadShippingAddress = $("#btnReloadShippingAddress");

    if ($btnReloadShippingAddress) {
        $btnReloadShippingAddress.on("click", function () {
            geoMap.loadMap(shippingMap, getShippingAddress());
        });
    }

    geoMap.loadMap(shippingMap, getShippingAddress());
}

function getShippingAddress() {
    var $address1 = $("#ShippingAddress_Address1"),
        $address2 = $("#ShippingAddress_Address2"),
        $city = $("#ShippingAddress_City"),
        $state = $("#ShippingAddress_StateId");

    var selectedState = $state.find("option:selected");
    var state = !selectedState ? "" : selectedState.text();

    return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
}

function getActiveTab() {
    var activeLi = $(".nav-tabs li.active");
    var aTag = !activeLi ? null : activeLi.find("a");
    return !aTag ? "" : aTag.attr("href");
}