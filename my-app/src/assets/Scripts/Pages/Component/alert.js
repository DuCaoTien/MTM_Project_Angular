function AlertWidget() {
    const $this = this;
    const EXPIRY_STATUS = {
        NEW: 1,
        SEEN: 2
    };
    const EXPIRY_PERIOD = {
        EXPIRED: 1
    };
    const ALERT_STATUS = {
        NEW: 1,
        SEEN: 2,
    };

    $this.configs = {
        pageIndex: 0,
        urls: {
            getList: apiUrl.alert.getList,
            updateStatus: apiUrl.alert.updateStatus
        },
        elements: {
            noDataItemClass: 'no-data-item',
            headerBarId: "header_notification_bar",
            $notificationTemplate: $("#notification-item-template"),
            $notificationBar: $("#header_notification_bar"),
            $btnLoadMore: $("#btn_load_more_notification"),
            $list: $("#list_notification")
        }
    }

    $this.funcs = {
        initPage: function () {
            $this.funcs.initEvents();
        },

        initEvents: function () {
            $this.configs.elements.$notificationBar.find(".notification-url").on("click", function () {
                var $element = $(this);
                var id = $element.data("id");
                var url = $element.data("url");
                var status = $element.data("status");

                if (status === EXPIRY_STATUS.NEW) {
                    $this.funcs.updateStatus($element, url, id);
                } else {
                    //setTimeout(function () {
                    //    window.location.href = url;
                    //}, 200);
                }
            });

            // Add shift changed event
            try {
                signalRHelper.funcs.addListener(signalRHelper.configs.eventType.alert,
                    function(type, response) {
                        console.log("new alert: ", type, response)

                        if (response.UserId != currentUser.Id || response.Group == 1) return;

                        // Update total notification
                        var totalNotification =
                            parseInt(
                                $($this.configs.elements.$notificationBar.find(".total-notification")[0]).text() ||
                                "0");
                        $this.configs.elements.$notificationBar.find(".total-notification").text(totalNotification + 1);

                        // Remove no item li
                        $(`.${$this.configs.elements.noDataItemClass}`).remove();

                        // Add new notification 
                        var template = $this.configs.elements.$notificationTemplate.html();
                        template = template.replace("{{notification-status-class}}",
                            response.Status == ALERT_STATUS.SEEN
                            ? "notification-personal-seen"
                            : "notification-personal-new");
                        template = template.replace("{{notification-id}}", response.Id);
                        template = template.replace("{{notification-id}}", response.Id);
                        template = template.replace("{{notification-url}}", response.Url);
                        template = template.replace("{{notification-status}}", response.Status);
                        template = template.replace("{{notification-title}}", response.Title);

                        var $notificaiton = $(template);
                        $this.configs.elements.$list.prepend($notificaiton);

                        $this.configs.elements.$notificationBar.find(".notification-url").off("click").on("click",
                            function() {
                                var $element = $(this);
                                var id = $element.data("id");
                                var url = $element.data("url");
                                var status = $element.data("status");

                                if (status === EXPIRY_STATUS.NEW) {
                                    $this.funcs.updateStatus($element, url, id);
                                } else {
                                    //setTimeout(function() {
                                    //        window.location.href = url;
                                    //    },
                                    //    200);
                                }
                            });
                    });
            } catch (err) {
                console.log(err);
            }
        },

        updateStatus: function ($element, url, id) {
            App.blockUI({
                target: $this.configs.elements.headerBarId
            });

            $.ajax({
                url: $this.configs.urls.updateStatus + "/" + id,
                type: "POST",
                success: function (data) {
                    $element.data("status", EXPIRY_STATUS.SEEN);

                    var totalNotificationText = $($this.configs.elements.$notificationBar.find(".total-notification")[0]).text();
                    if (totalNotificationText === "0") return;
                    var totalNotification = parseInt(totalNotificationText);

                    $this.configs.elements.$notificationBar.find(".total-notification").text(totalNotification - 1);

                    $element.closest("li").removeClass("item-new");
                },
                complete: function () {
                    //setTimeout(function () {
                    //    window.location.href = url;
                    //}, 200);
                }
            });
        },

        loadMore: function () {

        }
    }
};

$(document).ready(function () {
    var alert = new AlertWidget();

    alert.funcs.initPage();
});