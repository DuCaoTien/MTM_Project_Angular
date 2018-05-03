function LiveDataHelper() {
    var $this = this;

    $this.configs = {
        hubName: apiUrl.signalR.hub,
        hub: null,
        eventType: {
            shiftChanged: 1,
            worklogChanged: 2,
            alert: 3,
            chat: 4,
            chataction: 5
        },
        callbackListeners: [],
        urls: {
            api: apiUrl.signalR.api,
            hub: apiUrl.signalR.hub,
            domain: apiUrl.signalR.domain
        }
    }

    $this.funcs = {
        init: function () {
            $.connection.hub.url = $this.configs.urls.api + "/signalr";

            $.connection.hub.error(function (error) {
                console.log(error);
            });

            $this.configs.hub = $.connection[$this.configs.hubName];
        },
        start: function (){
            // Start the connection
            $.connection.hub.start()
                .done(function(response) {
                    console.log(`Hub connection has been started successfully`);

                    $this.funcs.call({
                        method: "Subscribe",
                        arg: {
                            id: currentUser.id,
                            domain: $this.configs.urls.domain
                        },
                        done: function(data) {
                        },
                        fail: function(data) {
                        }
                    });
                })
                .fail(function(error) {
                    console.log(`Hub connection has been started un-successfully`, error);
                });
        },
        listen: function(args) {
            args = $this.funcs.listenInit(args);

            if (args.event == null) {
                args.event = "onEvent";
            }

            $this.configs.hub.client[args.event] = function(type, response) {
                var listener = ($this.configs.callbackListeners || []).find(function(item) {
                    return item.type == type;
                });

                if(listener == undefined || !listener || !listener.listener) {
                    console.error("Missing listener: ", type);
                    return;
                }

                listener.listener(type, response);
            }
        },
        listenInit: function(args){
            if (args == null) {
                args = {};
            }

            return args;
        },
        call: function (args) {

            args = $this.funcs.callInit(args);
            //fix isMobile = false
            args.arg.ismobile = false;

            if (args.method !== undefined){
                $this.configs.hub.server[args.method](args.arg).done(function(response) {
                    console.log(args.method + " successfully");
                    if (args.done !== undefined) {
                        args.done(response);
                    }
                }).fail(function(error) {
                    console.log(args.method + " un-successfully", error);
                    if (args.fail !== undefined) {
                        args.fail(error);
                    }
                });
            }
        },
        callInit: function (args) {
            if (args == null) {
                args = {};
            }

            if (args.arg == null) {
                args.arg = {};
            }

            return args;
        },
        addListener(type, listener){
            var existingListener = ($this.configs.callbackListeners || []).find(function(item) {
                return item.type == type;
            })

            if(!existingListener) {
                $this.configs.callbackListeners.push({
                    type: type,
                    listener
                });
            } else {
                existingListener.listener = listener;
            }
        }
    }
}

// SignalR Connection
    
var signalRHelper = null;

$(document).ready(function () {
    signalRHelper = new LiveDataHelper();

    signalRHelper.funcs.init();
    signalRHelper.funcs.start();
    signalRHelper.funcs.listen();
})