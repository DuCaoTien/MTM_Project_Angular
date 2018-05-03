function LiveChatWidget() {
    const $this = this;

    $this.configs = {
        pageIndex: 0,
        urls: {
            getList: apiUrl.livechat.getList,
            getUserList: apiUrl.livechat.getUserList,
            getDialogById: apiUrl.livechat.getDialogById,
            getDialogByUserIds: apiUrl.livechat.getDialogByUserIds,
            sendMessageToDialog: apiUrl.livechat.sendMessageToDialog,
            seenDialogMessage: apiUrl.livechat.seenDialogMessage,
            getChatListItemByDialogId: apiUrl.livechat.getChatListItemByDialogId,
            closeDialog: apiUrl.livechat.closeDialog,
            updateDialogStatus: apiUrl.livechat.updateDialogStatus,
            editDialog: apiUrl.livechat.editDialog
        },
        elements: {
            $list: $("#livechat-list-items"),
            $chatContainer: $("#livechat-container"),
            $chatListHeader: $("#livechat-list-header"),
            $chatListHeaderSetting: $("#livechat-list-header-setting-dropdownmenu"),
            $chatListHeaderSettingMenu: $("#livechat-list-header-setting-menu"),
            $chatListAddGroup: $("#livechat-list-header-add-group"),
            $chatListBody: $("#livechat-list-body"),
            $chatListBodyLoading: $("#livechat-list-item-loading"),
            $chatListCountContainer: $("#livechat-list-header-count-wrapper"),
            $chatListCount: $("#livechat-list-header-count"),
            $chatListFooterSearchBox: $("#livechat-list-footer-searchbox"),
            $chatMessageContainer: $("#livechat-message-container"),
            $chatMessageHeader: $("#livechat-message-header"),
            $chatMessageHeaderSetting: $("#livechat-message-header-utility-setting-dropdownmenu"),
            $chatMessageHeaderSettingMenu: $("#livechat-message-header-utility-setting-menu"),
            $chatMessageHeaderClose: $("#livechat-message-header-utility-close"),
            $chatMessageHeaderEditChat: $("#livechat-message-header-utility-edit-conversation"),
            $chatMessageHeaderEditChatName: $("#livechat-message-header-utility-edit-conversation-name"),
            $chatMessageHeaderCloseChat: $("#livechat-message-header-utility-close-conversation"),
            $chatMessageHeaderReOpenChat: $("#livechat-message-header-utility-open-conversation"),
            $chatMessageSubActionContainer: $("#livechat-message-sub-action-wrapper"),
            $chatMessageSubActionInput: $("#txtSubAction-livechat-message"),
            $chatMessageSubActionSubmit: $("#btnSubmitSubAction-livechat-message"),
            $chatMessageBody: $("#livechat-message-body"),
            $chatMessageListWrapper: $("#livechat-message-body-items-wrapper"),
            $chatMessageListScroller: $("#livechat-message-body-items-scroll"),
            $chatMessageList: $("#livechat-message-body-items"),
            $chatMessageSendBox: $("#livechat-message-send-box"),
            $chatMessageSendBtn: $("#livechat-message-send-icon"),
            $chatMessageSendLoading: $("#livechat-message-send-loading"),
            $chatMessageClosedLayer: $("#livechat-message-action-closedbox")
        },
        enums: {
            dialogType: {
                unknown: 0,
                user: 1,
                group: 2
            },
            dialogStatus: {
                created: 0,
                actived: 1,
                closed: 2
            },
            dialogMessageType:{
                normal: 1,
                system: 2,
                image: 3,
                attacment: 4
            },
            chatListContainerStatus: {
                open: "livechat-open",
                close: ""
            },
            chatMessageContainerStatus: {
                open: "livechat-message-open",
                close: ""
            }
        },
        chatList: [],
        userList: [],
        chatListPageSize: 15,
        currentDialog: null,
        currentSender: null,
        defaultWindowTitle: null,
        chatWindowTitle: null,
        getListXHR: null
    }

    $this.funcs = {
        initPage: function () {
            $this.funcs.initUserList();
            // $this.funcs.initListChat();
            // $this.funcs.initLastChatDialog();
            $this.funcs.initEvents();
        },
        initEvents: function () {
            $this.funcs.initListChatEvents();

            $this.funcs.initChatMessageEvents();

            $this.funcs.initSignalREvents();

            $this.funcs.initUtilities();
        },
        initSignalREvents: function(){
            // Init signalR Chat Notification
            signalRHelper.funcs.addListener(signalRHelper.configs.eventType.chat,
                function(type, response) {
                    console.log("signalR " + type, response);
                    if (response == undefined || response == "") {
                        return;
                    }

                    $this.funcs.addMessageToDialog(response);
                }
            );

            signalRHelper.funcs.addListener(signalRHelper.configs.eventType.chataction,
                function(type, response) {
                    console.log("signalR " + type, response);
                    if (response == undefined || response == "") {
                        return;
                    }

                    $this.funcs.processDialog(response);
                }
            );
        },

        /* For List Chat */
        initListChat: function () {
            $this.funcs.getListChat();
        },

        initListChatEvents: function () {  
            $this.funcs.initListChatOpen();

            $this.funcs.initModalAddGroupChat();

            $this.funcs.initScrollListBody();

            $this.funcs.initListChatFooter();
        },
        initListChatItemEvent: function() {
            $(".livechat-list-item-container").off("click tap");

            $(".livechat-list-item-container").on("click tap",
                function() {
                    var dialogId = $(this).attr("dialog-id");
                    var userId = $(this).attr("user-id");

                    $this.funcs.applySeenChatItem(dialogId, true);

                    var listUsers = [
                        userId, currentUser.id
                    ];

                    $this.funcs.getandinitChatMessageBox(dialogId, listUsers, "", "livechat-message-open");
                }
            );
        },
        initListChatOpen: function(){
            // Init List Chat Event 
            $this.funcs.applyChatListOpen();

            $this.configs.elements.$chatListHeader.on("tap click",
                function() {
                    if (window.localStorage.liveChatOpen == undefined || window.localStorage.liveChatOpen == "") {
                        window.localStorage.liveChatOpen = "livechat-open";
                    } else {
                        window.localStorage.liveChatOpen = "";
                    }

                    $this.funcs.applyChatListOpen();
                }
            );
        },
        applyChatListOpen: function() {
            if (window.localStorage.liveChatOpen == undefined) {
                window.localStorage.liveChatOpen = "";
            }

            $this.configs.elements.$chatContainer.removeClass("livechat-open");
            $this.configs.elements.$chatContainer.addClass(window.localStorage.liveChatOpen);
        },
        initModalAddGroupChat: function() {    
            $("#txtGroupMembers").val([]);

            $("#AddNewGroupModal").find(".validate-block").css({
                display: "none"
            });

            $("#txtGroupMembers").on("change",
                function () {
                    var memberList = $("#txtGroupMembers").val();

                    if (memberList != null && memberList.length > 0 && memberList.length < 2) {
                        $("#AddNewGroupModal").find(".validate-block").css({
                            display: "block"
                        });
                    } else {
                        $("#AddNewGroupModal").find(".validate-block").css({
                            display: "none"
                        });
                    }
                }
            );

            $("#btnAddNewChatGroup").on("tap click",
                function() {
                    var memberList = $("#txtGroupMembers").val();
                    var groupname = $("#txtGroupName").val();

                    if (memberList == null || memberList.length < 2) {
                        $("#AddNewGroupModal").find(".validate-block").css({
                            display: "block"
                        });

                        return;
                    } else {
                        var currentMember = (memberList || []).find(function(item) {
                            return item == currentUser.id;
                        });

                        if (currentMember == null) {
                            memberList.push(currentUser.id);
                        }

                        $("#AddNewGroupModal").find(".validate-block").css({
                            display: "none"
                        });

                        $this.funcs.getandinitChatMessageBox(null, memberList, groupname, "livechat-message-open");
                        $("#AddNewGroupModal").modal("hide");
                    }
                }
            );

            $this.configs.elements.$chatListAddGroup.on("tap click",
                function (e) {
                    $("#txtGroupMembers").val(null).trigger("change");
                    $("#txtGroupName").val("");

                    $("#AddNewGroupModal").modal();

                    e.preventDefault();
                    return false;
                }
            );

            $this.configs.elements.$chatListHeaderSetting.on("tap click",
                function(e){
                    $this.configs.elements.$chatListHeaderSettingMenu.dropdown('toggle');

                    e.preventDefault();
                    return false;
                }
            );
        },
        initScrollListBody: function () {
            $this.configs.elements.$chatListBody.off("scroll");
            $this.configs.elements.$chatListBody.on("scroll",
                function() {
                    var contentHeight = $this.configs.elements.$list.innerHeight();
                    var viewHeight = $this.configs.elements.$chatListBody.innerHeight();

                    var scrollPosition = $this.configs.elements.$chatListBody.scrollTop();

                    if (contentHeight > viewHeight) {
                        if (scrollPosition + viewHeight > contentHeight - 100) {
                            $this.configs.elements.$chatListBody.off("scroll");
                            $this.funcs.getListChat();
                        }
                    }
                }
            );
        },
        initListChatFooter: function(){
            $this.configs.elements.$chatListFooterSearchBox.on("keyup", function(){
                console.log($(this).val());

                $this.configs.chatList = [];

                $this.funcs.getListChat();
            });
        },
        addIncomingChatItemToListChat: function(chatItem, chatIndex, dialogId) {
            var successCallback = function(response) {
                if (response != undefined && response != null && response != '') {
                    chatItem = response;

                    $this.configs.chatList.splice(chatIndex, 1);
                    $this.configs.chatList.splice(0, 0, chatItem);

                    $this.funcs.renderListChatItem(chatItem, true);

                    $this.funcs.initListChatItemEvent(chatItem);

                    $this.funcs.countUnseenDialog();
                }
            }

            var errorCallback = function(response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            }

            if (chatItem != null) {
                successCallback(chatItem);
            } else {
                // Get A Chat Item
                
                $.ajax({
                    type: "GET",
                    url: $this.configs.urls.getChatListItemByDialogId + "?id=" + dialogId,
                    success: function(response) {
                        return successCallback(response);
                    },
                    error: function(response) {
                        errorCallback(response);
                    },
                    beforeSend: function() {
                    },
                    complete: function() {
                    }
                });
            }
        },
        removeRenderedChatItem: function(chatItem){
            var dialogDiv = $(".livechat-list-item-container[dialog-id='" + chatItem.dialogId + "']");
            var userDiv = $(".livechat-list-item-container[user-id='" + chatItem.id + "']");
            
            if (chatItem.dialogId > 0 && dialogDiv.length > 0){
                dialogDiv.closest("li").remove();
            } else if (chatItem.id > 0 && userDiv.length > 0) {
                var dialogIdExist = userDiv.attr("dialog-id");
                if (dialogIdExist == chatItem.dialogId) {
                    userDiv.closest("li").remove();
                }
            }
        },
        renderListChatItem: function(chatItem, isnewitem) {
            $this.funcs.removeRenderedChatItem(chatItem);
            var item = $("#livechat-list-item-template").find(".livechat-list-item").clone();

            // Get User Info
            var user = ($this.configs.userList || []).find(function(item){
                return item.id == chatItem.id;
            });

            if (chatItem.type == 2){
                user = null;
            }

            // Set item info
            item.find(".livechat-list-item-name").html(chatItem.name);
            item.find(".livechat-list-item-container").attr("user-id", chatItem.id);
            item.find(".livechat-list-item-container").attr("dialog-id", chatItem.dialogId);
            if (user != null){
                item.find(".livechat-list-item-avatar img").attr("src", user.avatar);
            } else {
                item.find(".livechat-list-item-avatar img").attr("src", chatItem.avatar);
            }

            // Set last message
            var livechatListItemMessage = item.find(".livechat-list-item-message");

            if (chatItem.lastMessage == null) {
                livechatListItemMessage.html("");
            } else {
                livechatListItemMessage.html(chatItem.lastMessage.content);           
            }

            if (isnewitem) {
                $this.configs.elements.$list.prepend(item);
            } else {
                $this.configs.elements.$list.append(item);
            }

            //// Check if unseen
            if (chatItem.lastMessage != null) {
                var seenId = (chatItem.lastMessage.seenMembers || []).find(function(item) {
                    return item == currentUser.id;
                });

                $this.funcs.applySeenChatItem(chatItem.dialogId, seenId != null);
            }    
        },
        renderListChat: function() {
            // Render
            $this.configs.elements.$list.empty();

            for (var i = 0; i < $this.configs.chatList.length; i++) {
                $this.funcs.renderListChatItem($this.configs.chatList[i], false);
            }
        },
        getListChat: function() {
            var keywordSearch = $this.configs.elements.$chatListFooterSearchBox.val();
            var requestData = {
                skip: $this.configs.chatList.length,
                take: $this.configs.chatListPageSize,
                keyword: keywordSearch
            };

            var successCallback = function(response) {
                console.log(response);

                if (response.user != undefined && response.user) {
                    for (var i = 0; i < response.user.length; i++) {

                        $this.configs.chatList.push(response.user[i]);
                    }

                    if (response.user.length > 0) {
                        $this.funcs.initScrollListBody();
                    }
                }

                $this.funcs.countUnseenDialog();

                $this.funcs.renderListChat();

                $this.funcs.initListChatItemEvent();
            }

            var errorCallback = function(response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    if (text.toLowerCase() != "abort")
                        showAjaxFailureMessage(text);
                }
            }

            if ($this.configs.getListXHR != null){
                $this.configs.getListXHR.abort();

                $this.configs.getListXHR = null;
            }

            $this.configs.getListXHR = $.ajax({
                type: "POST",
                url: $this.configs.urls.getList,
                data: requestData,
                success: function(response) {
                    return successCallback(response);
                },
                error: function(response) {
                    errorCallback(response);
                },
                beforeSend: function() {
                    //showAjaxLoadingMask();
                    $this.configs.elements.$chatListBodyLoading.css({ "display": "block" });
                },
                complete: function() {
                    //hideAjaxLoadingMask();
                    $this.configs.elements.$chatListBodyLoading.css({ "display": "none" });

                    $this.configs.getListXHR = null;
                }
            });
        },

        /* For Dialog Chat */
        initChatMessageEvents: function () {
            // Click on conversation header to toggle up-down chatbox
            $this.configs.elements.$chatMessageHeader.on("tap click",
                function() {
                    if (window.localStorage.liveChatMessageOpen == undefined || window.localStorage.liveChatMessageOpen == "") {
                        window.localStorage.liveChatMessageOpen = "livechat-message-open";
                    } else {
                        window.localStorage.liveChatMessageOpen = "";
                    }

                    $this.funcs.applyChatMessageOpen();
                }
            );
            // Init Chat Message Event
            $this.configs.elements.$chatMessageHeaderClose.on("tap click",
                function(e) {
                    $this.configs.elements.$chatMessageContainer.css({ "display": "none" });

                    window.localStorage.liveChatMessageOpen = "";
                    window.localStorage.liveChatDialogId = "";

                    $this.configs.currentDialog = null;

                    e.preventDefault();
                    return false;
                }
            );

            $this.funcs.bindingChatMessageHeaderSetting();
            
            $this.funcs.initSendContentBoxEvent();

            $this.configs.elements.$chatMessageSendBox.on("focus",
                function() {
                    $this.funcs.seenLastMessage();
                }
            );

            $(".dropdown-menu-item.disabled").on("tap click", function(e){
                e.preventDefault();

                return false;
            });

            $this.funcs.initEditChatDialogModal();
        },
        bindingChatMessageHeaderSetting: function(){
            // Create group from exist dialog
            $this.configs.elements.$chatMessageHeaderSetting.off("tap click");
            if (!$this.configs.elements.$chatMessageHeaderSetting.hasClass("disabled")){
                $this.configs.elements.$chatMessageHeaderSetting.on("tap click",
                    function(e) {
                        $this.configs.elements.$chatMessageHeaderSettingMenu.dropdown('toggle');

                        e.preventDefault();
                        return false;
                    }
                );
            }
            
            // Edit dialog
            $this.configs.elements.$chatMessageHeaderEditChat.off("tap click");

            if (!$this.configs.elements.$chatMessageHeaderEditChat.hasClass("disabled")){
                $this.configs.elements.$chatMessageHeaderEditChat.on("tap click",
                    function(e) {
                        $this.funcs.editCurrentChatDialog();

                        e.preventDefault();
                        return false;
                    }
                );
            }

            $this.configs.elements.$chatMessageHeaderEditChatName.off("tap click");

            if (!$this.configs.elements.$chatMessageHeaderEditChatName.hasClass("disabled")){
                // Edit dialog name
                $this.configs.elements.$chatMessageHeaderEditChatName.on("tap click",
                    function(e) {
                        $this.funcs.initEditChatName();
                    }
                );
            }

            $this.configs.elements.$chatMessageHeaderCloseChat.off("tap click");

            if (!$this.configs.elements.$chatMessageHeaderCloseChat.hasClass("disabled")){
                // Edit dialog message
                $this.configs.elements.$chatMessageHeaderCloseChat.on("tap click",
                    function(e) {
                        $this.funcs.closeCurrentChatDialog();
                    }
                );
            }

            $this.configs.elements.$chatMessageHeaderReOpenChat.off("tap click");

            if (!$this.configs.elements.$chatMessageHeaderReOpenChat.hasClass("disabled")){
                // Edit dialog message
                $this.configs.elements.$chatMessageHeaderReOpenChat.on("tap click",
                    function(e) {
                        $this.funcs.reopenCurrentChatDialog();
                    }
                );
            }

            
        },
        applyChatMessageOpen: function() {
            if (window.localStorage.liveChatMessageOpen == undefined) {
                window.localStorage.liveChatMessageOpen = "";
            }

            $this.configs.elements.$chatMessageContainer.removeClass("livechat-message-open");
            $this.configs.elements.$chatMessageContainer.addClass(window.localStorage.liveChatMessageOpen);
        },
        // edit dialog
        editCurrentChatDialog: function(){
            if ($this.configs.currentDialog == null) {
                return;
            }

            var groupMembers = [];

            for(var i=0; i< $this.configs.currentDialog.members.length; i++){
                groupMembers.push($this.configs.currentDialog.members[i].id);
            }

            $("#txtChatMembers").val(groupMembers).trigger("change");
            $("#txtChatName").val($this.configs.currentDialog.name).trigger("change");

            $('#EditDialogModal').modal();

            console.log("Edit Current Chat Dialog");
        },
        updateDialogStatus: function(dialogid, status){
            if ($this.configs.currentDialog == null) {
                return;
            }

            var requestData = {
                'id': dialogid,
                'status': status,
            };

            var successCallback = function (response) {
                console.log("Updated Chat Dialog", response);

                $this.funcs.onChatDialogChanged(response);
            }

            var errorCallback = function(response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            }

            $.ajax({
                type: "POST",
                url: $this.configs.urls.updateDialogStatus,
                data: requestData,
                success: function(response) {
                    return successCallback(response);
                },
                error: function(response) {
                    errorCallback(response);
                },
                beforeSend: function() {
                    //showAjaxLoadingMask();
                },
                complete: function() {
                    //hideAjaxLoadingMask();
                }
            });
        },
        reopenCurrentChatDialog: function(){
            $this.funcs.updateDialogStatus($this.configs.currentDialog.id, $this.configs.enums.dialogStatus.actived);
            // if ($this.configs.currentDialog == null) {
            //     return;
            // }

            // var requestData = {
            //     'id': $this.configs.currentDialog.id,
            //     'status': $this.configs.enums.dialogStatus.actived,
            // };

            // var successCallback = function (response) {
            //     console.log("Re-open Chat Dialog", response);

            //     $this.funcs.onChatDialogChanged(response);
            // }

            // var errorCallback = function(response) {
            //     if (typeof (response.responseJSON) !== "undefined") {
            //         showAjaxFailureMessage(response.responseJSON);
            //     } else {
            //         var text = response.statusText == "OK" ? "Application Error" : response.statusText;
            //         showAjaxFailureMessage(text);
            //     }
            // }

            // $.ajax({
            //     type: "POST",
            //     url: $this.configs.urls.updateDialogStatus,
            //     data: requestData,
            //     success: function(response) {
            //         return successCallback(response);
            //     },
            //     error: function(response) {
            //         errorCallback(response);
            //     },
            //     beforeSend: function() {
            //         //showAjaxLoadingMask();
            //     },
            //     complete: function() {
            //         //hideAjaxLoadingMask();
            //     }
            // });
        },
        closeCurrentChatDialog: function(){
            $this.funcs.updateDialogStatus($this.configs.currentDialog.id, $this.configs.enums.dialogStatus.closed);
            // if ($this.configs.currentDialog == null) {
            //     return;
            // }

            // var requestData = {
            //     'id': $this.configs.currentDialog.id
            // };

            // var successCallback = function (response) {
            //     console.log("Close Chat Dialog", response);

            //     $this.funcs.onChatDialogChanged(response);
            // }

            // var errorCallback = function(response) {
            //     if (typeof (response.responseJSON) !== "undefined") {
            //         showAjaxFailureMessage(response.responseJSON);
            //     } else {
            //         var text = response.statusText == "OK" ? "Application Error" : response.statusText;
            //         showAjaxFailureMessage(text);
            //     }
            // }

            // $.ajax({
            //     type: "GET",
            //     url: $this.configs.urls.closeDialog + "?id=" + $this.configs.currentDialog.id,
            //     success: function(response) {
            //         return successCallback(response);
            //     },
            //     error: function(response) {
            //         errorCallback(response);
            //     },
            //     beforeSend: function() {
            //         //showAjaxLoadingMask();
            //     },
            //     complete: function() {
            //         //hideAjaxLoadingMask();
            //     }
            // });
        }, 
        initEditChatName: function(){
            $this.configs.elements.$chatMessageSubActionContainer.removeClass("livechat-message-sub-action-show");
            $this.configs.elements.$chatMessageSubActionContainer.addClass("livechat-message-sub-action-show");

            $this.configs.elements.$chatMessageSubActionInput.val("");

            if ($this.configs.currentDialog != null){
                $this.configs.elements.$chatMessageSubActionInput.val($this.configs.currentDialog.name);
            }
            

            $this.configs.elements.$chatMessageSubActionSubmit.off("tap click");
            $this.configs.elements.$chatMessageSubActionSubmit.on("tap click", function(){
                var newName = $this.configs.elements.$chatMessageSubActionInput.val();

                $this.funcs.updateDialogName(newName, "true");
            });
        },
        updateDialogDetailChanged: function(dialog){
            //update dialog name
            $this.funcs.updateDialogName(dialog.name, "false");
            $this.funcs.updateDialogChatListName(dialog.name, dialog.id);

            //update dialog members
            $this.funcs.updateDialogMembers(dialog.members);
        },
        updateDialogMembers: function(members){
            if (members == undefined || members.length < 1 || $this.configs.currentDialog == null){
                return;
            }

            $this.configs.currentDialog.members = members;

            $this.funcs.updateDialogMemberDetail();
        },
        updateDialogMemberDetail: function(){
            var memberName = "";

            for(var i=0; i<$this.configs.currentDialog.members.length; i++){
                if (i < 5){
                    memberName = memberName + "<div class='text-left'>"
                            + $this.configs.currentDialog.members[i].fullName
                            + "</div>";
                } else {
                    memberName = memberName + "<div class='text-left'>"
                        + "and " + ($this.configs.currentDialog.members.length - i) + " more users"
                        + "</div>";
                    break;
                }
            }

            $this.configs.elements.$chatMessageHeader.find(".livechat-message-header-name")
                .html($this.configs.currentDialog.name)
                .attr({
                    "data-toggle": "tooltip",
                    "data-placement": "top",
                    "data-html": "true",
                    //"title": memberName,
                    "data-original-title": memberName,
                });
        },
        updateDialogChatListName: function(newName, dialogid){
            var chatItem = ($this.configs.chatList || []).find(function(item){
                return item.id = dialogid;
            });

            if (chatItem != undefined && chatItem != null){
                chatItem.name = newName;
            }

            var dialogHtml = $(".livechat-list-item-container[dialog-id='" + dialogid + "']").find(".livechat-list-item-name").html(newName);
        },
        updateDialogName: function(newName, updateDb){
            if (newName == undefined || newName == "" || $this.configs.currentDialog == null){
                $this.funcs.closeEditChatName();

                return;
            } else {
                $this.configs.elements.$chatMessageHeader.find(".livechat-message-header-name").html(newName);
                $this.configs.currentDialog.name = newName;

                if (updateDb != "true"){
                    $this.configs.elements.$chatMessageHeader.find(".livechat-message-header-name").html(newName);
                    $this.configs.currentDialog.name = newName;

                    $this.funcs.closeEditChatName();
                } else {
                    var memberGroups = [];
                    for(var i=0; i<$this.configs.currentDialog.members.length; i++){
                        memberGroups.push($this.configs.currentDialog.members[i].id);
                    }

                    var requestData = {
                        'id': $this.configs.currentDialog.id,
                        'name': newName,
                        members: memberGroups
                    };

                    var successCallback = function (response) {
                        console.log("Edit Chat Dialog", response);
                        $this.configs.elements.$chatMessageHeader.find(".livechat-message-header-name").html(newName);
                        $this.configs.currentDialog.name = newName;
                        $this.funcs.closeEditChatName();
                    }

                    var errorCallback = function(response) {
                        if (typeof (response.responseJSON) !== "undefined") {
                            showAjaxFailureMessage(response.responseJSON);
                        } else {
                            var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                            showAjaxFailureMessage(text);
                        }
                    }

                    $.ajax({
                        type: "POST",
                        url: $this.configs.urls.editDialog,
                        data: requestData,
                        success: function(response) {
                            return successCallback(response);
                        },
                        error: function(response) {
                            errorCallback(response);
                        },
                        beforeSend: function() {
                            //showAjaxLoadingMask();
                        },
                        complete: function() {
                            //hideAjaxLoadingMask();
                        }
                    });
                }
            }
        }, 
        closeEditChatName: function(){
            $this.configs.elements.$chatMessageSubActionContainer.removeClass("livechat-message-sub-action-show");
            $this.configs.elements.$chatMessageSubActionInput.val("");
        },
        onChatDialogChanged: function(dialog){
            if ($this.configs.currentDialog == null
                || dialog == null || $this.configs.currentDialog.id != dialog.id) {
                // Next ver: update status on Chat list

                return;
            }

            //$chatMessageClosedLayer
            if ($this.configs.currentDialog.id == dialog.id){
                $this.configs.currentDialog = dialog;

                $this.configs.elements.$chatMessageHeaderEditChat.removeClass("disabled");
                $this.configs.elements.$chatMessageHeaderCloseChat.removeClass("disabled");
                $this.configs.elements.$chatMessageHeaderReOpenChat.removeClass("disabled");
                $this.configs.elements.$chatMessageHeaderEditChatName.removeClass("disabled");
                $this.configs.elements.$chatMessageHeaderSetting.removeClass("disabled");

                $this.configs.elements.$chatMessageHeaderEditChat.removeClass("hidden");
                $this.configs.elements.$chatMessageHeaderCloseChat.removeClass("hidden");
                $this.configs.elements.$chatMessageHeaderReOpenChat.removeClass("hidden");
                $this.configs.elements.$chatMessageHeaderEditChatName.removeClass("hidden");
                $this.configs.elements.$chatMessageHeaderSetting.removeClass("hidden");

                // reopen hidden by default
                $this.configs.elements.$chatMessageHeaderReOpenChat.addClass("disabled");
                $this.configs.elements.$chatMessageHeaderReOpenChat.addClass("hidden");

                // 2018.03.21-18.30 VuTruong: remove open/close chat status
                $this.configs.currentDialog.status = $this.configs.enums.dialogStatus.actived;

                if ($this.configs.currentDialog.status == $this.configs.enums.dialogStatus.closed){
                    $this.configs.elements.$chatMessageClosedLayer.css({
                        "display": "block"
                    });
                    $this.configs.elements.$chatMessageHeaderEditChat.addClass("disabled");
                    $this.configs.elements.$chatMessageHeaderEditChatName.addClass("disabled");
                    $this.configs.elements.$chatMessageHeaderCloseChat.addClass("disabled");

                    //$this.configs.elements.$chatMessageHeaderEditChat.addClass("hidden");
                    $this.configs.elements.$chatMessageHeaderCloseChat.addClass("hidden");
                    //$this.configs.elements.$chatMessageHeaderEditChatName.addClass("hidden");

                    $this.configs.elements.$chatMessageHeaderReOpenChat.removeClass("disabled");
                    $this.configs.elements.$chatMessageHeaderReOpenChat.removeClass("hidden");
                } else {
                    $this.configs.elements.$chatMessageClosedLayer.css({
                        "display": "none"
                    });
                }

                if ($this.configs.currentDialog.type == $this.configs.enums.dialogType.user) {

                    $this.configs.elements.$chatMessageHeaderEditChat.addClass("disabled");
                    $this.configs.elements.$chatMessageHeaderEditChatName.addClass("disabled");
                    $this.configs.elements.$chatMessageHeaderCloseChat.addClass("disabled");
                    $this.configs.elements.$chatMessageHeaderSetting.addClass("disabled");

                    $this.configs.elements.$chatMessageHeaderEditChatName.addClass("hidden");
                    $this.configs.elements.$chatMessageHeaderEditChat.addClass("hidden");
                    $this.configs.elements.$chatMessageHeaderCloseChat.addClass("hidden");
                    $this.configs.elements.$chatMessageHeaderSetting.addClass("hidden");
                }

                // 2018.03.21-18.30 VuTruong: remove open/close chat
                $this.configs.elements.$chatMessageHeaderCloseChat.addClass("disabled");
                $this.configs.elements.$chatMessageHeaderReOpenChat.addClass("disabled");

                $this.configs.elements.$chatMessageHeaderCloseChat.addClass("hidden");
                $this.configs.elements.$chatMessageHeaderReOpenChat.addClass("hidden");

                $this.funcs.bindingChatMessageHeaderSetting();

                $(".dropdown-menu-item.disabled").on("tap click", function(e){
                    e.preventDefault();

                    return false;
                });
            }
        },
        initLastChatDialog: function(){
            if (window.localStorage.liveChatDialogId == undefined) {
                window.localStorage.liveChatDialogId = "";
            }

            $this.funcs.getandinitChatMessageBox(window.localStorage.liveChatDialogId, null, "", window.localStorage.liveChatMessageOpen);
        },
        getandinitChatMessageBox: function (dialogId, userIds, name, livechatstate) {
            if (window.localStorage.liveChatMessageOpen == "livechat-message-open"
                && $this.configs.currentDialog != null
                && dialogId == $this.configs.currentDialog.id) {
                return;
            }

            var successCallback = function(response) {
                if (response == null){
                    return;
                }

                var user = (response.members || []).find(function(item) {
                    return item.id == currentUser.id;
                });

                if (user == null) {
                    return;
                }

                // assign currentdialog
                $this.funcs.assignCurrentDialog(response);

                // show dialog box
                $this.funcs.initChatMessageBox(livechatstate);

                $this.funcs.onChatDialogChanged($this.configs.currentDialog);
                // set seen for lastmessage
                $this.funcs.seenMessage(null, null);

                $this.funcs.countUnseenDialog();
            }

            var errorCallback = function(response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            }

            if (dialogId !== undefined && parseInt(dialogId) > 0) {
                // todo: get dialog by id
                $.ajax({
                    type: "GET",
                    url: $this.configs.urls.getDialogById + "?id=" + dialogId,
                    success: function(response) {
                        successCallback(response);
                    },
                    error: function(response) {
                        errorCallback(response);
                    },
                    beforeSend: function() {
                        //showAjaxLoadingMask();
                    },
                    complete: function() {
                        //hideAjaxLoadingMask();
                    }
                });
            } else if (userIds != undefined && userIds.length > 0) {
                // todo: get dialog by user ids
                var requestData = {
                    'name': name,
                    'members': userIds
                }

                $.ajax({
                    type: "POST",
                    url: $this.configs.urls.getDialogByUserIds,
                    data: requestData,
                    success: function(response) {
                        successCallback(response);
                    },
                    error: function(response) {
                        errorCallback(response);
                    },
                    beforeSend: function() {
                        //showAjaxLoadingMask();
                    },
                    complete: function() {
                        //hideAjaxLoadingMask();
                    }
                });
            }
        },
        assignCurrentDialog: function (dialog) {
            if (dialog == null){
                return;
            }

            $this.configs.currentDialog = dialog;
            $this.configs.currentSender = ($this.configs.currentDialog.members || []).find(function(item) {
                return item.id == currentUser.id;
            });
        },
        initChatMessageBox: function(livechatstate) {
            if ($this.configs.currentDialog == null) {
                return;
            }

            $this.configs.elements.$chatMessageContainer.css({ "display": "block" });

            $this.configs.elements.$chatMessageContainer.attr({
                'dialog-id': $this.configs.currentDialog.id
            });

            $this.funcs.updateDialogMemberDetail();

            window.localStorage.liveChatMessageOpen = livechatstate;
            $this.funcs.applyChatMessageOpen();

            window.localStorage.liveChatDialogId = $this.configs.currentDialog.id;

            $this.funcs.initMessageForCurrentDialog();
        },
        initMessageForCurrentDialog: function () {
            // Clear Current Message
            $this.configs.elements.$chatMessageList.empty();

            if ($this.configs.currentDialog == null || $this.configs.currentDialog.dialogMessages.length <= 0) {
                return;
            }

            for (var i = 0; i < $this.configs.currentDialog.dialogMessages.length; i++) {
                var message = $this.configs.currentDialog.dialogMessages[i];
                var sender = ($this.configs.currentDialog.members || []).find(function(item) {
                    return item.id == message.senderId;
                });

                $this.funcs.renderMessage(message, sender);
            }

            $this.funcs.viewLastMessage();
        },
        viewLastMessage: function() {
            $this.configs.elements.$chatMessageListScroller.scrollTop($this.configs.elements.$chatMessageListScroller.prop("scrollHeight"));
        },
        renderMessage: function(message, sender, isnew) {
            var item = $("#livechat-message-item-template").find("#livechat-message-item").clone();

            item.removeClass("livechat-message-item");
            item.addClass("livechat-message-item");

            var currentDate = new moment(message.date.replace("Z", ""));
            var currentTimer = currentDate.format("hh:mm A");
            var currentDater = currentDate.format("DD/MM/YYYY");

            item.attr({
                'dialog-id': $this.configs.currentDialog.id,
                'sender-id': sender.id,
                'id': null,
                'date': currentDater,
                'time': currentTimer
            });

            //data-toggle="tooltip" data-placement="top" title
            // set content
            item.find(".livechat-message-item-message").html(message.content);
            
            item.find(".livechat-message-item-name-text").attr({
                'message-id': message.id,
                'datetime': currentDater + " " + currentTimer
            });

            // Get User Info
            var user = ($this.configs.userList || []).find(function(item){
                return item.id == sender.id;
            });

            // avatar and align
            if (sender.id == currentUser.id) {
                // if currentuser's message

                // no avatar
                item.find(".livechat-message-item-avatar").css({ "display": "none" })

                // align right
                item.addClass("currentuser-message");

                item.find(".livechat-message-item-name-text").attr({
                    "data-toggle": "tooltip",
                    "data-placement": "right",
                    "title": currentTimer
                });

                // no name but time
                item.find(".livechat-message-item-username").html(currentTimer);

            } else {
                if (user != null){
                    item.find(".livechat-message-item-avatar img").attr("src", user.avatar);
                } else {
                    item.find(".livechat-message-item-avatar img").attr("src", sender.avatar);
                }
            
                item.find(".livechat-message-item-avatar").attr({
                    "data-toggle": "tooltip",
                    "data-placement": "left",
                    "title": sender.fullName + ", " + currentTimer
                });

                item.find(".livechat-message-item-username").html(sender.fullName + ", " + currentTimer);
            }

            // set time
            item.find(".livechat-message-item-time").html(currentTimer);

            // not need to show time anymore
            item.find(".livechat-message-item-date-time").css({
                "display": "none"
            });

            // Set date
            item.find(".livechat-message-item-date").html(currentDater);
            item.find(".livechat-message-item-date").attr({
                date: currentDate.format("DD/MM/YYYY")
            });

            // set seen
            item.find(".livechat-message-item-seen").css({ display: "none" });

            if (sender.id == currentUser.id) {
                var indexM = $this.configs.currentDialog.dialogMessages.findIndex(function(item) {
                    return item.id == message.id;
                });

                if (indexM == 0 && message.seenMembers.length > 1) {
                    var seenMember = "";
                    var otherMember = 0;

                    if ($this.configs.currentDialog.members.length > 2 && message.seenMembers.length == $this.configs.currentDialog.members.length) {
                        seenMember = "all";
                    } else {
                        for (var i = 0; i < message.seenMembers.length; i++) {
                            if (message.seenMembers[i] != currentUser.id) {
                                otherMember = otherMember + 1;

                                if (otherMember < 3) {

                                    if (seenMember != "") {
                                        seenMember = seenMember + ", ";
                                    }

                                    var member = $this.configs.userList.find(function(dItem) {
                                        return dItem.id == message.seenMembers[i];
                                    });

                                    seenMember = seenMember + member.firstName;
                                } else {
                                    seenMember = seenMember +
                                        " and " +
                                        (message.seenMembers.length - otherMember) +
                                        " others";
                                    break;
                                }
                            }
                        }
                    }

                    item.find(".livechat-message-item-seen-member").html("by " + seenMember);
                    item.find(".livechat-message-item-seen").css({ display: "inline-block" });
                } 
            }

            var currentDateElement = $(".livechat-message-item-date[date='" + currentDater + "']");

            if (isnew !== undefined && isnew == true) {
                // self remove date
                if (currentDateElement.length > 0) {
                    item.find(".livechat-message-item-date").css({ display: "none" });
                }

                // remove exist seen
                $(".livechat-message-item-seen").css({ display: "none"});

                // get last item to compare
                var nestItem = $(".livechat-message-item").last();
                if (nestItem.length > 0){
                    var nestDialogId = nestItem.attr("dialog-id");
                    var nestSenderId = nestItem.attr("sender-id");
                    var nestDate = nestItem.attr("date");
                    var nestTime = nestItem.attr("time");

                    if (sender.id == nestSenderId){
                        if (currentDater == nestDate){
                            item.find(".livechat-message-item-avatar").find("img").css({ "display": "none" })
                        }
                    }
                } else {
                    //$this.configs.elements.$chatMessageList.append(item);
                }

                $this.configs.elements.$chatMessageList.append(item);
            } else {
                // remove exist date
                if (currentDateElement.length > 0) {
                    currentDateElement.css({ display: "none" });
                }

                // get first item to compare
                var nestItem = $(".livechat-message-item").first();
                if (nestItem.length > 0){
                    var nestDialogId = nestItem.attr("dialog-id");
                    var nestSenderId = nestItem.attr("sender-id");
                    var nestDate = nestItem.attr("date");
                    var nestTime = nestItem.attr("time");

                    if (sender.id == nestSenderId){
                        if (currentDater == nestDate){
                            nestItem.find(".livechat-message-item-avatar").find("img").css({ "display": "none" })
                        }
                    }
                } else {
                    //$this.configs.elements.$chatMessageList.prepend(item);
                }

                $this.configs.elements.$chatMessageList.prepend(item);
            }
        },
        seenMessage: function (messageid, dialogid) {
            // if dialogid is null get current dialog
            if (dialogid == undefined || dialogid == null) {
                dialogid = $this.configs.currentDialog != null ? $this.configs.currentDialog.id : null;

                if (dialogid == undefined || dialogid == null) {
                    return;
                }
            }

            // if messageid is null get lastmessage
            if (messageid == undefined || messageid == null) {
                messageid = $this.configs.currentDialog != null && $this.configs.currentDialog.lastMessage != null
                    ? $this.configs.currentDialog.lastMessage.id
                    : null;

                if (messageid == undefined || messageid == null) {
                    return;
                }
            }

            var requestData = {
                "userId": currentUser.id,
                "messageId": messageid,
                "dialogId": dialogid
            };

            var successCallback = function (response) {
                $this.funcs.applySeenChatItem(dialogid, true);

                $this.funcs.countUnseenDialog();
            }

            var errorCallback = function(response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            }

            $.ajax({
                type: "POST",
                url: $this.configs.urls.seenDialogMessage,
                data: requestData,
                success: function(response) {
                    return successCallback(response);
                },
                error: function(response) {
                    errorCallback(response);
                },
                beforeSend: function() {
                    //showAjaxLoadingMask();
                },
                complete: function() {
                    //hideAjaxLoadingMask();
                }
            });
        },
        seenLastMessage: function() {
          if ($this.configs.currentDialog != null && $this.configs.currentDialog.lastMessage != null) {
              var seen = ($this.configs.currentDialog.lastMessage.seenMembers || []).find(function(item) {
                  return item == currentUser.id;
              });

              if (seen == null) {
                  $this.funcs.seenMessage($this.configs.currentDialog.lastMessage.id,
                      $this.configs.currentDialog.id);
              }

              document.title = $this.configs.defaultWindowTitle;
          }  
        },
        applySeenChatItem: function (dialogid, isSeen) {
            var chatItem = ($this.configs.chatList || []).find(function(item) {
                return item.dialogId == dialogid;
            });

            if (chatItem == null || chatItem.lastMessage == null) {
                return;
            }

            var chatMember = (chatItem.lastMessage.seenMembers || []).find(function(item) {
                return item == currentUser.id;
            });

            chatItem.lastMessage.seenMembers.remove(currentUser.id);

            if (isSeen) {
                chatItem.lastMessage.seenMembers.push(currentUser.id);
            } 

            document.title = $this.configs.defaultWindowTitle;

            var chatElement = $(".livechat-list-item-container[dialog-id='" + dialogid + "']");

            if (chatElement.length > 0) {
                var chatItemContainer = chatElement.closest("li");
                chatItemContainer.removeClass("livechat-list-unseen-item");

                if (!isSeen) {
                    chatItemContainer.addClass("livechat-list-unseen-item");
                }
            }
        },
        processNewDialog: function(dialog) {
            $this.funcs.addIncomingChatItemToListChat(null, -1, dialog.id);
        },
        processDialog: function(chatData) {
            // if chatData.action == "seen", then chatData.data is message
            switch (chatData.action) {
            case "seen":
                var message = chatData.data;

                $this.funcs.processSeenDialog(message);
                break;
            case "newdialog":
                var dialog = chatData.data;

                $this.funcs.processNewDialog(dialog);
                break;
            case "dialogstatus":
                var dialog = chatData.data;

                $this.funcs.onChatDialogChanged(dialog);
                break;
            case "dialogname":
                var dialog = chatData.data;

                $this.funcs.updateDialogName(dialog.name, "false");
                $this.funcs.updateDialogChatListName(dialog.name, dialog.id);
                break;
            case "dialogdetailchanged":
                var dialog = chatData.data;

                $this.funcs.updateDialogDetailChanged(dialog);
                break;
            default:
            }
        },
        sendMessage: function () {
            var text = $this.configs.elements.$chatMessageSendBox.val();

            if (text.length <= 0 || $this.configs.currentDialog == null) {
                return;
            }

            var requestData = {
                "senderId": currentUser.id,
                "content": text,
                "dialogId": $this.configs.currentDialog.id,
                "type": 1
            };

            var successCallback = function (response) {
                if (response != undefined && response != null && response != '') {
                    $this.funcs.clearChatMessageBox();
                    $this.funcs.addMessageToDialog(response);
                }   
            }

            var errorCallback = function(response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            }

            $.ajax({
                type: "POST",
                url: $this.configs.urls.sendMessageToDialog,
                data: requestData,
                success: function(response) {
                    return successCallback(response);
                },
                error: function(response) {
                    errorCallback(response);
                },
                beforeSend: function() {
                    //showAjaxLoadingMask();
                    $this.configs.elements.$chatMessageSendLoading.css({ display: 'block' });
                    $this.funcs.initOnSendContentBoxEvent(false);
                },
                complete: function() {
                    //hideAjaxLoadingMask();
                    $this.configs.elements.$chatMessageSendLoading.css({ display: 'none' });
                    $this.funcs.initOnSendContentBoxEvent(true);
                }
            });
        },
        // Process dialog from signalR
        processSeenDialog: function(message) {
            // If message is in current dialog
            if (message.senderId == currentUser.id &&
                $this.configs.currentDialog != null &&
                message.dialogId == $this.configs.currentDialog.id) {
                var indexM = $this.configs.currentDialog.dialogMessages.findIndex(function(item) {
                    return item.id == message.id;
                });

                // if message is newest
                if (indexM == 0) {
                    //var elemt = $(".livechat-message-item[message-id='" + message.id + "']");
                    var elemt = $(".livechat-message-item-name-text[message-id='" + message.id + "']").closest(".livechat-message-item");
                    elemt.find(".livechat-message-item-seen").css({ display: "none" });

                    if (message.seenMembers.length >= 2) {
                        var seenMember = "";
                        var otherMember = 0;

                        if ($this.configs.currentDialog.members.length > 2 &&
                            message.seenMembers.length == $this.configs.currentDialog.members.length) {
                            seenMember = "all";
                        } else {
                            for (var i = 0; i < message.seenMembers.length; i++) {
                                if (message.seenMembers[i] != currentUser.id) {
                                    otherMember = otherMember + 1;

                                    if (otherMember < 3) {

                                        if (seenMember != "") {
                                            seenMember = seenMember + ", ";
                                        }

                                        var member = $this.configs.currentDialog.members.find(function(dItem) {
                                            return dItem.id == message.seenMembers[i];
                                        });

                                        seenMember = seenMember + member.firstName;
                                    } else {
                                        seenMember = seenMember +
                                            " and " +
                                            (message.seenMembers.length - otherMember) +
                                            " others";
                                        break;
                                    }
                                }
                            }
                        }
                        elemt.find(".livechat-message-item-seen-member").html("by " + seenMember);
                        elemt.find(".livechat-message-item-seen").css({ display: "inline-block" });
                    }
                }
            }
        },
        addMessageToDialog: function(message) {
            if ($this.configs.currentDialog != null && $this.configs.currentDialog.id == message.dialogId) {
                message = $this.funcs.assignMessageToDialog(message);

                if (message.exist == undefined) {
                    var sender = ($this.configs.currentDialog.members || []).find(function(item) {
                        return item.id == message.senderId;
                    });

                    $this.funcs.renderMessage(message, sender, true);

                    $this.funcs.viewLastMessage();
                }
            }

            var chatItem = null;
            var chatIndex = 0;
            var chatId = null;

            if (message.members.length == 2) {
                // TODO: get id to top
                chatId = message.members.find(function(item) {
                    return item != currentUser.id;
                });
            }

            for (var i = 0; i < $this.configs.chatList.length; i++) {
                var item = $this.configs.chatList[i];

                if (item.dialogId == message.dialogId || item.id == chatId) {
                    chatItem = item;
                    chatIndex = i;
                    break;
                }
            }

            if (chatItem != null) {
                chatItem.lastMessage = message;
            }

            $this.funcs.addIncomingChatItemToListChat(chatItem, chatIndex, message.dialogId);

            if (message.senderId != currentUser.id) {
                var seen = (chatItem.lastMessage.seenMembers || []).find(function(item) {
                    return item == currentUser.id;
                });

                if (seen == null) {
                    document.title = chatItem.name + " messaged you";
                }
            }
        },
        assignMessageToDialog: function (message) {
            var thisMessage = ($this.configs.currentDialog.dialogMessages || []).find(function(item) {
                return item.id == message.id;
            });

            if (thisMessage != undefined && thisMessage != null) {
                thisMessage.content = message.content;
                message.exist = 1;

            } else {
                $this.configs.currentDialog.dialogMessages.unshift(message);
                $this.configs.currentDialog.lastMessage = message;
            }
            return message;
        },

        clearChatMessageBox: function() {
            $this.configs.elements.$chatMessageSendBox.val("");

            $this.configs.elements.$chatMessageSendBtn.css({
                display: "none"
            });
        },
        initSendContentBoxEvent: function(){
            // Init Keydown, have text and send message
            $this.funcs.clearChatMessageBox();

            $this.funcs.initOnSendContentBoxEvent(true);
        },
        initOnSendContentBoxEvent: function (turnOn) {
            $this.configs.elements.$chatMessageSendBox.off("keyup");
            $this.configs.elements.$chatMessageSendBtn.off("tap");
            $this.configs.elements.$chatMessageSendBtn.off("click");


            if (turnOn == true) {
                $this.configs.elements.$chatMessageSendBox.on("keyup",
                    function(e) {
                        var text = $(this).val();
                        if (e.keyCode == 13) {
                            $this.funcs.sendMessage();

                            //$this.funcs.clearChatMessageBox();

                            return;
                        }

                        $this.configs.elements.$chatMessageSendBtn.css({
                            display: text.length > 0 ? "block" : "none"
                        });
                    }
                );

                $this.configs.elements.$chatMessageSendBtn.on("tap click",
                    function() {
                        $this.funcs.sendMessage();

                        //$this.funcs.clearChatMessageBox();
                    }
                );
            }
        },         
        initEditChatDialogModal: function(){
            $("#btnEditDialog").on("tap click", function(){
                var memberList = $("#txtChatMembers").val();
                var groupname = $("#txtChatName").val();
                var dialogId = $this.configs.currentDialog.id;

                $this.funcs.dbUpdateDialogDetail(dialogId, memberList, groupname);
            });
        },
        dbUpdateDialogDetail: function(dialogid, members, name){
            var successCallback = function(response) {
                $("#EditDialogModal").modal("hide");
                
                if (response == null){
                    return;
                }

                console.log("Edit Chat Dialog", response);
                $this.configs.elements.$chatMessageHeader.find(".livechat-message-header-name").html(response.name);
                $this.configs.currentDialog.name = response.name;
                
                $this.configs.currentDialog.members = response.members;

                $this.funcs.updateDialogMemberDetail();
            }

            var errorCallback = function(response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            }    
            var requestData = {
                'id': dialogid,
                'name': name,
                members: members
            };

            $.ajax({
                type: "POST",
                url: $this.configs.urls.editDialog,
                data: requestData,
                success: function(response) {
                    successCallback(response);
                },
                error: function(response) {
                    errorCallback(response);
                },
                beforeSend: function() {
                    //showAjaxLoadingMask();
                },
                complete: function() {
                    //hideAjaxLoadingMask();
                }
            });
        },

        /* For Utilities */
        initUtilities: function(){
            $this.configs.defaultWindowTitle = document.title;

            $("body").tooltip({ selector: '[data-toggle=tooltip]' });
        },
        countUnseenDialog: function() {
            var count = 0;

            for (var i = 0; i < $this.configs.chatList.length; i++) {
                if ($this.configs.chatList[i].lastMessage != null) {
                    var seen = ($this.configs.chatList[i].lastMessage.seenMembers || []).find(function(item) {
                        return item == currentUser.id;
                    });

                    if (seen == null) {
                        count++;
                    }
                }
            }

            $this.configs.elements.$chatListCount.html(count);

            if (count > 0) {
                $this.configs.elements.$chatListCountContainer.css({ "display": "block" });
            } else {
                $this.configs.elements.$chatListCountContainer.css({ "display": "none" });
            }
        },
        initSelectDropDownUserList: function(){
            for (var i = 0; i < $this.configs.userList.length; i++) {
                var option = $("<option value='" + response.user[i].id + "'>" + response.user[i].firstName + " " + response.user[i].lastName + "</option>");
                $("#txtGroupMembers").append(option);
            }
        },
        initUserList: function(){
            var requestData = {
                skip: 0,
                take: 0
            };

            var successCallback = function(response) {
                console.log(response);
                $this.configs.userList = [];
                $("#txtGroupMembers").find("option").remove();

                if (response.user != undefined && response.user) {
                    for (var i = 0; i < response.user.length; i++) {
                        $this.configs.userList.push(response.user[i]);

                        var option = $("<option value='" + response.user[i].id + "'>" + response.user[i].firstName + " " + response.user[i].lastName + "</option>");
                        $("#txtGroupMembers").append(option);
                        $("#txtChatMembers").append(option.clone());
                    }
                }

                $this.funcs.initListChat();
                $this.funcs.initLastChatDialog();
            }

            var errorCallback = function(response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            }

            $.ajax({
                type: "POST",
                url: $this.configs.urls.getUserList,
                data: requestData,
                success: function(response) {
                    return successCallback(response);
                },
                error: function(response) {
                    errorCallback(response);
                },
                beforeSend: function() {
                    //showAjaxLoadingMask();
                },
                complete: function() {
                    //hideAjaxLoadingMask();
                }
            }); 
        }
    }
}

var liveChatWidget;

$(document).ready(function () {
    liveChatWidget = new LiveChatWidget();

    liveChatWidget.funcs.initPage();
});