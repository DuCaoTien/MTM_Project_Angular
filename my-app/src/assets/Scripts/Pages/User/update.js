$(document).ready(function () {
    var homeMap;

    function initHomeAddress() {
        if (homeMap) return;
        homeMap = geoMap.getMap("map_home_address");
        var $btnReloadHomeAddress = $("#btnReloadHomeAddress");

        if ($btnReloadHomeAddress) {
            $btnReloadHomeAddress.on("click", function () {
                geoMap.loadMap(homeMap, getHomeAddress());
            });
        }

        geoMap.loadMap(homeMap, getHomeAddress());
    }

    function loadMap(target) {
        switch (target) {
            case "#home_address": {
                initHomeAddress();
                break;
            }
        }
    }

    $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        var target = $(e.target).attr("href");
        loadMap(target);
    });

    loadMap(getActiveTab());

    $(".mpHomePhone").inputmask({ "mask": "09 9999 9999" });
    $(".mpMobilePhone").inputmask({ "mask": "0499 999 999" });
    $(".mpNextKinPhone").inputmask({ regex: "\\d*" });
});

function getHomeAddress() {
    var $address1 = $("#HomeAddress_Address1"),
        $address2 = $("#HomeAddress_Address2"),
        $city = $("#HomeAddress_City"),
        $state = $("#HomeAddress_StateId");

    var selectedState = $state.find("option:selected");
    var state = !selectedState ? "" : selectedState.text();

    return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
}