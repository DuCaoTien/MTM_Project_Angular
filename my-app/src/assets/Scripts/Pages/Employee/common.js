var employeeCommonConfigs = {
    elements: {
        $systemAccessWeb: $("#SystemAccesses_3"),
        $status: $("#Status")
    },
    statuses: {
        active: 1,
        terminate: 2
    },
    permissions: {
        webAccess: "SystemAccesses",
        web: "Permission",
        mobile: "ProfileTypes"
    }
}

var employeeCommonFunctions = {
    initPage: function () {
        //employeeCommonConfigs.elements.$status.trigger("change");
        employeeCommonFunctions.triggerElement(employeeCommonConfigs.elements.$systemAccessWeb.is(":checked"), employeeCommonConfigs.permissions.web);

        //Init event
        employeeCommonConfigs.elements.$systemAccessWeb.on("change",
            function() {
                employeeCommonFunctions.triggerElement(employeeCommonConfigs.elements.$systemAccessWeb
                    .is(":checked"),employeeCommonConfigs.permissions.web);
            });
        //Init event
        //employeeCommonConfigs.elements.$status.change(function () {
        //    if ($(this).val() == employeeCommonConfigs.statuses.active) {
        //        employeeCommonFunctions.triggerElement(true,employeeCommonConfigs.permissions.web);
        //        employeeCommonFunctions.triggerElement(true,employeeCommonConfigs.permissions.mobile);
        //        employeeCommonFunctions.triggerElement(true,employeeCommonConfigs.permissions.webAccess);
        //    } else {
        //        employeeCommonFunctions.triggerElement(false,employeeCommonConfigs.permissions.web);
        //        employeeCommonFunctions.triggerElement(false,employeeCommonConfigs.permissions.mobile);
        //        employeeCommonFunctions.triggerElement(false,employeeCommonConfigs.permissions.webAccess);
        //    }
        //});
    },
    triggerElement: function (isChecked, elementName) {
        if (isChecked) {
            $(`input[name='${elementName}']`).each(function () {
                $(this).removeAttr("disabled");
            });
        } else {
            $(`input[name='${elementName}']`).each(function () {
                employeeCommonFunctions.disable(this);
            });
        }
    },
    disable: function(element) {
        $(element).removeAttr("checked");
        $($(element).parents()[0]).removeClass("checked");
        $(element).attr("disabled", "disabled");
    }
}