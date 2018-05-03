var runSheetConfigs = {
    selectors: {
        $: {
            leftPanel: $(".rs-left-panel"),
            calendar: $(".rs-date-picker"),
            calendarMoveLeft: $(".rs-time-left"),
            calendarMoveRight: $(".rs-time-right"),
            calendarTimeTitle: $(".rs-current-time"),
            calendarPanel: $("#rs-calendar-panel"),
            shiftStatusTmpl: $("#shiftStatusTmpl"),
            editWorkLogTmpl: $("#editWorkLogTmpl")
        },
        selectBoxGroupHeader: ".rs-select-box-group .g-header",
        boxPanel: ".rs-select-box-panel",
        dragable: ".draggable",
        txtSearchItem: ".txtSearchItem",
        teamLeaderBox: "#team-leader-box",
        teamMemberBox: "#team-member-box",
        contractorBox: "#contractor-box",
        ownedPlantEquipmentBox: "#owned-plant-equipment-box",
        vehicleBox: "#vehicle-box",
        hiredPlantEquipmentBox: "#hired-plant-equipment-box",
        unAvailableBox: "#unavailable-box",
        onLeaveEmployeeBox: "#onleaveemployee-box",
        editWorkLogModal: "#EditWorkLogModal"
    },
    templates: {
        groupBoxTmpl: $.templates("#groupBoxTmpl")
    },
    types: {
        teamLeader: "TeamLeader",
        teamMember: "TeamMember",
        ownedPlantEquipment: "OwnedPlantEquipment",
        hiredPlantEquipment: "HiredPlantEquipment",
        vehicle: "Vehicle",
        contractor: "Contractor",
        unAvailable: "UnAvailable",
        onLeaveEmployee: "OnLeaveEmployee"
    },
    urls: {
        getMasterData: apiUrl.runSheet.getMasterData,
        assignEmployee: apiUrl.runSheet.assignEmployee,
        removeResource: apiUrl.runSheet.removeResource,
        assignAsset: apiUrl.runSheet.assignAsset,
        assignContractor: apiUrl.runSheet.assignContractor,
        assignUnAvailable: apiUrl.runSheet.assignUnAvailable,
        reduceQuantityTeamMember: apiUrl.runSheet.reduceQuantityTeamMember
    },
    data: {
        shifts: [],
        terminatedUsers: [],
        summary: {
            teamLeaderAvailable: 0,
            teamMemberAvailable: 0,
            shiftCreatedToday: 0
        }
    },
    userType: {
        admin: 1,
        operation: 2,
        account: 3
    },
    worklogType: {
        teamLeader: 1,
        teamMember: 2,
        contractor: 3
    },
    workLogStatus: {
        pending: 1,
        confirmed: 2,
        declined: 3
    },
    profileType: {
        management: 1,
        salesperson: 2,
        projectManager: 3,
        teamLeader: 4,
        teamMember: 5
    },
    unAvailableType: {
        teamLeader: 1,
        teamMember: 2,
        both: 3,
        unknow: 4
    }
};

