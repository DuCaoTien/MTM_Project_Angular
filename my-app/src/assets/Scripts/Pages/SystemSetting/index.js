$(document).ready(function () {
    var shippingMap,
        billingMap;

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

    function initBillingAddress() {
        if (billingMap) return;
        billingMap = geoMap.getMap("map_billing_address");
        var $btnReloadBillingAddress = $("#btnReloadBillingAddress");

        if ($btnReloadBillingAddress) {
            $btnReloadBillingAddress.on("click", function () {
                geoMap.loadMap(billingMap, getBillingAddress());
            });
        }

        geoMap.loadMap(billingMap, getBillingAddress());
    }

    function loadMap(target) {
        switch (target) {
            case "#general-setting": {
                initShippingAddress();
                initBillingAddress();
                break;
            }
        }
    }

    $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        var target = $(e.target).attr("href");
        loadMap(target);
    });

    loadMap(getActiveTab());
});

function getShippingAddress() {
    var $address1 = $("#ShippingAddress_Address1"),
        $address2 = $("#ShippingAddress_Address2"),
        $city = $("#ShippingAddress_City"),
        $state = $("#ShippingAddress_StateId");

    var selectedState = $state.find("option:selected");
    var state = !selectedState ? "" : selectedState.text();

    return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
}

function getBillingAddress() {
    var $address1 = $("#BillingAddress_Address1"),
        $address2 = $("#BillingAddress_Address2"),
        $city = $("#BillingAddress_City"),
        $state = $("#BillingAddress_StateId");

    var selectedState = $state.find("option:selected");
    var state = !selectedState ? "" : selectedState.text();

    return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
}

function getActiveTab() {
    var activeLi = $(".nav-tabs li.active");
    var aTag = !activeLi ? null : activeLi.find("a");
    return !aTag ? "" : aTag.attr("href");
}