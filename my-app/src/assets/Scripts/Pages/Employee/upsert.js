var $status,
    $permission,
    $systemAccess,
    $systemAccessWeb,
    $systemAccessMobile;

$(document).ready(function () {
    $status = $("#Status"),
        $permission = $("#Permission"),
        $systemAccess = $("#SystemAccess"),
        $systemAccessWeb = $("#SystemAccesses_3"),
        $systemAccessMobile = $("#SystemAccesses_4"),
    init();
});

function init() {
    triggerPermission(false);

    $status.on("change", function () {
        var statusValue = $status.val();
        if (statusValue == userStatuses.terminated.id) {
            triggerSystemAccess($systemAccessWeb, true);
            triggerSystemAccess($systemAccessMobile, true);
            triggerPermission(false);
        } else {
            triggerSystemAccess($systemAccessWeb, false);
            triggerSystemAccess($systemAccessMobile, false);
        }
    });

    $systemAccessWeb.on('change', function () {
        triggerPermission($systemAccessWeb.is(':checked'));
    });
}// R

function triggerPermission(isChecked) {
    if (isChecked) {
        getPermissionOption(roles.guest.id).hide();
        getPermissionOption(roles.admin.id).show();
        getPermissionOption(roles.operation.id).show();
        getPermissionOption(roles.account.id).show();

        if ($permission.val() == roles.guest.id) {
            $permission.val(roles.admin.id);
            getPermissionOption(roles.admin.id).attr("selected", "selected");
        }
    } else {
        getPermissionOption(roles.guest.id).show();
        getPermissionOption(roles.admin.id).hide();
        getPermissionOption(roles.operation.id).hide();
        getPermissionOption(roles.account.id).hide();

        if ($permission.val() != roles.guest.id) {
            $permission.val(roles.guest.id);
            getPermissionOption(roles.guest.id).attr("selected", "selected");
        }
    }
}// R

function getPermissionOption(permission) {
    return $permission.find('option[value="' + permission + '"]');
}// R

function triggerSystemAccess($checkbox, isDisabled, isAddClass) {
    if (!$checkbox) return;
    $checkbox.attr('checked', !isDisabled).change();
    if (isDisabled) $checkbox.closest('span').removeClass('checked');
    else if (isAddClass) $checkbox.closest('span').addClass('checked');
    triggerDisable($checkbox, isDisabled);
}// R

//systemAccesses is global variable
function populateSystemAccess(userStatus, systemAccess) {
    if (systemAccess == systemAccesses.all.id) {
        triggerClick($systemAccessWeb);
        triggerClick($systemAccessMobile);
    } else if (systemAccess == systemAccesses.web.id) {
        triggerClick($systemAccessWeb);
    } else if (systemAccess == systemAccesses.mobile.id) {
        triggerClick($systemAccessMobile);
    }

    if (userStatus == userStatuses.terminated.id) {
        triggerDisable($systemAccessWeb, true);
        triggerDisable($systemAccessMobile, true);
        triggerPermission(false);
    }
}

function populateAddress() {
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
}

//function getProfileType($profileTypes, profileTypeValue) {
//    for (var i = 0; i < $profileTypes.length; i++) {
//        var $profileType = $($profileTypes[i]);

//        if ($profileType.val() == profileTypeValue)
//            return $profileType;
//    }
//}

function triggerDisable($element, isDisabled) {
    if (!$element) return;
    $element.attr("disabled", isDisabled);
}// R

function triggerClick($element) {
    if (!$element) return;
    $element.trigger('click');
}

function getHomeAddress() {
    var $address1 = $("#HomeAddress_Address1"),
        $address2 = $("#HomeAddress_Address2"),
        $city = $("#HomeAddress_City"),
        $state = $("#HomeAddress_StateId");

    var selectedState = $state.find("option:selected");
    var state = !selectedState ? "" : selectedState.text();

    return getGeoAddress($address1.val() || $address2.val(), $city.val(), state);
}