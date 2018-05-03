var runSheetDatatableConfigs = {
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    urls: {
        getListShift: apiUrl.runSheet.getListShift,
        edit: apiUrl.shift.edit,
        getClone: apiUrl.shift.getClone,
        clone: apiUrl.shift.clone,
        delete: apiUrl.shift.delete,
        changeStatus: apiUrl.runSheet.changeStatus,
        getWorkLogTemplate: apiUrl.runSheet.getWorkLogTemplate,
        getUnKnowWorkLogTemplate: apiUrl.runSheet.getUnKNowWorkLogTemplate,
        editContractorWorkLog: apiUrl.runSheet.editContractorWorkLog,
        editEmployeeWorkLog: apiUrl.runSheet.editEmployeeWorkLog,
        editUnKnowWorkLog: apiUrl.runSheet.editUnKnowWorkLog,
        getShiftTimeRangeTemplate: apiUrl.runSheet.getEditShiftTimeRangeTemplate,
        editShiftTimeRange: apiUrl.runSheet.editShiftTimeRange,
        getEditAsset: apiUrl.runSheet.getEditAssetTemplate,
        editAsset: apiUrl.runSheet.editAsset,
        editQuantityTeamMember: apiUrl.runSheet.editQuantityTeamMember,
    },
    selectors: {
        btnCloneShift: ".btn-clone-shift",
        btnDeleteShift: ".btn-delete-shift",
        btnChangeShiftStatus: ".btn-change-shift-status",
        contractorItemEditable: ".contractor-item .editable",
        teamLeaderItemEditable: ".team-leader-item .editable",
        teamMemberItemEditable: ".team-member-item .editable",
        teamLeaderItemRequiredEditable: ".team-leader-required-item .editable",
        teamMemberItemRequiredEditable: ".team-member-required-item .editable",
        assetItemEditable: ".assigned-asset-item .editable",
        timeRangeItemEditable: ".time-range .editable",
        quantityTeamMemberItemEditable: ".quantity-team-member-item",
    },
    $: {
        editContractorWorkLogModal: $("#EditContractorWorkLogModal"),
        editEmployeeWorkLogModal: $("#EditEmployeeWorkLogModal"),
        editUnKnowWorkLogModal: $("#EditUnKnowWorkLogModal"),
        editShiftTimeRangeModal: $("#EditShiftTimeRangeModal"),
        editAssetModal: $("#EditAssetModal"),
        cloneModal: $("#CloneShiftModal"),
        editQuantityTeamMemberModal: $("#EditQuantityTeamMemberModal"),
    },
    profileTypes: {
        teamLeader: 4,
        teamMember: 5
    },
    shiftStatus: {
        cancelled: 7
    },
    liveDataHelper: null
};