var runSheetFunctions = {
    initPage: function () {
        runSheetFunctions.initDatePicker();
        runSheetFunctions.fixHeight();
        runSheetFunctions.initEvents();
    },
    initEvents: function () {
        // calendar Move Left on click
        runSheetConfigs.selectors.$.calendarMoveLeft.on("click", function (evt) {
            evt.preventDefault();
            var date = runSheetConfigs.selectors.$.calendar.datepicker("getDate");
            date.setDate(date.getDate() - 1);
            runSheetFunctions.setDatePickerDate(date);
        });

        // calendar Move Right on click
        runSheetConfigs.selectors.$.calendarMoveRight.on("click", function (evt) {
            evt.preventDefault();
            var date = runSheetConfigs.selectors.$.calendar.datepicker("getDate");
            date.setDate(date.getDate() + 1);
            runSheetFunctions.setDatePickerDate(date);
        });

        // Set left panel position
        window.addEventListener("scroll", function (event) {
            runSheetFunctions.fixHeight();

            var scroll = $(window).scrollTop();
            var anchor_top = $("#datatable").offset().top;
            var anchor_bottom = $("#bottom_anchor").offset().top;

            if (scroll > anchor_top && scroll < anchor_bottom) {
                var clone_table = $("#clone");
                if (clone_table.length === 0) {
                    clone_table = $("#datatable").clone();
                    clone_table.attr('id', 'clone');
                    clone_table.width($("#rs-right-panel").width());
                    clone_table.find("tbody").html("");
                    clone_table.addClass('fixed-table');

                    var index = 0;
                    $("#datatable th").each(function () {
                        var $th = $(this);
                        var width = $th.width();
                        $(clone_table.find('th').get(index)).width(width);
                        $(clone_table.find('th').get(index)).css('max-width', width + 'px');
                        $(clone_table.find('th').get(index)).css('min-width', width + 'px');
                        $(clone_table.find('th').get(index)).css('padding', '2px 0 2px 2px');
                        index++;
                    });

                    $("#rs-right-panel").append(clone_table);
                }
            }
            else {
                $("#clone").remove();
            }
        }, false);

        // Set left panel position
        $("#datatable-scroll")[0].addEventListener("scroll", function (event) {
            runSheetFunctions.fixHeight(true);

            var scroll = $(window).scrollTop();
            var anchor_top = $("#datatable").offset().top;
            var anchor_bottom = $("#bottom_anchor").offset().top;

            if (scroll + 25 > anchor_top && scroll + 25 < anchor_bottom) {
                var clone_table = $("#clone");
                if (clone_table.length === 0) {
                    clone_table = $("#datatable").clone();
                    clone_table.attr('id', 'clone');
                    clone_table.width($("#rs-right-panel").width());
                    clone_table.find("tbody").html("");
                    clone_table.addClass('fixed-table');

                    var index = 0;
                    $("#datatable th").each(function () {
                        var $th = $(this);
                        var width = $th.width();
                        $(clone_table.find('th').get(index)).width(width);
                        $(clone_table.find('th').get(index)).css('max-width', width + 'px');
                        $(clone_table.find('th').get(index)).css('min-width', width + 'px');
                        $(clone_table.find('th').get(index)).css('padding', '2px 0 2px 2px');
                        index++;
                    });

                    $("#rs-right-panel").append(clone_table);
                }
            }
            else {
                $("#clone").remove();
            }
        }, false);

        window.onresize = function (event) {
            var isFullScreen = $('.page-portlet-fullscreen') != null && $('.page-portlet-fullscreen').length > 0;

            runSheetFunctions.fixHeight(isFullScreen);
        };

        $('.fullscreen').on('click', function () {
            if ($(this).hasClass('minimize')) {
                $(this).html('<i class="fa fa-expand"></i>&nbsp;Full screen');
            } else {
                $(this).html('<i class="fa fa-compress"></i>&nbsp;Normal screen');
            }

            $(this).toggleClass('minimize');

            var isFullScreen = $('.page-portlet-fullscreen') == null || $('.page-portlet-fullscreen').length == 0;

            runSheetFunctions.fixHeight(isFullScreen);
        });

        // Show/hide select box
        $(document).delegate(runSheetConfigs.selectors.selectBoxGroupHeader, "click", function () {
            var $current = $(this);
            var type = $current.data("type");
            var masterData = runSheetFunctions.getMasterDataItem(type);
            var $gContent = $current.next().next().next();

            $gContent.slideToggle("fast", function () {
                if (masterData.isExpand) {
                    $current.removeClass("down");
                    $current.addClass("right");
                    $gContent.hide();
                } else {
                    $current.removeClass("right");
                    $current.addClass("down");
                    $gContent.show();
                }

                masterData.isExpand = !masterData.isExpand;
            });
        });

        // Remove team leader event
        $(document).delegate("tr.editable li.removeable.team-leader-item .fa-trash", "click", function () {
            var $li = $(this).closest("li.removeable");
            var shifts = runSheetConfigs.data.shifts || [];
            var shiftId = runSheetFunctions.getShiftId($li);
            var shift = shifts.find(function (item) {
                return item.id == shiftId;
            });
            // Permission
            if (runSheetFunctions.canNotEditShift(shift)) return;
            var itemData = runSheetFunctions.getDataFromDraggableItem($li) || (runSheetConfigs.data.terminatedUsers || []).find(function (item) {
                return item.id == ($li).data("id")
            });
            var masterResource = runSheetFunctions.setAssignedMasterResourceByType(itemData.type, itemData.id, true);
            var requestParam = {
                date: runSheetFunctions.getCurrentDate(),
                shiftId: shift.id,
                entityId: itemData.id,
                runSheetType: runSheetConfigs.types.teamLeader
            };

            var successCallback = function (response) {
                showAjaxSuccessMessage(`${itemData.name} has been removed successfully`);

                var teamLeader = shift.teamLeader;

                shift.teamLeader = null;
                shift.shiftStatus = response.shiftStatus;
                shift.shiftStatusName = response.shiftStatusName;
                shift.workLogs = runSheetFunctions.removeWorkLog(shift, itemData.id, runSheetConfigs.worklogType.teamLeader);

                var isOverlap = runSheetFunctions.isOverlapWorkLog(shifts, shift, teamLeader);

                // Update shift's overlap
                (shifts || []).forEach(function (item) {
                    // Team leader
                    if (item.teamLeader && item.teamLeader.id == itemData.id) {
                        item.teamLeader.isOverlap = isOverlap;
                    }
                    // Team member
                    (item.teamMembers || []).forEach(function (itemTeamMember) {
                        if (itemTeamMember.id == itemData.id) {
                            itemTeamMember.isOverlap = isOverlap;
                        }
                    });
                });

                // Update unknow worklog
                (shift.unKnowWorkLogs || []).forEach(function(unKnowWorkLog) {
                    if(unKnowWorkLog.employeeId == itemData.id) {
                        unKnowWorkLog.employeeId = null;
                    }
                })

                // Update master data
                if (runSheetFunctions.isTeamLeaderOverlap(shifts, shift, itemData.id) == false) {
                    var teamLeaderMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamLeader, itemData.id, false);
                    runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamLeader, teamLeaderMasterResource.masterDataItem);
                }

                if (runSheetFunctions.isTeamMemberOverlap(shifts, shift, itemData.id) == false) {
                    var teamMemberMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamMember, itemData.id, false);
                    runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamMember, teamMemberMasterResource.masterDataItem);
                }

                // Update available box
                if (response.unAvailable != null) {
                    //response.unAvailable.name = itemData.name;
                    runSheetFunctions.removeMasterResourceByType(runSheetConfigs.types.teamLeader, itemData.id);
                    runSheetFunctions.removeMasterResourceByType(runSheetConfigs.types.teamMember, itemData.id);
                    runSheetFunctions.addNewMasterResourceByType(runSheetConfigs.types.unAvailable, response.unAvailable);
                }

                runSheetFunctions.reloadLocalDataTable();
            }

            runSheetFunctions.removeResource(requestParam, successCallback);
        });

        // Remove team member event
        $(document).delegate("tr.editable li.removeable.team-member-item .fa-trash", "click", function () {
            var $li = $(this).closest("li.removeable");
            var shifts = runSheetConfigs.data.shifts || [];
            var shiftId = runSheetFunctions.getShiftId($li);
            var shift = shifts.find(function (item) {
                return item.id == shiftId;
            });
            // Permission
            if (runSheetFunctions.canNotEditShift(shift)) return;
            var itemData = (shift.teamMembers || []).find(function (item) {
                return item.id == $($li).data("id")
            });
            var masterResource = runSheetFunctions.setAssignedMasterResourceByType(itemData.type, itemData.id, true) || (runSheetConfigs.data.terminatedUsers || []).find(function (item) {
                return item.id == ($li).data("id")
            });
            var requestParam = {
                date: runSheetFunctions.getCurrentDate(),
                shiftId: shift.id,
                entityId: itemData.id,
                runSheetType: runSheetConfigs.types.teamMember
            };
            var successCallback = function (response) {
                showAjaxSuccessMessage(`${itemData.name} has been removed successfully`);

                shift.teamMembers = (shift.teamMembers || []).filter(function (item) {
                    return item.id != itemData.id;
                });

                shift.workLogs = runSheetFunctions.removeWorkLog(shift, itemData.id, runSheetConfigs.worklogType.teamMember);
                shift.shiftStatus = response.shiftStatus;
                shift.shiftStatusName = response.shiftStatusName;

                var isOverlap = runSheetFunctions.isOverlapWorkLog(shifts, shift, itemData);

                // Update shift's overlap
                (shifts || []).forEach(function (item) {
                    // Team leader
                    if (item.teamLeader && item.teamLeader.id == itemData.id) {
                        item.teamLeader.isOverlap = isOverlap;
                    }
                    // Team member
                    (item.teamMembers || []).forEach(function (itemTeamMember) {
                        if (itemTeamMember.id == itemData.id) {
                            itemTeamMember.isOverlap = isOverlap;
                        }
                    });
                });

                // Update unknown worklog
                // When remove a known TM in runsheet we have two cases:
                //  1.Incase quantity of Unknown TM is 0: we show a TM Required and increase the quantity of unknown TM to 1
                //  2.Incase quantity of Unknown TM is greater than 0: just show unknown worklog agains
                if(shift.quantityOfTeamMember == 0) {
                    shift.quantityOfTeamMember += 1;

                    if(response.unKnowWorklog) {
                        shift.unKnowWorkLogs.push(response.unKnowWorklog);
                    }
                } else if (shift.quantityOfTeamMember > 0) {
                    // Update unknow worklog
                    var isExistUnknowWorkLog = (shift.unKnowWorkLogs || []).find(function(unKnowWorkLog) {
                        return unKnowWorkLog.employeeId != itemData.id;
                    })

                    if(!isExistUnknowWorkLog) {
                        shift.unKnowWorkLogs = (shift.unKnowWorkLogs || []).filter(function(unKnowWorkLog) {
                            return unKnowWorkLog.employeeId != itemData.id;
                        })
                        
                    } else {
                        shift.quantityOfTeamMember += 1;
                        
                        if(response.unKnowWorklog) {
                            shift.unKnowWorkLogs.push(response.unKnowWorklog);
                        }
                    }
                }

                // Update master data
                if (runSheetFunctions.isTeamLeaderOverlap(shifts, shift, itemData.id) == false) {
                    var teamLeaderMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamLeader, itemData.id, false);
                    runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamLeader, teamLeaderMasterResource.masterDataItem);
                }

                if (runSheetFunctions.isTeamMemberOverlap(shifts, shift, itemData.id) == false) {
                    var teamMemberMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamMember, itemData.id, false);
                    runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamMember, teamMemberMasterResource.masterDataItem);
                }

                // Update available box
                if (response.unAvailable != null) {
                    //response.unAvailable.name = itemData.name;
                    runSheetFunctions.removeMasterResourceByType(runSheetConfigs.types.teamLeader, itemData.id);
                    runSheetFunctions.removeMasterResourceByType(runSheetConfigs.types.teamMember, itemData.id);
                    runSheetFunctions.addNewMasterResourceByType(runSheetConfigs.types.unAvailable, response.unAvailable);
                }

                runSheetFunctions.reloadLocalDataTable();
            }

            runSheetFunctions.removeResource(requestParam, successCallback);
        });

        // Remove asset event
        $(document).delegate("tr.editable li.removeable.assigned-asset-item .fa-trash", "click", function () {
            var $li = $(this).closest("li.removeable");
            var shifts = runSheetConfigs.data.shifts || [];
            var shiftId = runSheetFunctions.getShiftId($li);
            var shift = shifts.find(function (item) {
                return item.id == shiftId;
            });
            // Permission
            if (runSheetFunctions.canNotEditShift(shift)) return;
            var itemData = runSheetFunctions.getDataFromDraggableItem($li);
            var records = [];
            switch (itemData.type) {
                case runSheetConfigs.types.ownedPlantEquipment: {
                    records = shift.ownedPlantEnquipments;

                    break;
                }
                case runSheetConfigs.types.hiredPlantEquipment: {
                    records = shift.hiredPlantEquipments;

                    break;
                }
                case runSheetConfigs.types.vehicle: {
                    records = shift.vehicles;

                    break;
                }
            }

            itemData = (records || []).find(function (item) {
                return item.id == itemData.id;
            });
            var masterResource = runSheetFunctions.setAssignedMasterResourceByType(itemData.type, itemData.id, true);
            var requestParam = {
                date: runSheetFunctions.getCurrentDate(),
                shiftId: shift.id,
                entityId: itemData.id,
                runSheetType: itemData.type
            };
            var successCallback = function (response) {
                showAjaxSuccessMessage(`${itemData.name} has been removed successfully`);

                switch (itemData.type) {
                    case runSheetConfigs.types.ownedPlantEquipment: {
                        shift.ownedPlantEnquipments = (shift.ownedPlantEnquipments || []).filter(function (item) {
                            return item.id != itemData.id;
                        });

                        break;
                    }
                    case runSheetConfigs.types.hiredPlantEquipment: {
                        shift.hiredPlantEquipments = (shift.hiredPlantEquipments || []).filter(function (item) {
                            return item.id != itemData.id;
                        });

                        break;
                    }
                    case runSheetConfigs.types.vehicle: {
                        shift.vehicles = (shift.vehicles || []).filter(function (item) {
                            return item.id != itemData.id;
                        });

                        break;
                    }
                }

                // Update overlap
                var isOverlap = itemData.type == runSheetConfigs.types.hiredPlantEquipment
                    ? false
                    : runSheetFunctions.isOverlapAssetWhenRemove(shifts, shift, itemData, itemData.type);

                // Update shift's overlap
                (shifts || []).forEach(function (item) {
                    switch (itemData.type) {
                        case runSheetConfigs.types.ownedPlantEquipment: {
                            // OP&E
                            (item.ownedPlantEnquipments || []).forEach(function (ownedPlantEnquipment) {
                                if (ownedPlantEnquipment.id == itemData.id) {
                                    ownedPlantEnquipment.isOverlap = isOverlap;
                                }
                            });
                            break;
                        }
                        // case runSheetConfigs.types.hiredPlantEquipment: {
                        //     // HP&E
                        //     (item.hiredPlantEquipments || []).forEach(function(hiredPlantEquipment){
                        //         if(hiredPlantEquipment.id == itemData.id) {
                        //             hiredPlantEquipment.isOverlap =  isOverlap;
                        //         }
                        //     });
                        //     break;
                        // }
                        case runSheetConfigs.types.vehicle: {
                            // Vehicle
                            (item.vehicles || []).forEach(function (vehicle) {
                                if (vehicle.id == itemData.id) {
                                    vehicle.isOverlap = isOverlap;
                                }
                            });

                            break;
                        }
                    }
                });

                // Update master data
                var masterResourceData = runSheetFunctions.setAssignedMasterResourceByType(itemData.type, itemData.id, false);
                runSheetFunctions.triggerBindingMasterDataToTemplate(itemData.type, masterResourceData.masterDataItem);
                runSheetFunctions.reloadLocalDataTable();
            }

            runSheetFunctions.removeResource(requestParam, successCallback);
        });

        // Remove contractor event
        $(document).delegate("tr.editable li.removeable.contractor-item .fa-trash", "click", function () {
            var $li = $(this).closest("li.removeable");
            var shifts = runSheetConfigs.data.shifts || [];
            var shiftId = runSheetFunctions.getShiftId($li);
            var shift = shifts.find(function (item) {
                return item.id == shiftId;
            });
            // Permission
            if (runSheetFunctions.canNotEditShift(shift)) return;
            var itemData = (shift.contractors || []).find(function (item) {
                return item.id == $($li).data("id")
            });
            var masterResource = runSheetFunctions.setAssignedMasterResourceByType(itemData.type, itemData.id, true);
            var requestParam = {
                date: runSheetFunctions.getCurrentDate(),
                shiftId: shift.id,
                entityId: itemData.id,
                runSheetType: itemData.type
            };
            var successCallback = function (response) {
                showAjaxSuccessMessage(`${itemData.name} has been removed successfully`);

                shift.contractors = (shift.contractors || []).filter(function (item) {
                    return item.id != itemData.id;
                });

                shift.workLogs = runSheetFunctions.removeWorkLog(shift, itemData.id, runSheetConfigs.worklogType.contractor);
                shift.shiftStatus = response.shiftStatus;
                shift.shiftStatusName = response.shiftStatusName;

                var isOverlap = false;//runSheetFunctions.isOverlapWorkLog(shifts, shift, itemData);

                // Update shift's overlap
                (shifts || []).forEach(function (item) {
                    // Contractors
                    (item.contractors || []).forEach(function (itemContractor) {
                        if (itemContractor.id == itemData.id) {
                            itemContractor.isOverlap = isOverlap;
                        }
                    });
                });

                // Update master data
                var contractorMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.contractor, itemData.id, false);
                runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.contractor, contractorMasterResource.masterDataItem);
                runSheetFunctions.reloadLocalDataTable();
            }

            runSheetFunctions.removeResource(requestParam, successCallback);
        });

        // Event for search on select box
        $(document).delegate(runSheetConfigs.selectors.txtSearchItem, "keypress", function (e) {
            if (e.which == 13) {
                var $txtSearch = $(this);
                var type = $txtSearch.data("type");
                var keyword = $txtSearch.val().toLowerCase().trim();
                var masterDataItem = runSheetFunctions.getMasterDataItem(type);
                var records = [];

                // Search on local data
                if (!keyword || keyword === "") {
                    records = masterDataItem.originalRecords;
                } else if (masterDataItem.originalRecords && masterDataItem.originalRecords.length > 0) {
                    records = masterDataItem.originalRecords.filter(function (record) {
                        var recordName = !record.name ? "" : record.name.toLowerCase();
                        return recordName.indexOf(keyword) !== -1;
                    });
                }

                masterDataItem.keyword = keyword;
                runSheetFunctions.setSearchMasterDataItem(type, records);

                $txtSearch.focus();
            }
        });

        runSheetConfigs.selectors.$.calendarPanel.find(".rs-datepicker-header").on("changeDate", function (ev) {
        });

        runSheetConfigs.selectors.$.calendarPanel.find(".rs-datepicker-header").on("mouseover", function () {
            runSheetConfigs.selectors.$.calendar.removeClass("hidden");
            var isFullScreen = $('.page-portlet-fullscreen') != null && $('.page-portlet-fullscreen').length > 0;
            runSheetFunctions.fixHeight(isFullScreen);
        });

        runSheetConfigs.selectors.$.calendarPanel.on("mouseleave", function () {
            runSheetConfigs.selectors.$.calendar.addClass("hidden");
            var isFullScreen = $('.page-portlet-fullscreen') != null && $('.page-portlet-fullscreen').length > 0;
            runSheetFunctions.fixHeight(isFullScreen);
        });

        // Reduce amount of team member
        $(document).delegate("tr.editable li.removeable.team-member-required-item .fa-trash", "click", function () {
            var $li = $(this).closest("li.removeable");
            var shifts = runSheetConfigs.data.shifts || [];
            var shiftId = runSheetFunctions.getShiftId($li);
            var shift = shifts.find(function (item) {
                return item.id == shiftId;
            });
            // Permission
            if (runSheetFunctions.canNotEditShift(shift)) return;

            var unKnowWorkLogId = parseInt($li.data('id'));
            var requestParam = {
                shiftId: shift.id,
                unKnowWorkLogId: unKnowWorkLogId
            };
            var successCallback = function (response) {
                showAjaxSuccessMessage(`Team member has been reduced successfully`);

                shift.quantityOfTeamMember = response.quantityOfTeamMember;
                shift.unKnowWorkLogs = shift.unKnowWorkLogs.filter(function(unknowWorkLog) {
                    return unknowWorkLog.id != unKnowWorkLogId
                })

                runSheetFunctions.reloadLocalDataTable();
            }

            runSheetFunctions.reduceTeamMember(requestParam, successCallback);
        });

        runSheetSignalR.initPage();
    },
    getMasterData: function () {
        var requestData = {
            date: runSheetFunctions.getCurrentDate()
        };
        var successCallback = function (response) {
            runSheetConfigs.data.masterData = runSheetFunctions.initMasterData();

            // Set data for team leaders
            runSheetFunctions.setMasterDataItem(runSheetConfigs.types.teamLeader, response.teamLeaders);

            // Set data for team members
            runSheetFunctions.setMasterDataItem(runSheetConfigs.types.teamMember, response.teamMembers);

            // Set data for OP&Es
            runSheetFunctions.setMasterDataItem(runSheetConfigs.types.ownedPlantEquipment, response.ownedPlantEnquipments);

            // Set data for HP&E
            runSheetFunctions.setMasterDataItem(runSheetConfigs.types.hiredPlantEquipment, response.hiredPlantEquipments);

            // Set data for contractors
            runSheetFunctions.setMasterDataItem(runSheetConfigs.types.contractor, response.contractors);

            // Set data for vehicles
            runSheetFunctions.setMasterDataItem(runSheetConfigs.types.vehicle, response.vehicles);

            // Set data for UnAvailable
            runSheetFunctions.setMasterDataItem(runSheetConfigs.types.unAvailable, response.unAvailables);

            // Set data for On Leave Employee
            runSheetFunctions.setMasterDataItem(runSheetConfigs.types.onLeaveEmployee, response.onLeaveEmployees);

            // Shifts
            runSheetConfigs.data.shifts = response.shifts;

            // terminated users
            runSheetConfigs.data.terminatedUsers = response.terminatedUsers;

            // Summary
            runSheetConfigs.data.summary = response.summary;

            // Reload summary
            runSheetFunctions.setSummary('team-leader-details', runSheetConfigs.data.summary.teamLeaderAvailable);
            runSheetFunctions.setSummary('team-member-details', runSheetConfigs.data.summary.teamMemberAvailable);
            runSheetFunctions.setSummary('shift-created-details', runSheetConfigs.data.summary.shiftCreatedToday);

            if (!runSheetDatatableConfigs.$table) {
                runSheetDatatableFunctions.initPage();
            } else {
                runSheetFunctions.reloadLocalDataTable();
            }
        };
        var errorCallback = function (response) {
            if (typeof (response.responseJSON) !== "undefined") {
                showAjaxFailureMessage(response.responseJSON);
            } else {
                var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                showAjaxFailureMessage(text);
            }
        }

        $.ajax({
            type: "POST",
            url: runSheetConfigs.urls.getMasterData,
            data: requestData,
            success: function (response) {
                return successCallback(response);
            },
            error: function (response) {
                errorCallback(response);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    /* Events */
    initDatePicker: function () {
        if (jQuery().datepicker) {
            var currentDate = new Date();
            if (runSheetConfigs.shiftIndexModel && runSheetConfigs.shiftIndexModel.Date && runSheetConfigs.shiftIndexModel.Date != "") {
                var splitArray = runSheetConfigs.shiftIndexModel.Date.split("/");
                currentDate = new Date(splitArray[2], splitArray[1] - 1, splitArray[0]);
                //currentDate = new Date(runSheetConfigs.shiftIndexModel.Date);
            }
            runSheetConfigs.selectors.$.calendar.datepicker({
                rtl: App.isRTL(),
                orientation: "left",
                autoclose: true,
                todayHighlight: true,
                dateFormat: "mm/dd/yy"
            })
                .on("changeDate", function (e) {
                    runSheetFunctions.onDateChange();
                });

            runSheetConfigs.selectors.$.calendar.datepicker().datepicker("setDate", currentDate);

            var date = moment(currentDate);
            runSheetConfigs.selectors.$.calendarTimeTitle.html(`${date.format('dddd')} ${date.format("Do of MMMM")}`);
        }
    },
    initDrag: function (el) {
        // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // it doesn't need to have a start or end
        var eventObject = {
            title: $.trim(el.text()) // use the element's text as the event title
        };
        // store the Event Object in the DOM element so we can get to it later
        el.data("eventObject", eventObject);
        // make the event draggable using jQuery UI
        el.draggable({
            containment: "document",
            helper: "clone",
            zIndex: 10000,
            eventBackgroundColor: "red"
        });
    },
    fixHeight: function (isFullScreen) {
        var height = $(".rs-left-panel").height();
        var calendarHeight = $(".rs-calendar-panel").height();
        var portletTitleHeight = 0;
        var rsHeaderHeight = $(".rs-header").height();
        jQuery("#rs-right-panel").css("min-height", height);
        jQuery("#run-sheet .portlet-body").css("height", "auto !important");

        var scrollY = window.scrollY;
        if (isFullScreen) {
            scrollY = jQuery("#datatable-scroll").scrollTop();
        }

        if (scrollY < 203) {
            if (!isFullScreen || isFullScreen == false) {
                runSheetConfigs.selectors.$.leftPanel.css("top", 180 - scrollY);
                var maxHeight = screen.height - calendarHeight - portletTitleHeight - rsHeaderHeight - 240 + scrollY;
                jQuery(".rs-select-box-panel").css("max-height", maxHeight - 50);
            } else {
                runSheetConfigs.selectors.$.leftPanel.css("top", 90);
                var maxHeight = screen.height - calendarHeight - portletTitleHeight - rsHeaderHeight - 150 + scrollY;
                jQuery(".rs-select-box-panel").css("max-height", maxHeight - 50);
            }
        } else {
            if (!isFullScreen || isFullScreen == false) {
                runSheetConfigs.selectors.$.leftPanel.css("top", 68);
            } else {
                runSheetConfigs.selectors.$.leftPanel.css("top", 90);
            }
            var maxHeight = screen.height - calendarHeight - portletTitleHeight - 30;
            jQuery(".rs-select-box-panel").css("max-height", maxHeight - 50);
        }
    },
    assignEmployee: function (requestData, successCallback) {
        $.ajax({
            type: "POST",
            url: runSheetConfigs.urls.assignEmployee,
            data: requestData,
            success: function (response) {
                showAjaxSuccessMessage(`${response.name} has been scheduled successfully`);
                successCallback(response);
            },
            error: function (response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    assignAsset: function (requestData, successCallback) {
        $.ajax({
            type: "POST",
            url: runSheetConfigs.urls.assignAsset,
            data: requestData,
            success: function (response) {
                showAjaxSuccessMessage(`${response.name} has been scheduled successfully`);
                successCallback(response);
            },
            error: function (response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    assignContractor: function (requestData, successCallback) {
        $.ajax({
            type: "POST",
            url: runSheetConfigs.urls.assignContractor,
            data: requestData,
            success: function (response) {
                showAjaxSuccessMessage(`${response.name} has been scheduled successfully`);
                successCallback(response);
            },
            error: function (response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    assignUnAvailable: function (requestData, successCallback) {
        $.ajax({
            type: "POST",
            url: runSheetConfigs.urls.assignUnAvailable,
            data: requestData,
            success: function (response) {
                showAjaxSuccessMessage(`${response.name} has been scheduled successfully`);
                successCallback(response);
            },
            error: function (response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    removeResource: function (requestData, successCallback) {
        $.ajax({
            type: "POST",
            url: runSheetConfigs.urls.removeResource,
            data: requestData,
            success: function (response) {
                successCallback(response);
            },
            error: function (response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    reduceTeamMember: function (requestData, successCallback) {
        $.ajax({
            type: "POST",
            url: runSheetConfigs.urls.reduceQuantityTeamMember,
            data: requestData,
            success: function (response) {
                successCallback(response);
            },
            error: function (response) {
                if (typeof (response.responseJSON) !== "undefined") {
                    showAjaxFailureMessage(response.responseJSON);
                } else {
                    var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
                }
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    minimiseAll: function () {
        var minimiseCallback = function (type) {
            var masterData = runSheetFunctions.getMasterDataItem(type);
            if (!masterData.isExpand) return;

            var $current = $(`${runSheetConfigs.selectors.selectBoxGroupHeader}[data-type='${type}']`);
            var $gContent = $current.next().next().next();

            $gContent.slideToggle("fast", function () {
                $current.removeClass("down");
                $current.addClass("right");
                $gContent.hide();

                masterData.isExpand = false;
            });
        }

        minimiseCallback(runSheetConfigs.types.teamLeader);
        minimiseCallback(runSheetConfigs.types.teamMember);
        minimiseCallback(runSheetConfigs.types.ownedPlantEquipment);
        minimiseCallback(runSheetConfigs.types.hiredPlantEquipment);
        minimiseCallback(runSheetConfigs.types.vehicle);
        minimiseCallback(runSheetConfigs.types.contractor);
        minimiseCallback(runSheetConfigs.types.unAvailable);
    },

    /* Helper Methods */

    // Set date picker date
    setDatePickerDate: function (date) {
        runSheetConfigs.selectors.$.calendar.datepicker("setDate", date);
    },
    onDateChange: function () {
        var date = runSheetConfigs.selectors.$.calendar.datepicker("getDate");
        var momentDate = moment(date);

        runSheetConfigs.selectors.$.calendarTimeTitle.html(`${momentDate.format('dddd')} ${momentDate.format("Do of MMMM")}`);
        runSheetFunctions.getMasterData();
    },
    // Get current date on the datetime control
    getCurrentDate: function () {
        var date = runSheetConfigs.selectors.$.calendar.datepicker("getDate");

        return moment(date).format("MM/DD/YYYY");
    },
    // Init default master data
    initMasterData: function () {
        if (runSheetConfigs.data.masterData) return runSheetConfigs.data.masterData;

        return [
            {
                boxId: runSheetConfigs.selectors.teamLeaderBox,
                boxTitle: "Team Leaders",
                type: runSheetConfigs.types.teamLeader,
                keyword: null,
                originalRecords: [],
                records: [],
                isExpand: false
            },
            {
                boxId: runSheetConfigs.selectors.teamMemberBox,
                boxTitle: "Team Members",
                type: runSheetConfigs.types.teamMember,
                keyword: null,
                originalRecords: [],
                records: [],
                isExpand: false
            },
            {
                boxId: runSheetConfigs.selectors.contractorBox,
                boxTitle: "Contractors",
                type: runSheetConfigs.types.contractor,
                keyword: null,
                originalRecords: [],
                records: [],
                isExpand: false
            },
            {
                boxId: runSheetConfigs.selectors.ownedPlantEquipmentBox,
                boxTitle: "Owned Plant & Equipment",
                type: runSheetConfigs.types.ownedPlantEquipment,
                keyword: null,
                originalRecords: [],
                records: [],
                isExpand: false
            },
            {
                boxId: runSheetConfigs.selectors.hiredPlantEquipmentBox,
                boxTitle: "Hired Plant & Equipment",
                type: runSheetConfigs.types.hiredPlantEquipment,
                keyword: null,
                originalRecords: [],
                records: [],
                isExpand: false
            },
            {
                boxId: runSheetConfigs.selectors.vehicleBox,
                boxTitle: "Vehicles",
                type: runSheetConfigs.types.vehicle,
                keyword: null,
                originalRecords: [],
                records: [],
                isExpand: false
            },
            {
                boxId: runSheetConfigs.selectors.unAvailableBox,
                boxTitle: "Unavailable",
                type: runSheetConfigs.types.unAvailable,
                keyword: null,
                originalRecords: [],
                records: [],
                isExpand: false
            },
            {
                boxId: runSheetConfigs.selectors.onLeaveEmployeeBox,
                boxTitle: "Employees On Leave",
                type: runSheetConfigs.types.onLeaveEmployee,
                keyword: null,
                originalRecords: [],
                records: [],
                isExpand: false
            }
        ];
    },
    // Get box id by type
    getBoxIdByType: function (type) {
        switch (type) {
            case runSheetConfigs.types.teamLeader: return runSheetConfigs.selectors.teamLeaderBox;
            case runSheetConfigs.types.teamMember: return runSheetConfigs.selectors.teamMemberBox;
            case runSheetConfigs.types.contractor: return runSheetConfigs.selectors.contractorBox;
            case runSheetConfigs.types.ownedPlantEquipment: return runSheetConfigs.selectors.ownedPlantEquipmentBox;
            case runSheetConfigs.types.hiredPlantEquipment: return runSheetConfigs.selectors.hiredPlantEquipmentBox;
            case runSheetConfigs.types.vehicle: return runSheetConfigs.selectors.vehicleBox;
            case runSheetConfigs.types.unAvailable: return runSheetConfigs.selectors.unAvailableBox;
            case runSheetConfigs.types.onLeaveEmployee: return runSheetConfigs.selectors.onLeaveEmployeeBox;
        }
    },
    // Get one item of master data
    getMasterDataItem: function (type) {
        return runSheetConfigs.data.masterData.find(function (item) {
            return item.type == type;
        });
    },
    // Set master item data for master data
    setMasterDataItem: function (type, records) {
        var masterDataItem = runSheetFunctions.getMasterDataItem(type);

        masterDataItem.originalRecords = records;
        masterDataItem.records = records || [];

        // Binding data to template
        var boxId = runSheetFunctions.getBoxIdByType(type);
        runSheetConfigs.templates.groupBoxTmpl.link(boxId, masterDataItem);

        // Init drag/ drop event
        $(boxId).find(runSheetConfigs.selectors.dragable).each(function () {
            runSheetFunctions.initDrag($(this));
        });
    },
    // Set master item data for master data
    setSearchMasterDataItem: function (type, records) {
        var masterDataItem = runSheetFunctions.getMasterDataItem(type);
        masterDataItem.records = records || [];

        // Binding data to template
        var boxId = runSheetFunctions.getBoxIdByType(type);
        runSheetConfigs.templates.groupBoxTmpl.link(boxId, masterDataItem);

        // Init drag/ drop event
        $(boxId).find(runSheetConfigs.selectors.dragable).each(function () {
            runSheetFunctions.initDrag($(this));
        });
    },
    // Generate html for assigned assets
    generateAssgnedAssetHtml: function (itemData) {
        itemData.name = (itemData.name + "").replace(/\((.+?)\)/g, "").trim();
        var overlapClass = itemData.isOverlap ? "overlap-item" : "";
        var employeeName = '';
        var type = '';
        var itemStatusHtml = '';

        if (itemData.type == runSheetConfigs.types.vehicle) {
            employeeName = !itemData.driverName || itemData.driverName == ''
                ? !itemData.contractorName || itemData.contractorName == '' 
                    ? '' 
                    : ' - Contractor: ' + itemData.contractorName
                : ' - Driver: ' + itemData.driverName;
            type = 'Vehicle';
        } else if (itemData.type == runSheetConfigs.types.ownedPlantEquipment) {
            employeeName = !itemData.operatorName || itemData.operatorName == ''
                ? !itemData.contractorName || itemData.contractorName == '' 
                    ? '' 
                    : ' - Contractor: ' + itemData.contractorName
                : ' - Operator: ' + itemData.operatorName;
            type = 'Owned P&E';
        } else {
            type = 'Hired P&E';
        }

        switch(type) {
            case 'Vehicle': {
                itemStatusHtml =
                    `<div class="assigned-item-status">`

                    if(itemData.driverName && itemData.driverName != '') {
                        itemStatusHtml += `<span>- Driver: ${itemData.driverName}</span><br/>`;
                    } else if(itemData.contractorName && itemData.contractorName != '') {
                        itemStatusHtml += `<span>- Contractor: ${itemData.contractorName}</span><br/>`;
                    }

                itemStatusHtml += `
                        <span>- Type: ${type}</span>
                    </div>`;
                break;
            }
            case 'Owned P&E': {
                 itemStatusHtml =
                    `<div class="assigned-item-status">`

                    if(itemData.operatorName && itemData.operatorName != '') {
                        itemStatusHtml += `<span>- Operator: ${itemData.operatorName}</span><br/>`;
                    } else if(itemData.contractorName && itemData.contractorName != '') {
                        itemStatusHtml += `<span>- Contractor: ${itemData.contractorName}</span><br/>`;
                    }

                itemStatusHtml += `
                        <span>- Type: ${type}</span>
                    </div>`;
                break;
            }
            case 'Hired P&E': {
                itemStatusHtml =
                    `<div class="assigned-item-status">
                    <span>- Type: ${type}</span><br/>
                    <span>- Quantity: ${itemData.quantity}</span>
                    <br/>
                </div>`;

                break;
            }
        }

        var html =
            `<li class="removeable assigned-item assigned-asset-item ${overlapClass}" data-id = "${itemData.id}" data-type = "${itemData.type}" data-name = "${itemData.name}"> 
                <div class="assigned-item-container">
                    <div class="assigned-item-text editable">${itemData.name}</div>
                    <i class = "assigned-item-icon fa fa-trash"  data-toggle = "tooltip" data-placement = "bottom" title = "Remove" ></i>
                </div>
                ${itemStatusHtml}    
            </li>`;

        return html;
    },

    // Generate html for team leader
    generateTeamLeaderHtml: function (itemData) {
        if (!itemData) return '';
        var overlapClass = itemData.isOverlap ? "overlap-item" : "";
        var specificText = runSheetFunctions.getWorkTimeRange(itemData.workLog);
        var workLogStatusClass = runSheetFunctions.getWorkTimeStatusClass(itemData.workLog);
        var html =
            `<li class="removeable assigned-item team-leader-item ${overlapClass} ${workLogStatusClass}" data-id = "${itemData.id}" data-type = "${itemData.type}" data-name = "${itemData.name}">
                <div class="assigned-item-text editable">${itemData.name}${specificText}</div>
                <i class = "assigned-item-icon fa fa-trash" data-toggle = "tooltip" data-placement = "bottom" title = "Remove"></i>
            </li>`;

        return html;
    },

    generateDefaultTeamLeaderHtml: function (shift) {
        if(shift.shiftStatus == runSheetConfigs.shiftStatus.cancelled.id) return '';

        var unknowWorkLogs = (shift.unKnowWorkLogs || []).filter(function(unknowWorkLog) {
            return unknowWorkLog.worklogType == runSheetConfigs.worklogType.teamLeader
        })

        var listHtml = '';

        unknowWorkLogs.forEach(function (unknowWorkLog) {
            var specificText = runSheetFunctions.getWorkTimeRange(unknowWorkLog);
            listHtml +=  `<li class="assigned-item team-leader-required-item required-item" data-shiftId="${shift.id}" data-id="${unknowWorkLog.id}" data-type="${unknowWorkLog.worklogType}">
                            <div class="assigned-item-text editable">Team Leader Required ${specificText}</div>
                        </li>`
        })

        return listHtml;
    },

    // Generate html for team members
    generateTeamMemberHtml: function (itemData) {
        var overlapClass = itemData.isOverlap ? "overlap-item" : "";
        var specificText = runSheetFunctions.getWorkTimeRange(itemData.workLog);
        var workLogStatusClass = runSheetFunctions.getWorkTimeStatusClass(itemData.workLog);
        var html =
            `<li class="removeable assigned-item team-member-item ${overlapClass} ${workLogStatusClass}" data-id = "${itemData.id}" data-type = "${itemData.type}" data-name = "${itemData.name}">
                <div class="assigned-item-text editable">${itemData.name}${specificText}</div>
                <i class = "assigned-item-icon fa fa-trash"  data-toggle = "tooltip" data-placement = "bottom" title = "Remove" ></i>  
            </li>`;

        return html;
    },

    generateDefaultTeamMemberHtml: function (shift) {
        if(shift.shiftStatus == runSheetConfigs.shiftStatus.cancelled.id) return '';
        
        var unknowWorkLogs = (shift.unKnowWorkLogs || []).filter(function(unknowWorkLog) {
            return unknowWorkLog.worklogType == runSheetConfigs.worklogType.teamMember && unknowWorkLog.employeeId == null
        })

        var listHtml = '';
       
        unknowWorkLogs.forEach(function (unknowWorkLog) {
            var specificText = runSheetFunctions.getWorkTimeRange(unknowWorkLog);
            listHtml +=  `<li class="removeable assigned-item team-member-required-item required-item" data-shiftId="${shift.id}" data-id="${unknowWorkLog.id}" data-type="${unknowWorkLog.worklogType}">
                            <div class="assigned-item-text assigned-item-text editable">Team Member Required ${specificText}</div>
                            <i class = "assigned-item-icon fa fa-trash"  data-toggle = "tooltip" data-placement = "bottom" title = "Remove" ></i>  
                        </li>`;
        })

        return listHtml;
    },

    // Generate html for contractors
    generateContractorHtml: function (itemData) {
        var overlapClass = itemData.isOverlap ? "overlap-item" : "";
        var specificText = "";
        var total = !itemData.workLogs ? 0 : itemData.workLogs.length;
        var itemStatusHtml =
            `<div class="assigned-item-status">
                    <span>- Quantity: ${total}</span>
                </div>`;

        var html =
            `<li class="removeable assigned-item contractor-item ${overlapClass} " data-id = "${itemData.id}" data-type = "${itemData.type}" data-name = "${itemData.name}">
                <div class="assigned-item-container">
                    <div class="assigned-item-text editable">${itemData.name}${specificText}</div>
                    <i class = "assigned-item-icon fa fa-trash" data-toggle = "tooltip" data-placement = "bottom" title = "Remove" ></i>
                </div>
                ${itemStatusHtml}
            </li>`;

        return html;
    },

    // Get shift background class by status
    getShiftBackground: function (shiftStatus) {
        switch (shiftStatus) {
            case runSheetConfigs.shiftStatus.planned.id: return "bg-shift-planned";
            case runSheetConfigs.shiftStatus.shiftConfirmed.id: return "bg-shift-confirmed";
            case runSheetConfigs.shiftStatus.dispatched.id: return "bg-shift-dispatched";
            case runSheetConfigs.shiftStatus.personnelConfirmed.id: return "bg-shift-personnel-confirmed";
            case runSheetConfigs.shiftStatus.active.id: return "bg-shift-active";
            case runSheetConfigs.shiftStatus.complete.id: return "bg-shift-complete";
            case runSheetConfigs.shiftStatus.cancelled.id: return "bg-shift-cancelled";
            default: return "";
        }
    },
    // Get column class by type
    getShiftColumnClass: function (runSheetType, availableType, $droppedOn) {
        console.log("$droppedOn: ", $droppedOn.hasClass("team-leader"))
        console.log("$droppedOn: ", $droppedOn.hasClass("team-member"))
        switch (runSheetType) {
            case runSheetConfigs.types.teamLeader: return "team-leader";
            case runSheetConfigs.types.teamMember: return "team-member";
            case runSheetConfigs.types.contractor: return "contractor";
            case runSheetConfigs.types.ownedPlantEquipment:
            case runSheetConfigs.types.hiredPlantEquipment:
            case runSheetConfigs.types.vehicle:
                return "assigned-assets";
            case runSheetConfigs.types.unAvailable: {
                switch (availableType) {
                    case runSheetConfigs.unAvailableType.teamLeader: return "team-leader";
                    case runSheetConfigs.unAvailableType.teamMember: return "team-member";
                    case runSheetConfigs.unAvailableType.both: return "team-leader";
                    // {
                    //     if($droppedOn.hasClass("team-leader")) return "team-leader";
                    //     if($droppedOn.hasClass("team-member")) return "team-member";
                    // }
                }
            }
        }

        return "";
    },
    // Get work time range
    getWorkTimeRange: function (workLog) {
        //if (workLog == null || workLog.isSpecific === false) return "";
        var startTime = getLocalFromUtcWithFormat(workLog.startTime, constant.time24Format);
        var finishTime = getLocalFromUtcWithFormat(workLog.finishTime, constant.time24Format);
        return ` - (${startTime}-${finishTime})`;
    },
    // Get work time range
    getWorkTimeStatusClass: function (workLog) {
        if (workLog == null || workLog.worklogStatus == runSheetConfigs.workLogStatus.pending) return "";
        return workLog.worklogStatus == runSheetConfigs.workLogStatus.confirmed
            ? "worklog-confirmed"
            : "worklog-declined";
    },
    // Get new worklog
    getNewWorkLog: function (shift, resource, workLogType) {
        return {
            id: 0,
            entityId: resource.id,
            shiftId: shift.id,
            startTime: shift.startDateTime,
            finishTime: shift.finishDateTime,
            break: 0,
            travel: 0,
            isSpecific: false,
            name: resource.name,
            worklogStatus: workLogType == runSheetConfigs.worklogType.contractor ? runSheetConfigs.workLogStatus.confirmed : runSheetConfigs.workLogStatus.pending,
            worklogType: workLogType,
            isDeleted: false
        };
    },
    // Get new employee worklog
    getNewEmployeeWorkLog: function (shift, resource, workLogType, unknowWorklog) {
        return {
            id: 0,
            entityId: resource.id,
            shiftId: shift.id,
            startTime: !unknowWorklog ? shift.startDateTime : unknowWorklog.startTime,
            finishTime: !unknowWorklog ? shift.finishDateTime : unknowWorklog.finishTime,
            break: !unknowWorklog ? 0 : unknowWorklog.break,
            travel: !unknowWorklog ? 0 : unknowWorklog.travel,
            isSpecific: false,
            name: resource.name,
            worklogStatus: !unknowWorklog ? runSheetConfigs.workLogStatus.pending : unknowWorklog.worklogStatus,
            worklogType: workLogType,
            isDeleted: false
        };
       
    },
    // Check whether this worklog is specific or not
    isOverlapWorkLog: function (shifts, shift, resource) {
        var isOverlap = false;
        if (resource != null && resource.workLog != null) {
            var startTime = new Date(resource.workLog.startTime);
            var finishTime = new Date(resource.workLog.finishTime);

            isOverlap = (shifts || []).filter(function (shiftItem) {
                return (shiftItem.workLogs || []).filter(function (workLog) {
                    var workLogStartTime = new Date(workLog.startTime);
                    var workLogFinishTime = new Date(workLog.finishTime);

                    return workLog.entityId == resource.workLog.entityId
                        && workLog.worklogType == resource.workLog.worklogType
                        && ((startTime >= workLogStartTime && startTime < workLogFinishTime)
                            || (finishTime >= workLogStartTime && finishTime < workLogFinishTime));
                }).length >= 1;
            }).length >= 1;
        }
        return isOverlap;
    },
    // Check whether this worklog is specific or not
    isOverlapBasedOnType: function (shifts, resourceWorkLog) {
        var startTime = new Date(resourceWorkLog.startTime);
        var finishTime = new Date(resourceWorkLog.finishTime);

        var isOverlap = (shifts || []).filter(function (shiftItem) {
            return (shiftItem.workLogs || []).filter(function (workLog) {
                var workLogStartTime = new Date(workLog.startTime);
                var workLogFinishTime = new Date(workLog.finishTime);

                return workLog.entityId == resourceWorkLog.entityId
                    && workLog.worklogType == resourceWorkLog.worklogType
                    && ((startTime >= workLogStartTime && startTime < workLogFinishTime)
                        || (finishTime >= workLogStartTime && finishTime < workLogFinishTime));
            }).length >= 1
        }).length >= 1;
        return isOverlap;
    },
    // Is asset overlap when schedule
    isOverlapAsset: function (shifts, shift, resource, runsheetType) {
        var startTime = new Date(shift.startDateTime);
        var finishTime = new Date(shift.finishDateTime);

        var isOverlap = (shifts || []).filter(function (shiftItem) {
            var shiftStartDateTime = new Date(shiftItem.startDateTime);
            var shiftFinishDateTime = new Date(shiftItem.finishDateTime);

            switch (runsheetType) {
                case runSheetConfigs.types.ownedPlantEquipment: {
                    return shift.id != shiftItem.id
                        && ((startTime >= shiftStartDateTime && startTime < shiftFinishDateTime)
                            || (finishTime >= shiftStartDateTime && finishTime < shiftFinishDateTime))
                        && (shiftItem.ownedPlantEnquipments || []).find(function (item) {
                            return item.id == resource.id;
                        }) != null;
                }
                case runSheetConfigs.types.vehicle: {
                    return shift.id != shiftItem.id
                        && ((startTime >= shiftStartDateTime && startTime < shiftFinishDateTime)
                            || (finishTime >= shiftStartDateTime && finishTime < shiftFinishDateTime))
                        && (shiftItem.vehicles || []).find(function (item) {
                            return item.id == resource.id;
                        }) != null;
                }
                case runSheetConfigs.types.hiredPlantEquipment: {
                    return shift.id != shiftItem.id
                        && ((startTime >= shiftStartDateTime && startTime < shiftFinishDateTime)
                            || (finishTime >= shiftStartDateTime && finishTime < shiftFinishDateTime))
                        && (shiftItem.hiredPlantEquipments || []).find(function (item) {
                            return item.id == resource.id;
                        }) != null;
                }
                default: return false;
            }

        }).length >= 1;

        return isOverlap;
    },
    // Is asset overlap when remove
    isOverlapAssetWhenRemove: function (shifts, shift, resource, runsheetType) {
        var startTime = new Date(shift.startDateTime);
        var finishTime = new Date(shift.finishDateTime);

        var isOverlap = (shifts || []).filter(function (shiftItem) {
            var shiftStartDateTime = new Date(shiftItem.startDateTime);
            var shiftFinishDateTime = new Date(shiftItem.finishDateTime);

            switch (runsheetType) {
                case runSheetConfigs.types.ownedPlantEquipment: {
                    return ((startTime >= shiftStartDateTime && startTime < shiftFinishDateTime)
                            || (finishTime >= shiftStartDateTime && finishTime < shiftFinishDateTime))
                        && (shiftItem.ownedPlantEnquipments || []).find(function(item){
                            return item.id == resource.id;
                        }) != null;
                }
                case runSheetConfigs.types.vehicle: {
                    return ((startTime >= shiftStartDateTime && startTime < shiftFinishDateTime)
                            || (finishTime >= shiftStartDateTime && finishTime < shiftFinishDateTime))
                        && (shiftItem.vehicles || []).find(function(item){
                            return item.id == resource.id;
                        }) != null;
                }
                case runSheetConfigs.types.hiredPlantEquipment: {
                    return ((startTime >= shiftStartDateTime && startTime < shiftFinishDateTime)
                            || (finishTime >= shiftStartDateTime && finishTime < shiftFinishDateTime))
                        && (shiftItem.hiredPlantEquipments || []).find(function(item){
                            return item.id == resource.id;
                        }) != null;
                }
                default: return false;
            }

        }).length >= 2;

        return isOverlap;
    },
    // Use to check whether team leader has been using or not
    isTeamLeaderOverlap: function (shifts, shift, teamLeaderId) {
        return (shifts || []).find(function (item) {
            return item.id != shift.id && item.teamLeader && item.teamLeader.id == teamLeaderId;
        }) != null;
    },
    // Use to check whether team member has been using or not
    isTeamMemberOverlap: function (shifts, shift, teamMemberId) {
        return (shifts || []).find(function (item) {
            return item.id != shift.id && item.teamMembers && item.teamMembers.find(function (teamMember) {
                return teamMember.id == teamMemberId;
            }) != null;
        }) != null;
    },
    isContractorOverlap: function (shifts, shift, contractorId) {
        return (shifts || []).find(function (item) {
            return item.id != shift.id && item.contractors && item.contractors.find(function (contractor) {
                return contractor.id == contractorId;
            }) != null;
        }) != null;
    },
    // Get current resource data
    getDataFromDraggableItem: function ($element) {
        var resourceId = $element.data("id");
        var type = $element.data("type");
        var resourceByType = runSheetFunctions.getResourceByType(type, resourceId);

        return resourceByType.originalResource;
    },
    // Get current shift ID
    getShiftId: function ($element) {
        var shiftId = $element.closest("tr").find("td.shiftId").html();
        return shiftId;
    },
    // Get master data and resource by type
    getResourceByType: function (type, resourceId) {
        var masterDataItem = runSheetFunctions.getMasterDataItem(type);
        var originalResource = (masterDataItem.originalRecords || []).find(function (item) {
            return item.id === resourceId;
        });
        var resource = (masterDataItem.records || []).find(function (item) {
            return item.id === resourceId;
        });

        return {
            masterDataItem: masterDataItem,
            originalResource: originalResource,
            resource: resource
        };
    },
    // Trigger update resource
    setAssignedMasterResourceByType: function (type, resourceId, isAssigned) {
        var masterResource = runSheetFunctions.getResourceByType(type, resourceId);

        if (masterResource.originalResource) masterResource.originalResource.isAssigned = isAssigned;
        if (masterResource.resource) masterResource.resource.isAssigned = isAssigned;

        return masterResource;
    },
    // Trigger remove resource
    removeMasterResourceByType: function (type, resourceId) {
        var masterDataItem = runSheetFunctions.getMasterDataItem(type);

        if (!masterDataItem.originalRecords || !masterDataItem.records) return;

        // Insert new resource
        masterDataItem.originalRecords = masterDataItem.originalRecords.filter(function (item) {
            return item.id != resourceId;
        });
        masterDataItem.records = masterDataItem.records.filter(function (item) {
            return item.id != resourceId;
        });

        // Reload resource
        runSheetFunctions.triggerBindingMasterDataToTemplate(type, masterDataItem);
    },
    // Trigger add new resource
    addNewMasterResourceByType: function (type, resource) {
        var masterDataItem = runSheetFunctions.getMasterDataItem(type);

        if (!masterDataItem.originalRecords) masterDataItem.originalRecords = [];
        if (!masterDataItem.records) masterDataItem.records = [];

        // Insert new resource
        masterDataItem.originalRecords = masterDataItem.originalRecords.filter(function (item) {
            return item.id != resource.id;
        });
        masterDataItem.records = masterDataItem.records.filter(function (item) {
            return item.id != resource.id;
        });
        masterDataItem.originalRecords.push(resource);
        masterDataItem.records.push(resource);

        // Reload resource
        runSheetFunctions.triggerBindingMasterDataToTemplate(type, masterDataItem);
    },
    // Trigger binding data to template
    triggerBindingMasterDataToTemplate: function (type, masterDataItem) {
        var boxId = runSheetFunctions.getBoxIdByType(type);
        runSheetConfigs.templates.groupBoxTmpl.link(boxId, masterDataItem);

        // Init drag/ drop event
        $(boxId).find(runSheetConfigs.selectors.dragable).each(function () {
            runSheetFunctions.initDrag($(this));
        });
    },
    // Trigger binding data to template
    triggerBindingWorkLogToTemplate: function (workLog) {
        var boxId = runSheetConfigs.selectors.editWorkLogModal;
        runSheetConfigs.templates.editWorkLogTmpl.link(boxId, workLog);
    },
    // Set all team leader over lap
    setTemLeaderOverlap: function (shifts, teamLeaderId, isOverlap) {
        (shifts || []).forEach(function (item) {

        });
    },
    // Remove a worklog item
    removeWorkLog: function (shift, entityId, worklogType) {
        return (shift.workLogs || []).filter(function (item) {
            return item.entityId != entityId && item.worklogType != worklogType;
        })
    },
    // Re load local data table data
    reloadLocalDataTable: function () {
        runSheetDatatableConfigs.$table.dataTable().fnClearTable();

        if (runSheetConfigs.data.shifts && runSheetConfigs.data.shifts.length > 0) {
            runSheetDatatableConfigs.$table.dataTable().fnAddData(runSheetConfigs.data.shifts);
        }
    },
    // Permission to edit shift
    canNotEditShift: function (shift) {
        return (currentUser.role !== runSheetConfigs.userType.admin
            && currentUser.role !== runSheetConfigs.userType.operation
            && shift.shiftStatus === runSheetConfigs.shiftStatus.active.id)
            || shift.shiftStatus === runSheetConfigs.shiftStatus.complete.id;
    },
    // Set summary data
    setSummary(boxClassDetail, value) {
        var $object = $(`.${boxClassDetail} .number span`);

        $object.data('value', value);
        $object.text(value);
    }
};

$(document).ready(function () {
    runSheetFunctions.initPage();
});
