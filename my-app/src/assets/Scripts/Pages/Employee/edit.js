var employeeEditConfigs = {
    homeAddressMap: null,
    homeAddressMapId: "map_home_address",
    $btnReloadHomeAddressMap: $("#btnReloadHomeAddress"),
    systemAccesses: {}
}

var employeeEditFunctions = {
    checkTerminateUser: function() {
        if ($('#Status').val() == 2) {
            $('#DisplayInStaffList').attr('checked', false);
            $('#DisplayInStaffList').parents('.checker').find('>span').removeClass('checked');
            $('input[name=ProfileTypes]').attr('checked', false);
            $('input[name=ProfileTypes]').parents('.checker').find('>span').removeClass('checked');
            $('input[name=Permission]').attr('checked', false);
            $('input[name=Permission]').parents('.radio').find('>span').removeClass('checked');
            $('input[name=SystemAccesses]').attr('checked', false);
            $('input[name=SystemAccesses]').parents('.checker').find('>span').removeClass('checked');
        }
    },

    initPage: function () {
        employeeCommonFunctions.initPage();
        employeeEditFunctions.initEvents();
        employeeEditFunctions.initMap(employeeEditConfigs.homeAddressMap, employeeEditConfigs.homeAddressMapId, employeeEditConfigs.$btnReloadHomeAddressMap, employeeEditFunctions.getHomeAddress);
        // Trigger active tab
        var tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        employeeEditFunctions.triggerEvents(tabId);
    },

    initEvents: function () {
        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            var tabId = $(e.target).attr("href");

            employeeEditFunctions.triggerEvents(tabId);
        });

        $(".mpHomePhone").inputmask({ "mask": "09 9999 9999" });
        $(".mpMobilePhone").inputmask({"mask": "0499 999 999"});
    },

    triggerEvents: function (tabId) {
        switch (tabId) {
            case "#licence_details": {
                break;
            }
            case "#documents": {
                attachmentConfigs.attachmentType = "document";
                attachmentFunctions.initPage(customFilterDocumentParam);
                break;
            }
            case "#logs":
                if(logs_configs.$table == null)
                    logs_fncs.initPage();
                break;
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

    getHomeAddress: function () {
        var $address1 = $("#HomeAddress_Address1"),
           $address2 = $("#HomeAddress_Address2"),
           $city = $("#HomeAddress_City"),
           $state = $("#HomeAddress_StateId");

        var selectedState = $state.find("option:selected");
        var state = !selectedState ? "" : selectedState.text();

        return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
    },

    triggerDisable: function ($element, isDisabled) {
        if (!$element) return;
        $element.attr("disabled", isDisabled);
    },

    triggerClick: function ($element) {
        if (!$element) return;
        $element.trigger("click");
    }
}

$(document).ready(function () {
    employeeEditFunctions.initPage();
})