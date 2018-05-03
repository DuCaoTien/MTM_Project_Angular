var hiredPlantAndEquipmentConfig = {
};

var hiredPlantAndEquipmentFunctions = {
    initEvents: function () {
        $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
            var tabId = $(e.target).attr("href");

            hiredPlantAndEquipmentFunctions.triggerEvents(tabId);
        });
    },
    initPage: function () {
        hiredPlantAndEquipmentFunctions.initEvents();

        // Trigger active tab
        var tabId = $('.nav-tabs li.active a[data-toggle="tab"]').attr("href");
        hiredPlantAndEquipmentFunctions.triggerEvents(tabId);
    },
    triggerEvents: function(tabId) {
        switch (tabId) {
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
    hiredPlantAndEquipmentFunctions.initPage();
});