var runSheetDatatableFunctions = {
    initPage: function (confs) {
        if (confs != null) {
            runSheetDatatableConfigs = Object.assign({}, runSheetDatatableConfigs, confs);
        }

        // Init live data events TODO: Continue to implement
        //runSheetDatatableConfigs.liveDataHelper = new LiveDatHelper();
        //runSheetDatatableConfigs.liveDataHelper.init("PushToWeb", function (response) { });

        runSheetDatatableFunctions.initDatatable();
        runSheetDatatableFunctions.initEvents();
    },
    initDatatable: function () {
        runSheetDatatableConfigs.$table = runSheetDatatableConfigs.$datatable.dataTable({
            "data": runSheetConfigs.data.shifts || [],
            "bFilter": false,
            "bPaginate": false,
            "aaSorting": [[3, 'asc']],
            "aoColumns": [
                {
                    "mData": "id",
                    "sClass": "hidden shiftId",
                    "bSearchable": false
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center action",
                    "render": function (data) {
                        var html = "<div class=' wrapper'>";

                        html += `<a href="${runSheetDatatableConfigs.urls.edit}/${data.id}" class="btn btn-xs btn-primary btn-edit-shift" ${tooltipHelper.edit("Shift")}><i class="fa fa-edit"></i></a></br>`;

                        // currentUser is global variable
                        if (runSheetFunctions.canNotEditShift(data)) {
                            if(data.shiftStatus === runSheetConfigs.shiftStatus.complete.id) {
                                html += `<button class="btn btn-xs btn-warning btn-clone-shift" data-id="${data.id}" data-toggle="tooltip" data-placement="bottom" title="Clone"><i class="fa fa-copy"></i></button></br>`;
                            } else {
                                html += `<button class="btn btn-xs btn-warning" disabled="disabled" data-id="${data.id}" data-toggle="tooltip" data-placement="bottom" title="Clone"><i class="fa fa-copy"></i></button></br>`;
                            }
                            html += `<button class="btn btn-xs red" disabled="disabled" data-toggle="tooltip" data-placement="bottom" title="Delete"><i class="fa fa-trash"></i></button>`;
                        } else {
                            html += `<button class="btn btn-xs btn-warning btn-clone-shift" data-id="${data.id}" data-toggle="tooltip" data-placement="bottom" title="Clone"><i class="fa fa-copy"></i></button></br>`;
                            if (data.shiftStatus === runSheetConfigs.shiftStatus.planned.id || data.shiftStatus === runSheetConfigs.shiftStatus.cancelled.id) {
                                html += `<button class="btn btn-xs btn-danger btn-delete-shift" data-id="${data.id}" data-toggle="tooltip" data-placement="bottom" title="Delete"><i class="fa fa-trash"></i></button>`;
                            } else {
                                html += `<button class="btn btn-xs btn-danger" disabled="disabled" data-toggle="tooltip" data-placement="bottom" title="Delete"><i class="fa fa-trash"></i></button>`;
                            }
                        }

                        html += "</div>";

                        return html;
                    }
                },
                {
                    "mData": "shiftNumber",
                    "bSortable": true,
                    "sClass": "text-center shift-number",
                    "bSearchable": false
                },
                {
                    "mData": null,
                    "bSortable": true,
                    "sClass": "text-center time-range",
                    "bSearchable": true,
                    "render": function (data) {
                        let html = "";

                        if (data.startDateTime) {
                            var editable = runSheetFunctions.canNotEditShift(data) ? "" : "editable";
                            html = `<span class="${editable}">${getLocalFromUtcWithFormat(data.startDateTime, constant.time24Format)}</span>`;
                        }

                        return html;
                    }
                },
                {
                    "mData": null,
                    "bSortable": true,
                    "sClass": "text-center time-range",
                    "bSearchable": true,
                    "render": function (data) {
                        let html = "";
                        if (data.finishDateTime){
                            var editable = runSheetFunctions.canNotEditShift(data) ? "" : "editable";
                            html += `<span class="${editable}">${getLocalFromUtcWithFormat(data.finishDateTime, constant.time24Format)}</span>`;
                        }
                        return html;
                    }
                },
                {
                    "mData": "client",
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "client text-center",
                },
                {
                    "mData": "location",
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "location text-center",
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "width": "10%",
                    "sClass": "assigned-assets",
                    "render": function (data) {
                        var html = `<ul class="g-items">`;

                        if(data.shiftStatus != runSheetConfigs.shiftStatus.cancelled.id){
                            var ownedPlantEnquipments = data.ownedPlantEnquipments;
                            var hiredPlantEquipments = data.hiredPlantEquipments;
                            var vehicles = data.vehicles;

                            // OP&Es
                            (ownedPlantEnquipments || []).forEach(function (item) {
                                html += runSheetFunctions.generateAssgnedAssetHtml(item);
                            });

                            // HP&Es
                            (hiredPlantEquipments || []).forEach(function (item) {
                                html += runSheetFunctions.generateAssgnedAssetHtml(item);
                            });

                            // Vehicles
                            (vehicles || []).forEach(function (item) {
                                html += runSheetFunctions.generateAssgnedAssetHtml(item);
                            });
                        }     
                          
                        html += `</ul>`;
                        return html;
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "width": "10%",
                    "sClass": "team-leader",
                    "render": function (data) {
                        var html = `<ul class="g-items">`;

                        if (data.shiftStatus != runSheetConfigs.shiftStatus.cancelled.id) {
                            if (data.teamLeader) {
                                html += runSheetFunctions.generateTeamLeaderHtml(data.teamLeader);
                            } else if (data.shiftStatus != runSheetConfigs.shiftStatus.cancelled.id) {
                                if (!data.isNotRequiredTeamLeader)
                                    html += runSheetFunctions.generateDefaultTeamLeaderHtml(data);
                            }
                        }
                        html += `</ul>`;

                        return html;
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "width": "10%",
                    "sClass": "team-member",
                    "render": function (data) {
                        var html = `<ul class="g-items">`;

                        if (data.shiftStatus != runSheetConfigs.shiftStatus.cancelled.id) {
                            // team members
                            (data.teamMembers || []).forEach(function(item) {
                                html += runSheetFunctions.generateTeamMemberHtml(item);
                            });

                            html += runSheetFunctions.generateDefaultTeamMemberHtml(data);
                        }

                        html += `</ul>`;

                        return html;
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "width": "10%",
                    "sClass": "contractor",
                    "render": function (data) {
                        var html = `<ul class="g-items">`;

                        // shift supplier
                        if (data.shiftStatus != runSheetConfigs.shiftStatus.cancelled.id) {
                            (data.contractors || []).forEach(function(item) {
                                html += runSheetFunctions.generateContractorHtml(item);
                            });
                        }

                        html += `</ul>`;
                        return html;
                    }
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "status",
                    "render": function (data) {
                        return runSheetDatatableFunctions.getShiftStatusTemplate(data);
                    }
                }
            ],
            "initComplete": function (settings, json) {
            },
            "rowCallback": function (row, data, index) {
                var $row = $(row);

                if (runSheetFunctions.canNotEditShift(data)) {
                    $row.addClass("ui-viewable");
                } else {
                    $row.addClass("editable");
                    $row.addClass("draggable");
                }

                var startHour24 = parseInt(getLocalFromUtcWithFormat(data.startDateTime, 'HH'));
                if (startHour24 >= 18) {
                    $row.addClass("night-shift");
                }

                $row.css("cursor", "pointer");
                $row.attr("role", "row");
            },
            "fnDrawCallback": function (settings) {
                

                runSheetDatatableConfigs.$datatable.find("tbody tr.draggable").droppable({
                    accept: ".draggable",
                    drop: function (event, ui) {
                         

                        var TYPE_ALLOW_ADJUST_QUANTITY = [
                            //runSheetConfigs.types.ownedPlantEquipment,
                            runSheetConfigs.types.hiredPlantEquipment,
                            //runSheetConfigs.types.vehicle,
                            runSheetConfigs.types.contractor
                        ];
                        var $droppedOn = $(this);
                        var $droppedElement = $(ui.draggable);
                        var itemData = runSheetFunctions.getDataFromDraggableItem($droppedElement);
                        var runSheetColumnName = runSheetFunctions.getShiftColumnClass(itemData.type, itemData.unAvailableType, $droppedOn);
                        if (!runSheetColumnName || runSheetColumnName == '') return;

                        var runsheetType = itemData.type == runSheetConfigs.types.unAvailable
                            ? runSheetColumnName == "team-leader"
                                ? runSheetConfigs.types.teamLeader
                                : runSheetConfigs.types.teamMember
                            : itemData.type;
                        var assignedResourceIds = $droppedOn.find(`td.${runSheetColumnName} .g-items li[data-type="${runsheetType}"]`).map(function () {
                            return $(this).data("id");
                        }).get();
                        assignedResourceIds = Array.isArray(assignedResourceIds) ? assignedResourceIds : [assignedResourceIds];
                        var currentItem = (assignedResourceIds || []).find(function (id) {
                            return id == (itemData.type == runSheetConfigs.types.unAvailable
                                ? itemData.parentId
                                : itemData.id);
                        });

                        // If resources already assgined to this shift then stop
                        if (currentItem != null && TYPE_ALLOW_ADJUST_QUANTITY.indexOf(runsheetType) == -1) return;

                        // Get current shift
                        var shiftId = runSheetFunctions.getShiftId($droppedOn);
                        var shifts = runSheetConfigs.data.shifts || [];
                        var shift = shifts.find(function (item) {
                            return item.id == shiftId;
                        });

                        // Permission
                        if (runSheetFunctions.canNotEditShift(shift)) return;

                        // Get reource from master data
                        var masterResource = runSheetFunctions.setAssignedMasterResourceByType(itemData.type, itemData.id, true);

                        // Get clone resource to add to data table
                        var cloneResource = JSON.parse(JSON.stringify(masterResource.originalResource));

                        var assignTeamLeaderCallback = function () {
                            // Validate
                            var teamMemberIds = $droppedOn.find(`td.team-member .g-items li[data-type="${runSheetConfigs.types.teamMember}"]`).map(function () {
                                return $(this).data("id");
                            }).get();
                            if ((teamMemberIds || []).indexOf(itemData.id) > -1) {
                                return;
                            }

                            var unknowWorkLog = (shift.unKnowWorkLogs || []).find(function (unknowWorkLog) {
                                return unknowWorkLog.worklogType == runSheetConfigs.worklogType.teamMember
                            })

                            // Create new work log and check whether this worklog has been overlap or not
                            cloneResource.workLog = runSheetFunctions.getNewEmployeeWorkLog(shift, cloneResource, runSheetConfigs.worklogType.teamLeader, unknowWorkLog);
                            cloneResource.isOverlap = runSheetFunctions.isOverlapWorkLog(shifts, shift, cloneResource);

                            var scheduleCallback = function (cloneResource) {
                                // Param
                                var requestParam = {
                                    shiftId: shift.id,
                                    runSheetType: itemData.type,
                                    data: cloneResource,
                                    unKnowWorkLogId: !unknowWorkLog ? null : unknowWorkLog.id
                                };
                                var successCallback = function (response) {
                                    cloneResource.workLog.id = response.workLog.id;
                                    // Update assigned for team members in case multiple user profile types
                                    var teamMemberMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamMember, itemData.id, true);

                                    // Update shift's overlap
                                    (shifts || []).forEach(function (item) {
                                        // Team leader
                                        if (item.teamLeader && item.teamLeader.id == cloneResource.id) {
                                            item.teamLeader.isOverlap = cloneResource.isOverlap;
                                        }
                                        // Team member
                                        (item.teamMembers || []).forEach(function (itemTeamMember) {
                                            if (itemTeamMember.id == cloneResource.id) {
                                                itemTeamMember.isOverlap = cloneResource.isOverlap;
                                            }
                                        });
                                    });

                                    shift.teamLeader = cloneResource;

                                    // Update unknow worklog
                                    if (unknowWorkLog != null)
                                        unknowWorkLog.employeeId = cloneResource.id;

                                    // Delete current work log
                                    if (assignedResourceIds && assignedResourceIds.length > 0) {
                                        shift.workLogs = runSheetFunctions.removeWorkLog(shift, assignedResourceIds[0], runSheetConfigs.worklogType.teamLeader);
                                    }

                                    // Add worklog into shift
                                    if (shift.workLogs == null) shift.workLogs = [];
                                    shift.workLogs.push(cloneResource.workLog);

                                    // Update shift status
                                    shift.shiftStatus = response.shiftStatus;
                                    shift.shiftStatusName = response.shiftStatusName;

                                    // Update current resource
                                    if (assignedResourceIds && assignedResourceIds.length > 0) {
                                        if (runSheetFunctions.isTeamLeaderOverlap(shifts, shift, assignedResourceIds[0]) == false) {
                                            var teamLeaderMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamLeader, assignedResourceIds[0], false);
                                            runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamLeader, teamLeaderMasterResource.masterDataItem);
                                        }

                                        if (runSheetFunctions.isTeamMemberOverlap(shifts, shift, assignedResourceIds[0]) == false) {
                                            var teamMemberMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamMember, assignedResourceIds[0], false);
                                            runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamMember, teamMemberMasterResource.masterDataItem);
                                        }
                                    }

                                    runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamMember, teamMemberMasterResource.masterDataItem);
                                    runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamLeader, masterResource.masterDataItem);
                                    runSheetFunctions.reloadLocalDataTable();
                                };

                                runSheetFunctions.assignEmployee(requestParam, successCallback);
                            }

                            // Once a person has been scheduled to a shift as a "Team Leader" you should not be able to schedule them to a second shift with overlapping time's as a "Team" Member"
                            if (cloneResource.profileTypes.indexOf(runSheetDatatableConfigs.profileTypes.teamMember) > -1) {
                                var newWorkLog = runSheetFunctions.getNewWorkLog(shift, cloneResource, runSheetConfigs.worklogType.teamMember);
                                var isOverlap = runSheetFunctions.isOverlapBasedOnType(shifts, newWorkLog);
                                if (isOverlap) return;
                            }

                            // Overlap warning
                            if (cloneResource.isOverlap) {
                                swal({
                                    text: 'Warning! This resource time conflicts with another shift in the Run Sheet',
                                    type: "warning",
                                    showCancelButton: true,
                                    confirmButtonClass: "btn-danger",
                                    confirmButtonText: "Proceed",
                                    cancelButtonText: "Cancel",
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        scheduleCallback(cloneResource);
                                    }
                                });
                            } else {
                                scheduleCallback(cloneResource);
                            }
                        }

                        var assignTeamMemberCallback = function () {
                            // Validate
                            if ($droppedOn.find(`td.team-leader .g-items li[data-type="${runSheetConfigs.types.teamLeader}"]`).data("id") == itemData.id) {
                                return;
                            }
                            var unknowWorkLog = (shift.unKnowWorkLogs || []).find(function(unknowWorkLog) {
                                return unknowWorkLog.worklogType == runSheetConfigs.worklogType.teamMember &&  unknowWorkLog.employeeId == null
                            })

                            // Create new work log and check whether this worklog has been overlap or not
                            cloneResource.workLog = runSheetFunctions.getNewEmployeeWorkLog(shift, cloneResource, runSheetConfigs.worklogType.teamMember, unknowWorkLog);
                            cloneResource.isOverlap = runSheetFunctions.isOverlapWorkLog(shifts, shift, cloneResource);

                            var scheduleCallback = function (cloneResource) {
                                // Param
                                var requestParam = {
                                    shiftId: shift.id,
                                    runSheetType: itemData.type,
                                    data: cloneResource,
                                    unKnowWorkLogId: !unknowWorkLog ? null : unknowWorkLog.id
                                };
                                var successCallback = function (response) {
                                    cloneResource.workLog.id = response.workLog.id;

                                    // Update assigned for team members in case multiple user profile types
                                    var teamLeaderMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamLeader, itemData.id, true);

                                    // Update shift's overlap
                                    (shifts || []).forEach(function (item) {
                                        // Team leader
                                        if (item.teamLeader && item.teamLeader.id == cloneResource.id) {
                                            item.teamLeader.isOverlap = cloneResource.isOverlap;
                                        }
                                        // Team member
                                        (item.teamMembers || []).forEach(function (itemTeamMember) {
                                            if (itemTeamMember.id == cloneResource.id) {
                                                itemTeamMember.isOverlap = cloneResource.isOverlap;
                                            }
                                        });
                                    });

                                    if (!shift.teamMembers) shift.teamMembers = [];

                                    shift.teamMembers = shift.teamMembers.filter(function(teamMember) {
                                        return teamMember.id != cloneResource.id
                                    })
                                    shift.teamMembers.push(cloneResource);

                                    // Update unknow worklog
                                    if (unknowWorkLog != null)
                                    unknowWorkLog.employeeId = cloneResource.id;

                                    // Add worklog into shift
                                    if (shift.workLogs == null) shift.workLogs = [];
                                    shift.workLogs.push(cloneResource.workLog);

                                    // Update shift status
                                    shift.shiftStatus = response.shiftStatus;
                                    shift.shiftStatusName = response.shiftStatusName;

                                    // Update current resource
                                    if (assignedResourceIds && assignedResourceIds.length > 0) {
                                        if (runSheetFunctions.isTeamLeaderOverlap(shifts, shift, assignedResourceIds[0]) == false) {
                                            var teamLeaderMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamLeader, assignedResourceIds[0], false);
                                            runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamLeader, teamLeaderMasterResource.masterDataItem);
                                        }

                                        if (runSheetFunctions.isTeamMemberOverlap(shifts, shift, assignedResourceIds[0]) == false) {
                                            var teamMemberMasterResource = runSheetFunctions.setAssignedMasterResourceByType(runSheetConfigs.types.teamMember, assignedResourceIds[0], false);
                                            runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamMember, teamMemberMasterResource.masterDataItem);
                                        }
                                    }

                                    runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamLeader, teamLeaderMasterResource.masterDataItem);
                                    runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.teamMember, masterResource.masterDataItem);
                                    runSheetFunctions.reloadLocalDataTable();
                                };

                                runSheetFunctions.assignEmployee(requestParam, successCallback);
                            }

                            // Once a person has been scheduled to a shift as a "Team Leader" you should not be able to schedule them to a second shift with overlapping time's as a "Team" Member"
                            if (cloneResource.profileTypes.indexOf(runSheetDatatableConfigs.profileTypes.teamLeader) > -1) {
                                var newWorkLog = runSheetFunctions.getNewWorkLog(shift, cloneResource, runSheetConfigs.worklogType.teamLeader);
                                var isOverlap = runSheetFunctions.isOverlapBasedOnType(shifts, newWorkLog);
                                if (isOverlap) return;
                            }

                            // Overlap warning
                            if (cloneResource.isOverlap) {
                                swal({
                                    text: `Warning! This resource time conflicts with another shift in the Run Sheet`,
                                    type: "warning",
                                    showCancelButton: true,
                                    confirmButtonClass: "btn-danger",
                                    confirmButtonText: "Proceed",
                                    cancelButtonText: "Cancel",
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        scheduleCallback(cloneResource);
                                    }
                                });
                            } else {
                                scheduleCallback(cloneResource);
                            }
                        }

                        var assignContractorCallback = function () {
                            // Create new work log and check whether this worklog has been overlap or not
                            cloneResource.workLogs = [runSheetFunctions.getNewWorkLog(shift, cloneResource, runSheetConfigs.worklogType.contractor)];
                            cloneResource.isOverlap = false;//runSheetFunctions.isOverlapWorkLog(shifts, shift, cloneResource);

                            var scheduleCallback = function (cloneResource) {
                                // Param
                                var requestParam = {
                                    shiftId: shift.id,
                                    runSheetType: itemData.type,
                                    data: cloneResource
                                };
                                var successCallback = function (response) {
                                    cloneResource.workLogs[0].id = response.workLogs[0].id;

                                    //Update shift's overlap
                                    (shifts || []).forEach(function (item) {
                                        // contractors
                                        (item.contractors || []).forEach(function (itemContractor) {
                                            if (itemContractor.id == cloneResource.id) {
                                                itemContractor.isOverlap = cloneResource.isOverlap;
                                            }
                                        });
                                    });

                                    // Add contractor into shift
                                    if (!shift.contractors) shift.contractors = [];
                                    var shiftContractor = (shift.contractors || []).find(function (item) {
                                        return item.id == cloneResource.id;
                                    })

                                    if (!shiftContractor) {
                                        shift.contractors.push(cloneResource);
                                    } else {
                                        (cloneResource.workLogs || []).forEach(function (item) {
                                            shiftContractor.workLogs.push(item);
                                        });
                                    }

                                    // Add worklog into shift
                                    if (shift.workLogs == null) shift.workLogs = [];
                                    (cloneResource.workLogs || []).forEach(function (item) {
                                        shift.workLogs.push(item);
                                    });

                                    // Update shift status
                                    shift.shiftStatus = response.shiftStatus;
                                    shift.shiftStatusName = response.shiftStatusName;

                                    // Update current resource
                                    if (assignedResourceIds && assignedResourceIds.length > 0 && runSheetFunctions.isContractorOverlap(shifts, shift, assignedResourceIds[0]) == false) {
                                        var contractorMasterData = runSheetFunctions.setAssignedMasterResourceByType(itemData.type, assignedResourceIds[0], false);
                                        runSheetFunctions.triggerBindingMasterDataToTemplate(itemData.type, contractorMasterData.masterDataItem);
                                    }

                                    runSheetFunctions.triggerBindingMasterDataToTemplate(itemData.type, masterResource.masterDataItem);
                                    runSheetFunctions.reloadLocalDataTable();
                                };

                                runSheetFunctions.assignContractor(requestParam, successCallback);
                            }

                            // Overlap warning
                            if (cloneResource.isOverlap) {
                                swal({
                                    text: `Warning! This resource time conflicts with another shift in the Run Sheet`,
                                    type: "warning",
                                    showCancelButton: true,
                                    confirmButtonClass: "btn-danger",
                                    confirmButtonText: "Proceed",
                                    cancelButtonText: "Cancel",
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        scheduleCallback(cloneResource);
                                    }
                                });
                            } else {
                                scheduleCallback(cloneResource);
                            }
                        }

                        var assignAssetCallback = function () {
                            cloneResource.isOverlap = itemData.type == runSheetConfigs.types.hiredPlantEquipment
                                ? false
                                : runSheetFunctions.isOverlapAsset(shifts, shift, cloneResource, itemData.type);

                            var scheduleCallback = function (cloneResource) {
                                // Param
                                var requestParam = {
                                    shiftId: shift.id,
                                    runSheetType: itemData.type,
                                    data: cloneResource
                                };
                                var successCallback = function (response) {
                                    cloneResource.quantity = response.quantity;

                                    switch (itemData.type) {
                                        case runSheetConfigs.types.ownedPlantEquipment: {
                                            if (!shift.ownedPlantEnquipments) shift.ownedPlantEnquipments = [];
                                            var ownedPlantEnquipment = shift.ownedPlantEnquipments.find(function (item) {
                                                return item.id == cloneResource.id;
                                            });
                                            if (ownedPlantEnquipment == null) {
                                                shift.ownedPlantEnquipments.push(cloneResource);
                                            } else {
                                                ownedPlantEnquipment.quantity = response.quantity;
                                            }

                                            cloneResource.operatorName = response.operatorName;
                                            cloneResource.contractorName = response.contractorName;

                                            break;
                                        }
                                        case runSheetConfigs.types.hiredPlantEquipment: {
                                            if (!shift.hiredPlantEquipments) shift.hiredPlantEquipments = [];
                                            var hiredPlantEquipment = shift.hiredPlantEquipments.find(function (item) {
                                                return item.id == cloneResource.id;
                                            });
                                            if (hiredPlantEquipment == null) {
                                                shift.hiredPlantEquipments.push(cloneResource);
                                            } else {
                                                hiredPlantEquipment.quantity = response.quantity;
                                            }

                                            break;
                                        }
                                        case runSheetConfigs.types.vehicle: {
                                            if (!shift.vehicles) shift.vehicles = [];
                                            var vehicle = shift.vehicles.find(function (item) {
                                                return item.id == cloneResource.id;
                                            });
                                            if (vehicle == null) {
                                                shift.vehicles.push(cloneResource);
                                            } else {
                                                vehicle.quantity = response.quantity;
                                            }

                                            cloneResource.driverName = response.driverName;
                                            cloneResource.contractorName = response.contractorName;

                                            break;
                                        }
                                    }

                                    // Update shift status
                                    shift.shiftStatus = response.shiftStatus;
                                    shift.shiftStatusName = response.shiftStatusName;

                                    runSheetFunctions.triggerBindingMasterDataToTemplate(itemData.type, masterResource.masterDataItem);
                                    runSheetFunctions.reloadLocalDataTable();
                                };

                                runSheetFunctions.assignAsset(requestParam, successCallback);
                            }

                            // Overlap warning
                            if (cloneResource.isOverlap) {
                                swal({
                                    text: `Warning! This resource time conflicts with another shift in the Run Sheet`,
                                    type: "warning",
                                    showCancelButton: true,
                                    confirmButtonClass: "btn-danger",
                                    confirmButtonText: "Proceed",
                                    cancelButtonText: "Cancel",
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        scheduleCallback(cloneResource);
                                    }
                                });
                            } else {
                                scheduleCallback(cloneResource);
                            }
                        }

                        var assignUnAvailableCallback = function () {
                            var assignUnAvailableTeamLeaderCallback = function () {
                                // Validate
                                var teamMemberIds = $droppedOn.find(`td.team-member .g-items li[data-type="${runSheetConfigs.types.teamMember}"]`).map(function () {
                                    return $(this).data("id");
                                }).get();

                                if ((teamMemberIds || []).indexOf(itemData.parentId) > -1) {
                                    return;
                                }

                                // Create new work log and check whether this worklog has been overlap or not
                                cloneResource.workLog = runSheetFunctions.getNewWorkLog(shift, cloneResource, runSheetConfigs.worklogType.teamLeader);
                                cloneResource.isOverlap = runSheetFunctions.isOverlapWorkLog(shifts, shift, cloneResource);

                                var scheduleCallback = function (cloneResource) {
                                    // Param
                                    var requestParam = {
                                        shiftId: shift.id,
                                        runSheetType: runsheetType,
                                        data: cloneResource,
                                        date: runSheetFunctions.getCurrentDate(),
                                    };
                                    var successCallback = function (response) {
                                        runSheetFunctions.getMasterData();
                                    };

                                    runSheetFunctions.assignUnAvailable(requestParam, successCallback);
                                }

                                // Overlap warning
                                if (cloneResource.isOverlap) {
                                    swal({
                                        text: 'Warning! This resource time conflicts with another shift in the Run Sheet',
                                        type: "warning",
                                        showCancelButton: true,
                                        confirmButtonClass: "btn-danger",
                                        confirmButtonText: "Proceed",
                                        cancelButtonText: "Cancel",
                                        closeOnConfirm: true,
                                        closeOnCancel: true
                                    }, function (isConfirm) {
                                        if (isConfirm) {
                                            scheduleCallback(cloneResource);
                                        }
                                    });
                                } else {
                                    scheduleCallback(cloneResource);
                                }
                            }
                            var assignUnAvailableTeamMemberCallback = function () {
                                // Validate
                                if ($droppedOn.find(`td.team-leader .g-items li[data-type="${runSheetConfigs.types.teamLeader}"]`).data("id") == itemData.parentId) {
                                    return;
                                }

                                // Create new work log and check whether this worklog has been overlap or not
                                cloneResource.workLog = runSheetFunctions.getNewWorkLog(shift, cloneResource, runSheetConfigs.worklogType.teamMember);
                                cloneResource.isOverlap = runSheetFunctions.isOverlapWorkLog(shifts, shift, cloneResource);

                                var scheduleCallback = function (cloneResource) {
                                    // Param
                                    var requestParam = {
                                        shiftId: shift.id,
                                        runSheetType: runsheetType,
                                        data: cloneResource,
                                        date: runSheetFunctions.getCurrentDate(),
                                    };
                                    var successCallback = function (response) {
                                        runSheetFunctions.getMasterData();
                                    };

                                    runSheetFunctions.assignUnAvailable(requestParam, successCallback);
                                }

                                // Overlap warning
                                if (cloneResource.isOverlap) {
                                    swal({
                                        title: "Are you sure?",
                                        text: `Warning! This resource time conflicts with another shift in the Run Sheet`,
                                        type: "warning",
                                        showCancelButton: true,
                                        confirmButtonClass: "btn-danger",
                                        confirmButtonText: "Proceed",
                                        cancelButtonText: "Cancel",
                                        closeOnConfirm: true,
                                        closeOnCancel: true
                                    }, function (isConfirm) {
                                        if (isConfirm) {
                                            scheduleCallback(cloneResource);
                                        }
                                    });
                                } else {
                                    scheduleCallback(cloneResource);
                                }
                            }
                            /* In case team leader */
                            if (runsheetType == runSheetConfigs.types.teamLeader) {
                                assignUnAvailableTeamLeaderCallback();
                            } else { /* In case team member */
                                assignUnAvailableTeamMemberCallback();
                            }
                        }

                        switch (itemData.type) {
                            case runSheetConfigs.types.teamLeader: {
                                if (!shift.isNotRequiredTeamLeader)
                                    assignTeamLeaderCallback();
                                else
                                    toastr["warning"](`Shift does not require a Team Leader`);
                                break;
                            }
                            case runSheetConfigs.types.teamMember: {
                                assignTeamMemberCallback();
                                break;
                            }
                            case runSheetConfigs.types.contractor: {
                                assignContractorCallback();
                                break;
                            }
                            case runSheetConfigs.types.ownedPlantEquipment:
                            case runSheetConfigs.types.hiredPlantEquipment:
                            case runSheetConfigs.types.vehicle: {
                                assignAssetCallback();
                                break;
                            }
                            case runSheetConfigs.types.unAvailable: {
                                assignUnAvailableCallback();
                                break;
                            }
                        }

                        // Remove drag hover effects
                        $(this).closest("table").removeClass("ui-droppable-hover");
                        $(this).find("td").removeClass("ui-droppable-hover");
                    },
                    over: function (event, ui) {
                        var $droppedOn = $(this);
                        var $droppedElement = $(ui.draggable);
                        var itemData = runSheetFunctions.getDataFromDraggableItem($droppedElement);

                        // Apply styles for correct cell
                        switch (itemData.type) {
                            case runSheetConfigs.types.teamLeader: {
                                $droppedOn.find("td.team-leader").addClass("ui-droppable-hover");
                                break;
                            }
                            case runSheetConfigs.types.teamMember: {
                                $droppedOn.find("td.team-member").addClass("ui-droppable-hover");
                                break;
                            }
                            case runSheetConfigs.types.contractor: {
                                $droppedOn.find("td.contractor").addClass("ui-droppable-hover");
                                break;
                            }
                            case runSheetConfigs.types.hiredPlantEquipment:
                            case runSheetConfigs.types.ownedPlantEquipment:
                            case runSheetConfigs.types.vehicle: {
                                $droppedOn.find("td.assigned-assets").addClass("ui-droppable-hover");
                                break;
                            }
                            case runSheetConfigs.types.unAvailable: {
                                switch (itemData.unAvailableType) {
                                    case runSheetConfigs.unAvailableType.both: {
                                        $droppedOn.find("td.team-leader").addClass("ui-droppable-hover");
                                        //$droppedOn.find("td.team-member").addClass("ui-droppable-hover");
                                        break;
                                    }
                                    case runSheetConfigs.unAvailableType.teamLeader: {
                                        $droppedOn.find("td.team-leader").addClass("ui-droppable-hover");
                                        break;
                                    }
                                    case runSheetConfigs.unAvailableType.teamMember: {
                                        $droppedOn.find("td.team-member").addClass("ui-droppable-hover");
                                        break;
                                    }
                                }

                                break;
                            }
                            default: break;
                        }
                    },
                    out: function (event, ui) {
                        $(this).find("td").removeClass("ui-droppable-hover");
                    },
                    activate: function (event, ui) {
                        $(this).closest("table").addClass("ui-droppable-hover");
                    },
                    deactivate: function (event, ui) {
                        $(this).closest("table").removeClass("ui-droppable-hover");
                    }
                });
                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    },
    initEvents: function () {
        // Clone shift event
        $(runSheetDatatableConfigs.tableId).delegate("tr " + runSheetDatatableConfigs.selectors.btnCloneShift, "click", function () {
            runSheetDatatableFunctions.clone($(this));
        });

        // Delete shift event
        $(runSheetDatatableConfigs.tableId).delegate("tr.editable " + runSheetDatatableConfigs.selectors.btnDeleteShift, "click", function () {
            runSheetDatatableFunctions.delete($(this));
        });

        // Change shift status event
        $(runSheetDatatableConfigs.tableId).delegate("tr.editable " + runSheetDatatableConfigs.selectors.btnChangeShiftStatus, "click", function () {
            runSheetDatatableFunctions.changeShiftStatus($(this));
        });

        // Edit contractor worklog event
        $(runSheetDatatableConfigs.tableId).delegate(runSheetDatatableConfigs.selectors.contractorItemEditable, "click", function () {
            runSheetDatatableFunctions.editContractorWorkLog($(this));
        });

        // Edit team leader worklog event
        $(runSheetDatatableConfigs.tableId).delegate(runSheetDatatableConfigs.selectors.teamLeaderItemEditable, "click", function () {
            runSheetDatatableFunctions.editEmployeeWorkLog($(this));
        });

        // Edit team member worklog event
        $(runSheetDatatableConfigs.tableId).delegate(runSheetDatatableConfigs.selectors.teamMemberItemEditable, "click", function () {
            runSheetDatatableFunctions.editEmployeeWorkLog($(this));
        });

        // Edit team leader unknow worklog event
        $(runSheetDatatableConfigs.tableId).delegate(runSheetDatatableConfigs.selectors.teamLeaderItemRequiredEditable, "click", function () {
            runSheetDatatableFunctions.editUnKnowWorkLog($(this));
        });

        // Edit team leader unknow worklog event
        $(runSheetDatatableConfigs.tableId).delegate(runSheetDatatableConfigs.selectors.teamMemberItemRequiredEditable, "click", function () {
            runSheetDatatableFunctions.editUnKnowWorkLog($(this));
        });

        // Edit asset worklog event
        $(runSheetDatatableConfigs.tableId).delegate(runSheetDatatableConfigs.selectors.assetItemEditable, "click", function () {
            var $this = $(this);
            var $li = $($this.closest("li"));
            var shiftId = runSheetFunctions.getShiftId($li);
            var runsheetType = $li.data('type');
            var entityId = $li.data('id');
            var entityName = $li.data('name');

            switch (runsheetType) {
                case runSheetConfigs.types.vehicle: {
                    runSheetDatatableFunctions.editVehicleAsset(shiftId, entityId);
                    break;
                }
                case runSheetConfigs.types.hiredPlantEquipment: {
                    runSheetDatatableFunctions.editHiredPEAsset(shiftId, entityId);
                    break;
                }
                case runSheetConfigs.types.ownedPlantEquipment: {
                    runSheetDatatableFunctions.editOwnedPEAsset(shiftId, entityId);
                    break;
                }
            }
        });

        // Edit shift time range event
        $(runSheetDatatableConfigs.tableId).delegate(runSheetDatatableConfigs.selectors.timeRangeItemEditable, "click", function () {
            runSheetDatatableFunctions.editShiftTimeRange($(this));
        });

        // Edit shift time range event
        $(runSheetDatatableConfigs.tableId).delegate(runSheetDatatableConfigs.selectors.quantityTeamMemberItemEditable, "click", function () {
            runSheetDatatableFunctions.editQuantityTeamMember($(this));
        });
    },
    clone: function ($this) {
        var shiftId = runSheetFunctions.getShiftId($this);
        var $cloneShiftModal = runSheetDatatableConfigs.$.cloneModal;
        var $cloneShiftBody = $cloneShiftModal.find('#cloneShiftBody');
        var formId = "clone-shift-form";

        // Remove old html
        $cloneShiftBody.html("");

        // Show modal
        $cloneShiftModal.modal('toggle');

        $.ajax({
            url: runSheetDatatableConfigs.urls.getClone + "?shiftId=" + shiftId,
            type: 'GET',
            success: function (result) {
                // Append worklog html
                $cloneShiftBody.html(result);

                // Init events
                $cloneShiftBody.find('.date-picker').datepicker({
                    rtl: App.isRTL(),
                    orientation: "bottom",
                    autoclose: true,
                    format: constant.datePickerFormat
                });

                $cloneShiftBody.find('.time-picker').timepicker({
                    showMeridian: false,
                    orientation: "bottom",
                    autoclose: true,
                    minuteStep: 10,
                    defaultTime: null
                });

                resetFormValidator(formId);

                // Hide modal callback
                $cloneShiftModal.on('hidden.bs.modal', function (e) {
                    $cloneShiftBody.html();
                });

                // Save modal callback
                $cloneShiftModal.find('.btn-save').off('click').on('click', function (e) {
                    var startDate = $cloneShiftBody.find("#StartDate").val();
                    var finishDate = $cloneShiftBody.find("#EndDate").val();
                    var startTime = $cloneShiftBody.find("#StartTime").val();
                    var endTime = $cloneShiftBody.find("#EndTime").val();

                    var requestData = {
                        id: shiftId,
                        startDate: startDate == "" ? null : moment(startDate, 'DD/MM/YYYY').format("MM/DD/YYYY"),
                        endDate: finishDate == "" ? null : moment(finishDate, 'DD/MM/YYYY').format("MM/DD/YYYY"),
                        startTime: startTime == "" ? null : startTime,
                        endTime: endTime == "" ? null : endTime
                    };

                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Shift has been cloned successfully`);

                        runSheetFunctions.getMasterData();

                        // Close modal
                        $cloneShiftModal.modal('hide');
                    };

                    var errorCallback = function (response) {
                        showAjaxFailureMessage(response.responseJSON.errorMessage);
                    }

                    $.ajax({
                        type: "POST",
                        url: runSheetDatatableConfigs.urls.clone,
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
                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Clone shift fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    delete: function ($this) {
        var actionName = "Delete";

        swal({
            title: "Are you sure?",
            text: `You want to ${actionName.toLowerCase()} shift!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: `Yes, ${actionName.toLowerCase()}`,
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                var data = [$this.data("id")];

                $.ajax({
                    url: runSheetDatatableConfigs.urls.delete,
                    type: 'POST',
                    data: {
                        "": data
                    },
                    success: function (result) {
                        toastr["success"](`${actionName} Shift successful`);
                        runSheetFunctions.getMasterData();
                    },
                    error: function (result) {
                        console.log("error: " + result);
                        toastr["error"](`${actionName} Shift fail, please try again`);
                    },
                    beforeSend: function () {
                        showAjaxLoadingMask();
                    },
                    complete: function () {
                        hideAjaxLoadingMask();
                    }
                });
            }
        });
    },
    changeShiftStatus: function ($this) {
        var shiftStatus = $this.data("status");
        var shiftStatusName = $this.data("status-name");

        var changeStatusCallback = function () {
            var shiftId = runSheetFunctions.getShiftId($this);
            var requestParam = {
                shiftId: shiftId,
                shiftStatus: shiftStatus
            };

            // Phase 2 - change request
            // 2.0.58 - You should not be able to dispatch a shift if there is a “Team Member Required” or “Team
            // Leader Required”. A pop up message should be triggered when this occurs “Error – Unable
            // to dispatch shift.Please allocate a Team Member / Team Leader to shift XXXXXXX.”
            if (shiftStatus == runSheetConfigs.shiftStatus.dispatched.id) {
                var shifts = runSheetConfigs.data.shifts || [];
                var shift = shifts.find(function (item) {
                    return item.id == shiftId;
                });
                var quantityOfTeamMember = shift.quantityOfTeamMember || 0;
                var totalTeamMember = (shift.teamMembers || []).length;
                var remainingTeamMember = quantityOfTeamMember - totalTeamMember;
                var stillRequiredTeamleader = !shift.teamLeader;
                var stillRequiredTeammember = remainingTeamMember > 0;

                if (!shift.isNotRequiredTeamLeader && stillRequiredTeamleader === true && stillRequiredTeammember === true) {
                    toastr["error"](`Error – Unable to dispatch shift. Please allocate a Team Member/ Team Leader to shift ${shift.shiftNumber}.`);
                    return;
                } 

                if (!shift.isNotRequiredTeamLeader && stillRequiredTeamleader === true) {
                    toastr["error"](`Error – Unable to dispatch shift. Please allocate a Team Leader to shift ${shift.shiftNumber}.`);
                    return;
                }

                if (!shift.isNotRequiredTeamLeader && stillRequiredTeamleader === true || stillRequiredTeammember === true) {
                    toastr["error"](`Error – Unable to dispatch shift. Please allocate a Team Member to shift ${shift.shiftNumber}.`);
                    return;
                }
            }

            $.ajax({
                url: runSheetDatatableConfigs.urls.changeStatus,
                type: 'POST',
                data: requestParam,
                success: function (result) {
                    toastr["success"](`Change shift status successful`);
                },
                error: function (result) {
                    console.log("error: ");
                    console.log(result);
                    toastr["error"](`Change shift status fail, please try again`);
                },
                beforeSend: function () {
                    showAjaxLoadingMask();
                },
                complete: function () {
                    hideAjaxLoadingMask();
                    runSheetFunctions.getMasterData();
                }
            });
        }

        if (shiftStatus != runSheetConfigs.shiftStatus.cancelled.id) {
            changeStatusCallback();
        } else {
            swal({
                title: "Are you sure?",
                text: `You want to "CANCEL SHIFT"`,
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Accept",
                cancelButtonText: "Cancel",
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    changeStatusCallback();
                }
            });
        }
    },
    editContractorWorkLog: function ($this) {
        var $li = $($this.closest("li"));
        var shifts = runSheetConfigs.data.shifts || [];
        var shiftId = runSheetFunctions.getShiftId($li);
        var shift = shifts.find(function (item) {
            return item.id == shiftId;
        });
        var resouceId = $li.data("id");
        var workLogType = runSheetConfigs.worklogType.contractor;
        var contractor = shift.contractors.find(function (item) {
            return item.id == resouceId;
        });
        var $worklogModal = runSheetDatatableConfigs.$.editContractorWorkLogModal;
        var $worklogBody = $worklogModal.find('#editWorklogBody');

        // Remove old html
        $worklogBody.html("");

        $.ajax({
            url: runSheetDatatableConfigs.urls.getWorkLogTemplate + "?shiftId=" + shiftId + "&entityId=" + resouceId + "&workLogType=" + workLogType,
            type: 'GET',
            success: function (result) {
                // Append worklog html
                $worklogBody.html(result);

                if (runSheetFunctions.canNotEditShift(shift)) $worklogModal.find(".btn-save").hide();
                else $worklogModal.find(".btn-save").show();

                // Init events
                runSheetDatatableFunctions.initTimeEvents(shift);
                runSheetDatatableFunctions.initChangeNumberOfWorkLogEvents(shift);

                // Show modal
                $worklogModal.modal('toggle');

                // Hide modal callback
                $worklogModal.on('hidden.bs.modal', function (e) {
                    $worklogBody.html();
                });

                // Save modal callback
                $worklogModal.find('.btn-save').off('click').on('click', function (e) {
                    var requestData = {
                        shiftId: shiftId,
                        entityId: resouceId,
                        quantity: $("#edit-contractor-worklog #Quantity").val(),
                        workLogs: runSheetDatatableFunctions.getCurrentWorklogs(runSheetDatatableConfigs.$.editContractorWorkLogModal, shift)
                    };

                    (requestData.workLogs || []).forEach(function (item) {
                        item.WorklogStatus = runSheetConfigs.workLogStatus.confirmed;
                    })

                    // Only TLs/ TMs can change the worklog status

                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Resource has been updated successfully`);

                        shift.shiftStatus = response.shiftStatus;
                        shift.shiftStatusName = response.shiftStatusName;

                        // Update contractor worklogs
                        contractor.workLogs = response.workLogs || [];

                        // Update shift worklogs
                        shift.workLogs = (shift.workLogs || []).filter(function (item) {
                            return item.worklogType != runSheetConfigs.worklogType.contractor;
                        });
                        (response.workLogs || []).forEach(function (item) {
                            shift.workLogs.push(item);
                        });

                        // Trigger reload data table
                        runSheetFunctions.reloadLocalDataTable();

                        // Close modal
                        $worklogModal.modal('hide');
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
                        url: runSheetDatatableConfigs.urls.editContractorWorkLog,
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
                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Edit resource fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    editEmployeeWorkLog: function ($this) {
        var $li = $($this.closest("li"));
        var shifts = runSheetConfigs.data.shifts || [];
        var shiftId = runSheetFunctions.getShiftId($li);
        var shift = shifts.find(function (item) {
            return item.id == shiftId;
        });
        var resouceId = $li.data("id");
        var workLogType = $li.data("type") == runSheetConfigs.types.teamLeader ? runSheetConfigs.worklogType.teamLeader : runSheetConfigs.worklogType.teamMember;
        var employee = workLogType == runSheetConfigs.worklogType.teamLeader
            ? shift.teamLeader
            : shift.teamMembers.find(function (item) {
                return item.id == resouceId;
            });
        var $worklogModal = runSheetDatatableConfigs.$.editEmployeeWorkLogModal;
        var $worklogBody = $worklogModal.find('#editWorklogBody');

        // Remove old html
        $worklogBody.html("");

        $.ajax({
            url: runSheetDatatableConfigs.urls.getWorkLogTemplate + "?shiftId=" + shiftId + "&entityId=" + resouceId + "&workLogType=" + workLogType,
            type: 'GET',
            success: function (result) {
                // Append worklog html
                $worklogBody.html(result);

                if(shift.shiftStatus != runSheetConfigs.shiftStatus.complete.id && !runSheetFunctions.canNotEditShift(shift))
                    $worklogModal.find(".btn-save").show()
                else
                    $worklogModal.find(".btn-save").hide();

                // Init events
                runSheetDatatableFunctions.initTimeEvents(shift);

                // Show modal
                $worklogModal.modal('toggle');

                // Hide modal callback
                $worklogModal.on('hidden.bs.modal', function (e) {
                    $worklogBody.html();
                });

                // Save modal callback
                $worklogModal.find('.btn-save').off('click').on('click', function (e) {
                    var requestData = {
                        shiftId: shiftId,
                        entityId: resouceId,
                        worklogType: workLogType,
                        workLogs: runSheetDatatableFunctions.getCurrentWorklogs(runSheetDatatableConfigs.$.editEmployeeWorkLogModal, shift)
                    };  

                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Resource has been updated successfully`);

                        shift.shiftStatus = response.shiftStatus;
                        shift.shiftStatusName = response.shiftStatusName;

                        // Update employee worklog
                        employee.workLog.startTime = response.workLogs[0].startTime;
                        employee.workLog.finishTime = response.workLogs[0].finishTime;
                        employee.workLog.break = response.workLogs[0].break;
                        employee.workLog.travel = response.workLogs[0].travel;
                        employee.workLog.worklogStatus = response.workLogs[0].worklogStatus;
                        employee.workLog.isSpecific = response.workLogs[0].isSpecific;

                        // Update shift worklogs
                        var shiftWorkLog = (shift.workLogs || []).find(function (item) {
                            return item.id == employee.workLog.id;
                        });
                        shiftWorkLog.startTime = response.workLogs[0].startTime;
                        shiftWorkLog.finishTime = response.workLogs[0].finishTime;
                        shiftWorkLog.break = response.workLogs[0].break;
                        shiftWorkLog.travel = response.workLogs[0].travel;
                        shiftWorkLog.worklogStatus = response.workLogs[0].worklogStatus;
                        shiftWorkLog.isSpecific = response.workLogs[0].isSpecific;

                        // Trigger reload data table
                        runSheetFunctions.reloadLocalDataTable();

                        // Close modal
                        $worklogModal.modal('hide');
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
                        url: runSheetDatatableConfigs.urls.editEmployeeWorkLog,
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
                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Edit resource fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    editUnKnowWorkLog: function ($this) {
        var $li = $($this.closest("li"));
        var shifts = runSheetConfigs.data.shifts || [];
        var shiftId = runSheetFunctions.getShiftId($li);
        var shift = shifts.find(function (item) {
            return item.id == shiftId;
        });
        var unKnowWorkLogId = $li.data("id");
        var unKnowWorkLog = (shift.unKnowWorkLogs || []).find(function(unKnowWorkLog) {
            return unKnowWorkLog.id == unKnowWorkLogId
        })
        var workLogType = $li.data("type") == runSheetConfigs.types.teamLeader ? runSheetConfigs.worklogType.teamLeader : runSheetConfigs.worklogType.teamMember;
        var $worklogModal = runSheetDatatableConfigs.$.editUnKnowWorkLogModal;
        var $worklogBody = $worklogModal.find('#editWorklogBody');

        // Remove old html
        $worklogBody.html("");

        $.ajax({
            url: runSheetDatatableConfigs.urls.getUnKnowWorkLogTemplate + "?unKnowWorkLogId=" + unKnowWorkLogId,
            type: 'GET',
            success: function (result) {
                // Append worklog html
                $worklogBody.html(result);

                if (runSheetFunctions.canNotEditShift(shift)) $worklogModal.find(".btn-save").hide();
                else $worklogModal.find(".btn-save").show();

                // Init events
                runSheetDatatableFunctions.initTimeEvents(shift);

                // Show modal
                $worklogModal.modal('toggle');

                // Hide modal callback
                $worklogModal.on('hidden.bs.modal', function (e) {
                    $worklogBody.html();
                });

                // Save modal callback
                $worklogModal.find('.btn-save').off('click').on('click', function (e) {
                    var requestData = {
                        id: unKnowWorkLogId,
                        workLogs: runSheetDatatableFunctions.getCurrentUnKnowWorklogs(runSheetDatatableConfigs.$.editUnKnowWorkLogModal, shift)
                    };

                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Unknown worklog has been updated successfully`);

                        shift.shiftStatus = response.shiftStatus;
                        shift.shiftStatusName = response.shiftStatusName;

                        // Update employee worklog
                        unKnowWorkLog.startTime = response.workLogs[0].startTime;
                        unKnowWorkLog.finishTime = response.workLogs[0].finishTime;
                        unKnowWorkLog.break = response.workLogs[0].break;
                        unKnowWorkLog.travel = response.workLogs[0].travel;
                        unKnowWorkLog.worklogStatus = response.workLogs[0].worklogStatus;

                        // Trigger reload data table
                        runSheetFunctions.reloadLocalDataTable();

                        // Close modal
                        $worklogModal.modal('hide');
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
                        url: runSheetDatatableConfigs.urls.editUnKnowWorkLog,
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
                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Edit resource fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },

    editVehicleAsset: function (shiftId, entityId) {
        var runsheetType = runSheetConfigs.types.vehicle;
        var shifts = runSheetConfigs.data.shifts || [];
        var shift = shifts.find(function (item) {
            return item.id == shiftId;
        });
        var $assetModal = runSheetDatatableConfigs.$.editAssetModal;
        var $assetModalBody = $assetModal.find('#editAssetBody');
       

        // Remove old html
        $assetModalBody.html("");

        $.ajax({
            url: runSheetDatatableConfigs.urls.getEditAsset + "?shiftId=" + shiftId + "&entityId=" + entityId + "&runsheetType=" + runsheetType,
            type: 'GET',
            success: function (result) {
                // Append worklog html
                $assetModalBody.html(result);

                if (runSheetFunctions.canNotEditShift(shift)) $assetModal.find(".btn-save").hide();
                else $assetModal.find(".btn-save").show();

                App.initFloatingLabel(true);

                // Show modal
                $assetModal.modal('toggle');

                // Hide modal callback
                $assetModal.on('hidden.bs.modal', function (e) {
                    $assetModalBody.html();
                });

                var $driverId = $($assetModal.find('#DriverId'));
                var $contractorId = $($assetModal.find('#ContractorId'));
                var $quantity = $($assetModal.find('#Quantity'));

                $driverId.off('change').on('change', function() {
                    $contractorId.val('');
                });

                $contractorId.off('change').on('change', function() {
                    $driverId.val('');
                });

                // Save modal callback
                $assetModal.find('.btn-save').off('click').on('click', function (e) {
                    var requestData = {
                        shiftId: shiftId,
                        entityId: entityId,
                        employeeId: $driverId.val(),
                        contractorId: $contractorId.val(),
                        quantity: $quantity.val(),
                        runsheetType: runsheetType
                    }
                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Asset has been updated successfully`);

                        var vehicle = (shift.vehicles || []).find(function (item) {
                            return item.id == entityId;
                        })

                        // Update local asset data
                        vehicle.quantity = response.quantity;
                        vehicle.driverId = response.employeeId;
                        vehicle.driverName = response.employeeName;
                        vehicle.contractorId = response.contractorId;
                        vehicle.contractorName = response.contractorName;

                        // Trigger reload data table
                        runSheetFunctions.reloadLocalDataTable();

                        // Trigger reload left dropdown list
                        var masterDataItem = runSheetFunctions.getMasterDataItem(runSheetConfigs.types.vehicle);
                        var masterVehicleItem = (masterDataItem.originalRecords || []).find(function(record) {
                            return record.id == vehicle.id;
                        })
                        var surfix = !vehicle.driverName || vehicle.driverName  == '' 
                            ? !vehicle.contractorName || vehicle.contractorName == ''
                                ? ''
                                : vehicle.contractorName
                            : vehicle.driverName

                        masterVehicleItem.name = `${vehicle.name} (${surfix})`;

                        // Reload
                        runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.vehicle, masterDataItem);

                        // Close modal
                        $assetModal.modal('hide');
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
                        url: runSheetDatatableConfigs.urls.editAsset,
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

                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Edit asset fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    editHiredPEAsset: function (shiftId, entityId) {
        var runsheetType = runSheetConfigs.types.hiredPlantEquipment;
        var shifts = runSheetConfigs.data.shifts || [];
        var shift = shifts.find(function (item) {
            return item.id == shiftId;
        });
        var $assetModal = runSheetDatatableConfigs.$.editAssetModal;
        var $assetModalBody = $assetModal.find('#editAssetBody');

        // Remove old html
        $assetModalBody.html("");

        $.ajax({
            url: runSheetDatatableConfigs.urls.getEditAsset + "?shiftId=" + shiftId + "&entityId=" + entityId + "&runsheetType=" + runsheetType,
            type: 'GET',
            success: function (result) {
                // Append worklog html
                $assetModalBody.html(result);

                if (runSheetFunctions.canNotEditShift(shift)) $assetModal.find(".btn-save").hide();
                else $assetModal.find(".btn-save").show();

                App.initFloatingLabel(true);

                // Show modal
                $assetModal.modal('toggle');

                // Hide modal callback
                $assetModal.on('hidden.bs.modal', function (e) {
                    $assetModalBody.html();
                });

                // Save modal callback
                $assetModal.find('.btn-save').off('click').on('click', function (e) {
                    var $quantity = $($assetModal.find('#Quantity'));
                    var requestData = {
                        shiftId: shiftId,
                        entityId: entityId,
                        quantity: $quantity.val(),
                        runsheetType: runsheetType
                    }
                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Asset has been updated successfully`);

                        var hiredPE = (shift.hiredPlantEquipments || []).find(function (item) {
                            return item.id == entityId;
                        })

                        // Update local asset data
                        hiredPE.quantity = response.quantity;

                        // Trigger reload data table
                        runSheetFunctions.reloadLocalDataTable();

                        // Close modal
                        $assetModal.modal('hide');
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
                        url: runSheetDatatableConfigs.urls.editAsset,
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

                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Edit asset fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    editOwnedPEAsset: function (shiftId, entityId) {
        var runsheetType = runSheetConfigs.types.ownedPlantEquipment;
        var shifts = runSheetConfigs.data.shifts || [];
        var shift = shifts.find(function (item) {
            return item.id == shiftId;
        });
        var $assetModal = runSheetDatatableConfigs.$.editAssetModal;
        var $assetModalBody = $assetModal.find('#editAssetBody');
       

        // Remove old html
        $assetModalBody.html("");

        $.ajax({
            url: runSheetDatatableConfigs.urls.getEditAsset + "?shiftId=" + shiftId + "&entityId=" + entityId + "&runsheetType=" + runsheetType,
            type: 'GET',
            success: function (result) {
                // Append worklog html
                $assetModalBody.html(result);

                if (runSheetFunctions.canNotEditShift(shift)) $assetModal.find(".btn-save").hide();
                else $assetModal.find(".btn-save").show();

                App.initFloatingLabel(true);

                // Show modal
                $assetModal.modal('toggle');

                // Hide modal callback
                $assetModal.on('hidden.bs.modal', function (e) {
                    $assetModalBody.html();
                });

                var $operatorId = $($assetModal.find('#OperatorId'));
                var $contractorId = $($assetModal.find('#ContractorId'));
                var $quantity = $($assetModal.find('#Quantity'));

                $operatorId.off('change').on('change', function() {
                    $contractorId.val('');
                });

                $contractorId.off('change').on('change', function() {
                    $operatorId.val('');
                });

                // Save modal callback
                $assetModal.find('.btn-save').off('click').on('click', function (e) {
                    var requestData = {
                        shiftId: shiftId,
                        entityId: entityId,
                        employeeId: $operatorId.val(),
                        contractorId: $contractorId.val(),
                        quantity: $quantity.val(),
                        runsheetType: runsheetType
                    }
                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Asset has been updated successfully`);

                        var ownedPE = (shift.ownedPlantEnquipments || []).find(function (item) {
                            return item.id == entityId;
                        })

                        // Update local asset data
                        ownedPE.name = response.entityName;
                        ownedPE.quantity = response.quantity;
                        ownedPE.operatorId = response.employeeId;
                        ownedPE.operatorName = response.employeeName;
                        ownedPE.contractorId = response.contractorId;
                        ownedPE.contractorName = response.contractorName;

                         // Trigger reload left dropdown list
                        var masterDataItem = runSheetFunctions.getMasterDataItem(runSheetConfigs.types.ownedPlantEquipment);
                        var masterVehicleItem = (masterDataItem.originalRecords || []).find(function(record) {
                            return record.id == ownedPE.id;
                        })
                        var surfix = !ownedPE.operatorName || ownedPE.operatorName  == '' 
                            ? !ownedPE.contractorName || ownedPE.contractorName == ''
                                ? ''
                                : ownedPE.contractorName
                            : ownedPE.operatorName

                        masterVehicleItem.name = `${ownedPE.name} (${surfix})`;

                        // Reload
                        runSheetFunctions.triggerBindingMasterDataToTemplate(runSheetConfigs.types.ownedPlantEquipment, masterDataItem);

                        // Trigger reload data table
                        runSheetFunctions.reloadLocalDataTable();

                        // Close modal
                        $assetModal.modal('hide');
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
                        url: runSheetDatatableConfigs.urls.editAsset,
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

                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Edit asset fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    editShiftTimeRange: function ($this) {
        var shifts = runSheetConfigs.data.shifts || [];
        var shiftId = runSheetFunctions.getShiftId($this);
        var shift = shifts.find(function (item) {
            return item.id == shiftId;
        });
        var $timeRangeModal = runSheetDatatableConfigs.$.editShiftTimeRangeModal;
        var $timeRangeBody = $timeRangeModal.find('#editShiftBody');
        var formId = "edit-shift-time-range";

        // Remove old html
        $timeRangeBody.html("");

        $.ajax({
            url: runSheetDatatableConfigs.urls.getShiftTimeRangeTemplate + "?shiftId=" + shiftId,
            type: 'GET',
            success: function (result) {
                // Append worklog html
                $timeRangeBody.html(result);

                if (runSheetFunctions.canNotEditShift(shift)) $timeRangeModal.find(".btn-save").hide();
                else $timeRangeModal.find(".btn-save").show();

                // Init events
                $timeRangeBody.find('.date-picker').datepicker({
                    rtl: App.isRTL(),
                    orientation: "top",
                    autoclose: true,
                    format: constant.datePickerFormat
                });

                $timeRangeBody.find('.time-picker').timepicker({
                    showMeridian: false,
                    orientation: "bottom",
                    autoclose: true,
                    minuteStep: 10,
                    defaultTime: null
                });

                resetFormValidator(formId);

                // Show modal
                $timeRangeModal.modal('toggle');

                // Hide modal callback
                $timeRangeModal.on('hidden.bs.modal', function (e) {
                    $timeRangeBody.html();
                });

                // Save modal callback
                $timeRangeModal.find('.btn-save').off('click').on('click', function (e) {
                    var startDate = $timeRangeBody.find("#StartDate").val();
                    var finishDate = $timeRangeBody.find("#EndDate").val();
                    var startTime = $timeRangeBody.find("#StartTime").val();
                    var endTime = $timeRangeBody.find("#EndTime").val();

                    var requestData = {
                        shiftId: shiftId,
                        startDate: startDate == "" ? null : moment(startDate, 'DD/MM/YYYY').format("MM/DD/YYYY"),
                        endDate: finishDate == "" ? null : moment(finishDate, 'DD/MM/YYYY').format("MM/DD/YYYY"),
                        startTime: startTime == "" ? null : startTime,
                        endTime: endTime == "" ? null : endTime
                    };

                    var successCallback = function (response) {
                        showAjaxSuccessMessage(`Shift has been updated successfully`);

                        runSheetFunctions.getMasterData();

                        // Close modal
                        $timeRangeModal.modal('hide');
                    };

                    var errorCallback = function (response) {
                        showAjaxFailureMessage(response.responseJSON.errorMessage);
                    }

                    $.ajax({
                        type: "POST",
                        url: runSheetDatatableConfigs.urls.editShiftTimeRange,
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
                })
            },
            error: function (result) {
                console.log("error: " + result);
                toastr["error"](`Edit resource fail, please try again`);
            },
            beforeSend: function () {
                showAjaxLoadingMask();
            },
            complete: function () {
                hideAjaxLoadingMask();
            }
        });
    },
    editQuantityTeamMember: function ($this) {
        var $li = $this;
        var shifts = runSheetConfigs.data.shifts || [];
        var shiftId = runSheetFunctions.getShiftId($this);
        var shift = shifts.find(function (item) {
            return item.id == shiftId;
        });
        var shiftNumber = $li.data('shiftnumber');
        var quantity = $li.data('quantity');
        var $timeRangeModal = runSheetDatatableConfigs.$.editQuantityTeamMemberModal;
        var $timeRangeBody = $timeRangeModal.find('#editQuantityTeamMemberBody');
        var formId = "edit-quantity-team-member";
        var $shifNumber = $timeRangeBody.find('#ShiftNumber');
        var $quantityOfTeamMember = $timeRangeBody.find('#QuantityOfTeamMember');

        if (runSheetFunctions.canNotEditShift(shift)) $timeRangeModal.find(".btn-save").hide();
        else $timeRangeModal.find(".btn-save").show();

        $shifNumber.val(shiftNumber);
        $quantityOfTeamMember.val(quantity);

        resetFormValidator(formId);

        // Show modal
        $timeRangeModal.modal('toggle');

        // Hide modal callback
        $timeRangeModal.on('hidden.bs.modal', function (e) {

        });

        // Save modal callback
        $timeRangeModal.find('.btn-save').off('click').on('click', function (e) {
            var requestData = {
                shiftId: shiftId,
                quantityOfTeamMember: $quantityOfTeamMember.val()
            };

            var successCallback = function (response) {
                showAjaxSuccessMessage(`Shift has been updated successfully`);

                shift.quantityOfTeamMember = requestData.quantityOfTeamMember;

                runSheetFunctions.reloadLocalDataTable();

                // Close modal
                $timeRangeModal.modal('hide');
            };

            var errorCallback = function (response) {
                showAjaxFailureMessage(response.responseJSON.errorMessage);
            }

            $.ajax({
                type: "POST",
                url: runSheetDatatableConfigs.urls.editQuantityTeamMember,
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
        })

    },

    /* Helper Methods */
    addWorkog: function (shift, workLog) {
        var $table = $('#worklog-datatable tbody');
        var template = runSheetDatatableConfigs.worklogTemplate;

        // Remove not found tr
        $table.find('.not-found').remove();

        template = template
            .replace('{0}', workLog.id)
            .replace('{3}', workLog.travel)
            .replace('{4}', moment(workLog.startTime).format(constant.time24Format))
            .replace('{5}', workLog.break)
            .replace('{6}', moment(workLog.finishTime).format(constant.time24Format))
            .replace('{7}', workLog.entityId)
            .replace('{8}', workLog.worklogType)
            .replace('{9}', workLog.shiftId)
            .replace(workLog.worklogStatus + '-selected', 'selected');

        if (workLog.worklogType == "3") {
            template = template.replace('tdStatus', 'hidden');
        }
        $table.append(template);

        runSheetDatatableFunctions.initTimeEvents(shift);
    },
    initTimeEvents: function (shift) {
        var startTime = $('#StartTime').val();
        if (startTime == "") startTime = "00:00";
        var startTimeHour = parseInt(startTime.split(':')[0]);
        var startTimeMinutes = parseInt(startTime.split(':')[1]);

        var endTime = $('#EndTime').val();
        if (endTime == "") endTime = "00:00";
        var endTimeHour = parseInt(endTime.split(':')[0]);
        var endTimeMinutes = parseInt(endTime.split(':')[1]);

        var shiftStartDateTime = new Date(shift.startDateTime);
        var shiftFinishDateTime = new Date(shift.finishDateTime);
        var shiftStartTime = new Date(shiftStartDateTime.getFullYear(), shiftStartDateTime.getMonth() + 1, shiftStartDateTime.getDate(), 0, 0, 0, 0);
        var shiftFinishTime = new Date(shiftFinishDateTime.getFullYear(), shiftFinishDateTime.getMonth() + 1, shiftFinishDateTime.getDate(), 0, 0, 0, 0);

        // init time picker control
        $('.time-picker-timesheet-startTime').timepicker({
            showMeridian: false,
            orientation: "bottom",
            autoclose: true,
            minuteStep: 10,
            defaultTime: null,
        });
        //.on('changeTime.timepicker', function (e) {
        //    if (shiftStartTime == shiftFinishTime) {
        //        var h = e.time.hours;
        //        var m = e.time.minutes;

        //        if (h < startTimeHour || (h == startTimeHour && m < startTimeMinutes))
        //            $(this).timepicker('setTime', startTime);
        //    }

        //});

        $('.time-picker-timesheet-finishTime').timepicker({
            showMeridian: false,
            orientation: "bottom",
            autoclose: true,
            minuteStep: 10,
            defaultTime: null,
        });
        //.on('changeTime.timepicker', function (e) {
        //    if (shiftStartTime == shiftFinishTime) {
        //        var h = e.time.hours;
        //        var m = e.time.minutes;

        //        if (h > endTimeHour || (h == endTimeHour && m > endTimeMinutes))
        //            $(this).timepicker('setTime', endTime);
        //    }
        //});
    },
    initChangeNumberOfWorkLogEvents: function (shift) {

        var previousQuantity;
        // init change quantity event
        $("#edit-contractor-worklog #Quantity").on('focus', function () {
            previousQuantity = parseInt(this.value);
        }).change(function () {
            var newValue = parseInt(this.value);
            var $table = $('#worklog-datatable tbody');

            if (newValue == 0) {
                //runSheetConfigs.data.worklogs = [];
                $table.html('<tr class="not-found"><td colspan="7" class="text-center">No data found</td></tr>');
                return;
            }

            var numberOfChange = newValue - previousQuantity;

            if (numberOfChange == 0) return;

            // Increase numberOfChange work logs
            if (numberOfChange > 0) {
                for (var i = 0; i < numberOfChange; i++) {
                    var contractorId = $("#edit-contractor-worklog #ContractorId").val();
                    var resource = shift.contractors.find(function (item) {
                        return item.id == contractorId;
                    });
                    var newWorkLog = runSheetFunctions.getNewWorkLog(shift, resource, runSheetConfigs.worklogType.contractor);

                    runSheetDatatableFunctions.addWorkog(shift, newWorkLog);
                }
            } else { // Decrease numberOfChange work logs
                var $trItems = $table.find("tr");
                numberOfChange = numberOfChange * -1;

                for (var i = 1; i <= numberOfChange; i++) {
                    //runSheetConfigs.data.worklogs.pop();
                    var $tr = $trItems.eq($trItems.length - i);
                    $tr.remove();
                }

                if ($('#worklog-datatable tbody').find("tr").length == 0) {
                    $table = $('#worklog-datatable tbody');
                    $table.html('<tr class="not-found text-center"><td colspan="5" class="text-center">No data found</td></tr>');
                }
            }

            previousQuantity = parseInt(this.value);
        });
    },
    getCurrentWorklogs: function ($modal, shift) {
        var workLogs = [];
        var startDateTime = new Date(shift.startDateTime);
        var finishDateTime = new Date(shift.finishDateTime);

        var $tr = $modal.find('#worklog-datatable tbody tr:not(.not-found)');
        $tr.each(function (index, value) {
            var $item = $(value);
            var startTimeValue = $item.find('.startTime input').val();
            var startTimeHour = parseInt(startTimeValue.split(':')[0]);
            var startTimeMinutes = parseInt(startTimeValue.split(':')[1]);

            var finishTimeValue = $item.find('.finishTime input').val();
            var endTimeHour = parseInt(finishTimeValue.split(':')[0]);
            var endTimeMinutes = parseInt(finishTimeValue.split(':')[1]);

            var startTime = new Date(startDateTime.getFullYear(), startDateTime.getMonth() + 1, startDateTime.getDate(), startTimeHour, startTimeMinutes, 0, 0);
            var finishTime = new Date(finishDateTime.getFullYear(), finishDateTime.getMonth() + 1, finishDateTime.getDate(), endTimeHour, endTimeMinutes, 0, 0);

            workLogs.push({
                Id: $item.data('id'),
                Name: $item.find('.name').text(),
                ShiftId: shift.shiftId,
                EntityId: $item.data('entityid'),
                ShiftId: $item.data('shiftid'),
                WorklogType: $item.data('worklogtype'),
                Travel: $item.find('.travel input').val(),
                StartTime: startTimeValue,
                Break: $item.find('.break input').val(),
                FinishTime: finishTimeValue,
                WorklogStatus: $item.find('.status select option:selected').val(),
            });
        });

        return workLogs;
    },
    getCurrentUnKnowWorklogs: function ($modal, shift) {
        var workLogs = [];
        var startDateTime = new Date(shift.startDateTime);
        var finishDateTime = new Date(shift.finishDateTime);

        var $tr = $modal.find('#worklog-datatable tbody tr:not(.not-found)');
        $tr.each(function (index, value) {
            var $item = $(value);
            var startTimeValue = $item.find('.startTime input').val();
            var startTimeHour = parseInt(startTimeValue.split(':')[0]);
            var startTimeMinutes = parseInt(startTimeValue.split(':')[1]);

            var finishTimeValue = $item.find('.finishTime input').val();
            var endTimeHour = parseInt(finishTimeValue.split(':')[0]);
            var endTimeMinutes = parseInt(finishTimeValue.split(':')[1]);

            var startTime = new Date(startDateTime.getFullYear(), startDateTime.getMonth() + 1, startDateTime.getDate(), startTimeHour, startTimeMinutes, 0, 0);
            var finishTime = new Date(finishDateTime.getFullYear(), finishDateTime.getMonth() + 1, finishDateTime.getDate(), endTimeHour, endTimeMinutes, 0, 0);

            workLogs.push({
                Id: $item.data('id'),
                Name: $item.find('.name').text(),
                ShiftId: shift.shiftId,
                WorklogType: $item.data('worklogtype'),
                Travel: $item.find('.travel input').val(),
                StartTime: startTimeValue,
                Break: $item.find('.break input').val(),
                FinishTime: finishTimeValue,
                WorklogStatus: $item.find('.status select option:selected').val(),
            });
        });

        return workLogs;
    },
    getShiftStatusTemplate: function (shift) {
        var html = runSheetConfigs.selectors.$.shiftStatusTmpl.html();
        var shiftStatuses = runSheetConfigs.shiftStatus;
        var shiftStatus = shift.shiftStatus;
        var shiftBackground = runSheetFunctions.getShiftBackground(shift.shiftStatus);

        var statusName = shift.shiftStatusName;
        if (statusName == "Personnel Confirmed") {
            statusName = "Personnel<br/>Confirmed";
        }

        html = html.replace("{{shiftClass}}", shiftBackground);
        html = html.replace("{{shiftStatusName}}", statusName);

        var getStatusItem = function (statusItem) {
            var background = runSheetFunctions.getShiftBackground(statusItem.id);
            var html = `<li>
                    <a href="javascript:void(0);" class="${background} btn-change-shift-status" data-status="${statusItem.id}" data-status-name="${statusItem.display}">${statusItem.display}</a>
                 </li>`;

            return $(html);
        }

        var $html = $(html);
        if (runSheetFunctions.canNotEditShift(shift)) {
            $html.find("i.fa").remove();
            $html.find(".dropdown-menu").remove();
        } else {
            var $ul = $('<ul class="dropdown-menu" role="menu" />');

            switch (shift.shiftStatus) {
                case shiftStatuses.planned.id: {
                    $ul.append(getStatusItem(shiftStatuses.shiftConfirmed));
                    $ul.append(getStatusItem(shiftStatuses.cancelled));
                    break;
                }
                case shiftStatuses.personnelConfirmed.id: {
                    $ul.append(getStatusItem(shiftStatuses.active));
                    $ul.append(getStatusItem(shiftStatuses.cancelled));
                    break;
                }
                case shiftStatuses.shiftConfirmed.id: {
                    $ul.append(getStatusItem(shiftStatuses.dispatched));
                    $ul.append(getStatusItem(shiftStatuses.cancelled));
                    break;
                }
                case shiftStatuses.dispatched.id: {
                    $ul.append(getStatusItem(shiftStatuses.active));
                    $ul.append(getStatusItem(shiftStatuses.cancelled));
                    break;
                }
                case shiftStatuses.active.id: {
                    $ul.append(getStatusItem(shiftStatuses.complete));
                    break;
                }
                case shiftStatuses.complete.id: {
                    break;
                }
            }

            $html.find('.input-group-btn').append($ul);
        }

        return $html.html();
    }
}