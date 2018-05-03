var onedPlantEquipmentConfig = {
};

var ownedPlantEquipmentFunctions = {
    initEvents: function () {
        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            var tabId = $(e.target).attr("href");

            ownedPlantEquipmentFunctions.triggerEvents(tabId);
        });
    },
    initPage: function () {
        ownedPlantEquipmentFunctions.initEvents();

        // Trigger active tab
        var tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        ownedPlantEquipmentFunctions.triggerEvents(tabId);
    },
    triggerEvents: function (tabId) {
        switch (tabId) {
            case "#shifts": {
                if (!SHIFT_TAB_MODEL || !SHIFT_TAB_TYPES) {
                    console.error("SHIFT_TAB_MODEL || SHIFT_TAB_TYPES is null");
                    return;
                }

                shiftFunctions.init();
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
    }
}

$(document).ready(function () {
    ownedPlantEquipmentFunctions.initPage();
});