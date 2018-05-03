var mapConfig = {
    homeAddress: {
        map : null,
        mapId: "map_home_address",
        $btnReload: $("#btnReloadHomeAddress"),
    },
    billingAddress: {
        map: null,
        mapId:"map_billing_address",
        $btnReload : $("#btnReloadBillingAddress")
    },
    shippingAddress: {
        map: null,
        mapId:"map_shipping_address",
        $btnReload : $("#btnReloadShippingAddress")
    },
    siteAddress: {
        map: null,
        mapId:"map_site_address",
        $btnReload : $("#btnReloadSiteAddress")
    }
}
var mapFunction = {
    load: function () {
        if (mapConfig.homeAddress.$btnReload.length > 0 ) {
            mapFunction.initMap(mapConfig.homeAddress.map, mapConfig.homeAddress.mapId, mapConfig.homeAddress.$btnReload, mapFunction.getHomeAddress);
        }
        if (mapConfig.billingAddress.$btnReload.length > 0) {
            mapFunction.initMap(mapConfig.billingAddress.map, mapConfig.billingAddress.mapId, mapConfig.billingAddress.$btnReload, mapFunction.getBillingAddress);
        }
        if (mapConfig.shippingAddress.$btnReload.length > 0) {
            mapFunction.initMap(mapConfig.shippingAddress.map, mapConfig.shippingAddress.mapId, mapConfig.shippingAddress.$btnReload, mapFunction.getShippingAddress);
        }
        if (mapConfig.siteAddress.$btnReload.length > 0) {
            mapFunction.initMap(mapConfig.siteAddress.map, mapConfig.siteAddress.mapId, mapConfig.siteAddress.$btnReload, mapFunction.getSiteAddress);
        }
    },
    initMap: function(customerMap, geoMapId, $btnReloadMap, getAddressCallback) {
        if (customerMap) return;
        customerMap = geoMap.getMap(geoMapId);

        $btnReloadMap.on("click", function () {
            geoMap.loadMap(customerMap, getAddressCallback());
        });

        geoMap.loadMap(customerMap, getAddressCallback());
    },
    getHomeAddress: function () {
        var $address1 = $("#HomeAddress_Address1"),
            $address2 = $("#HomeAddress_Address2"),
            $city = $("#HomeAddress_City"),
            $state = $("#HomeAddress_StateId");

        var selectedState = $state.find("option:selected");
        var state = !selectedState ? "" : selectedState.text();

        return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
    },
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
    getSiteAddress: function () {
        const $address1 = $("#SiteAddress_Address1");
        const $address2 = $("#SiteAddress_Address2");
        const $city = $("#SiteAddress_City");
        const $state = $("#SiteAddress_StateId");

        const selectedState = $state.find("option:selected");
        const state = !selectedState ? "" : selectedState.text();

        return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
    }
}
$(function() {
    mapFunction.load();
})