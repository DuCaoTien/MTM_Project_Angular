function expiryIndexPage() {
    const $this = this;
    const EXPIRY_STATUS = {
        NEW: 1,
        SEEN: 2
    };
    const EXPIRY_PERIOD = {
        EXPIRED: 1
    };

    $this.configs = {
        pageIndex: 0,
        urls: {
            getList: apiUrl.expiry.getList,
            updateStatus: "/api/Expiry/UpdateStatus" //apiUrl.expiry.updateStatus
        },
        elements: {
            headerBarId: "header_notification_bar",
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

                if (status == EXPIRY_STATUS.NEW) {
                    $this.funcs.updateStatus($element, url, id);
                } else {
                    setTimeout(function () {
                        window.location.href = url;
                    }, 200);
                }
            });
            $this.configs.elements.$btnLoadMore.click(function () {
                $.ajax({
                    url: $this.configs.urls.getList + "?pageIndex=" + ($this.configs.pageIndex + 1),
                    type: "GET",
                    success: function (model) {
                        $this.configs.pageIndex++;
                        var html = "";
                        if (model.data.length > 0) {
                            for (var i = 0; i < model.data.length; i++) {
                                var item = model.data[i];
                                if (item.status === EXPIRY_STATUS.NEW) {
                                    html = html + '<li class="notification-item">' +
                                        '<a class="notification-url" href="javascript:void(0)" data-url="' +
                                        item.url +
                                        '" data-id="' +
                                        item.id +
                                        '" data-status="1">' +
                                        '<span class="time item-new">New</span>' +
                                        '<span class="details">' +
                                        '<span class="label label-sm label-icon ' +
                                        (item.period ===
                                        EXPIRY_PERIOD.EXPIRED
                                        ? "label-danger"
                                        : "label-success" )+
                                        '">' +
                                        '<i class="fa ' +
                                        (item.period ===
                                        EXPIRY_PERIOD.EXPIRED
                                        ? "fa-bolt"
                                        : "fa-bell-o") +
                                        '"></i>' +
                                        '</span><span class="item-title">' +
                                        item.title +
                                        '</span></span>' +
                                        '</a>' +
                                        '</li>';
                                } else {
                                    html = hmtl + '<li class="notification-item">' +
                                        '<a class="notification-url" href="javascript:void(0)" data-url="' +
                                        item.url +
                                        '" data-id="' +
                                        item.id +
                                        '" data-status="1">' +
                                        '<span class="time ">Seen</span>' +
                                        '<span class="details">' +
                                        '<span class="label label-sm label-icon ' +
                                        (item.period ===
                                        EXPIRY_PERIOD.EXPIRED
                                        ? "label-danger"
                                        : "label-success" )+
                                        '">' +
                                        '<i class="fa ' +
                                        (item.period ===
                                        EXPIRY_PERIOD.EXPIRED
                                        ? "fa-bolt"
                                        : "fa-bell-o") +
                                        '"></i>' +
                                        '</span><span class="item-title">' +
                                        item.title +
                                        '</span></span>' +
                                        '</a>' +
                                        '</li>';
                                }
                            }
                        }
                        $this.configs.elements.$list.prepend(html);
                        $this.funcs.initEvents();
                    }
                });
            });
        },

        updateStatus: function ($element, url, id) {
            App.blockUI({
                target: $this.configs.elements.headerBarId
            });

            $.ajax({
                url: $this.configs.urls.updateStatus + "/" + id,
                type: "POST",
                success: function () {
                    $element.data("status", EXPIRY_STATUS.SEEN);

                    var totalNotificationText = $($this.configs.elements.$notificationBar.find(".total-notification")[0]).text();
                    if (totalNotificationText === "0") return;
                    var totalNotification = parseInt(totalNotificationText);

                    $this.configs.elements.$notificationBar.find(".total-notification").text(totalNotification - 1);
                },
                complete: function () {
                    setTimeout(function () {
                        window.location.href = url;
                    }, 200);
                }
            });
        },

        loadMore: function () {

        }
    }
};

$(document).ready(function () {
    var expiryModel = new expiryIndexPage();

    expiryModel.funcs.initPage();
});