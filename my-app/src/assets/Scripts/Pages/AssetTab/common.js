var ASSET_MODE = {
    ADD: 1,
    EDIT: 2
}
var ASSET_TYPE = {
    VEHICLE: 1,
    OWNED_PLANT_EQUIPMENT: 2,
    HIRED_PLANT_EQUIPMENT: 3
}

function AssetCommon(selector) {
    var $this = this;

    $this.configs = {
        mode: ASSET_MODE.ADD,
        $: {
        	datatable: {
        		vehicle: null,
        		hiredPE: null,
        		ownedPE: null
        	},
            modal: {
               addAsset: $(selector + ' #AddAssetModal'),
               editAsset: $(selector + ' #EditAssetModal'),
            }
        },
        selector: {
            parent: selector,
            tableId: {
                vehicle: `${selector}_vehicle_datatable`,
                hiredPE: `${selector}_hired_plant_equipment_datatable`,
                ownedPE: `${selector}_owned_plant_equipment_datatable`
            },
            modal: {
                addAssetForm: '#add-asset-form',
                editAssetForm: '#edit-asset-form',
                addAssetBody: '#addAssetBody',
                editAssetBody: '#editAssetBody',
                btnSave: selector + ' .btn-save',
                btnClose: selector + ' .btn-close'
            },
            button: {
                editAsset: selector + ' .btn-edit-asset',
                deleteAsset: selector + ' .btn-delete-asset',
                vehicle:{
                    add: selector + ' #btnAddVehicle'
                },
                hiredPE:{
                    add: selector + ' #btnAddHiredPlantEquipment'
                },
                ownedPE:{
                    add: selector + ' #btnAddOwnedPlantEquipment'
                }
            }
        },
        urls: {
        	getAsset: apiUrl.assetTab.getUpsertAsset
        },
        data: {
        	shiftId: null,
        	assetVehicles: [],
        	assetHiredPEs: [],
        	assetOwnedPEs: []
        }
    };

    $this.funcs = {
        init: function (mode, data) {
        	// Init datatables
            $this.configs.mode = mode;

            if(data){
                $this.configs.data = data;
            }

            $this.funcs.initDataTable();
            $this.funcs.initEvents();
        },
        findElement: function(selector){
            if (!$this.configs.selector.parent) return $(selector);
            return $(`${$this.configs.selector.parent} ${selector}`);
        },
        setData: function(){
            $($this.funcs.findElement("#Asset_VehiclesJSONs")).val(JSON.stringify($this.configs.data.assetVehicles || []));
            $($this.funcs.findElement("#Asset_HiredEquipmentsJSONs")).val(JSON.stringify($this.configs.data.assetHiredPEs || []));
            $($this.funcs.findElement("#Asset_OwnedEquipmentsJSONs")).val(JSON.stringify($this.configs.data.assetOwnedPEs || []));
        },
        /* Helper Methods */
        initDataTable: function(){
            // Vehicle asset
            $this.configs.$.datatable.vehicle = $(`${$this.configs.selector.tableId.vehicle}`).dataTable({
                "data": $this.configs.data.assetVehicles || [],
                "bFilter": false,
                "bPaginate": true,
                "aaSorting": [[0, 'desc']],
                "aoColumns": [
                    {
                        "mData": "id",
                        "sClass": "hidden id",
                        "bSearchable": false
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "bSearchable": false,
                        "sClass": "text-center action-column",
                        "render": function (data) {
                            var html = "<div>";
                                html += `<button class="btn btn-xs btn-danger btn-delete-asset" data-toggle="tooltip" data-entity-id="${data.vehicleId}" data-asset-type="${ASSET_TYPE.VEHICLE}" data-placement="bottom" title="Delete"><i class="fa fa-trash"></i></button>`;
                                html += "</div>";

                            return html;
                        }
                    },
                    {
                        "mData": "vehicleName",
                        "bSortable": true,
                        "sClass": "text-center entity-name-column",
                        "bSearchable": true
                    },
                    {
                        "mData": "driverName",
                        "bSortable": true,
                        "sClass": "text-center driver-name-column",
                        "bSearchable": true
                    },
                    {
                        "mData": "contractorName",
                        "bSortable": true,
                        "sClass": "text-center contractor-name-column",
                        "bSearchable": true
                    },
                    //{
                    //    "mData": "quantity",
                    //    "bSortable": true,
                    //    "sClass": "text-center quantity",
                    //    "bSearchable": true
                    //}
                ],
                "rowCallback": function (row, data, index) {
                    var $row = $(row);

                    $row.css("cursor", "pointer");
                    $row.attr("role", "row");
                }
            });

            // Hired PE asset
            $this.configs.$.datatable.hiredPE = $(`${$this.configs.selector.tableId.hiredPE}`).dataTable({
                "data": $this.configs.data.assetHiredPEs || [],
                "bFilter": false,
                "bPaginate": true,
                "aaSorting": [[0, 'desc']],
                "aoColumns": [
                    {
                        "mData": "id",
                        "sClass": "hidden id",
                        "bSearchable": false
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "bSearchable": false,
                        "sClass": "text-center action-column",
                        "render": function (data) {
                            var html = "<div>";
                                //html += `<button class="btn btn-xs btn-primary btn-edit-asset" data-entity-id="${data.hiredPEId}" data-asset-type="${ASSET_TYPE.HIRED_PLANT_EQUIPMENT}" ${tooltipHelper.edit("Edit")}><i class="fa fa-edit"></i></button>`;
                                html += `<button class="btn btn-xs btn-danger btn-delete-asset" data-toggle="tooltip" data-entity-id="${data.hiredPEId}" data-asset-type="${ASSET_TYPE.HIRED_PLANT_EQUIPMENT}" data-placement="bottom" title="Delete"><i class="fa fa-trash"></i></button>`;
                                html += "</div>";

                            return html;
                        }
                    },
                    {
                        "mData": "hiredPEName",
                        "bSortable": true,
                        "sClass": "text-center entity-name-column",
                        "bSearchable": true
                    },
                    // {
                    //     "mData": "driverName",
                    //     "bSortable": true,
                    //     "sClass": "text-center driver-name-column",
                    //     "bSearchable": true
                    // },
                    {
                        "mData": "quantity",
                        "bSortable": true,
                        "sClass": "text-center quantity",
                        "bSearchable": true
                    }
                ],
                "rowCallback": function (row, data, index) {
                    var $row = $(row);

                    $row.css("cursor", "pointer");
                    $row.attr("role", "row");
                }
            });

            // Owned PE asset
            $this.configs.$.datatable.ownedPE = $(`${$this.configs.selector.tableId.ownedPE}`).dataTable({
                "data": $this.configs.data.assetOwnedPEs || [],
                "bFilter": false,
                "bPaginate": true,
                "aaSorting": [[0, 'desc']],
                "aoColumns": [
                    {
                        "mData": "id",
                        "sClass": "hidden id",
                        "bSearchable": false
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "bSearchable": false,
                        "sClass": "text-center action-column",
                        "render": function (data) {
                            var html = "<div>";
                                //html += `<button class="btn btn-xs btn-primary btn-edit-asset" data-entity-id="${data.vehicleId}" data-asset-type="${ASSET_TYPE.VEHICLE}" ${tooltipHelper.edit("Edit")}><i class="fa fa-edit"></i></button>`;
                                html += `<button class="btn btn-xs btn-danger btn-delete-asset" data-toggle="tooltip" data-entity-id="${data.ownedPEId}" data-asset-type="${ASSET_TYPE.OWNED_PLANT_EQUIPMENT}" data-placement="bottom" title="Delete"><i class="fa fa-trash"></i></button>`;
                                html += "</div>";

                            return html;
                        }
                    },
                    {
                        "mData": "ownedPEName",
                        "bSortable": true,
                        "sClass": "text-center entity-name-column",
                        "bSearchable": true
                    },
                    {
                        "mData": "operatorName",
                        "bSortable": true,
                        "sClass": "text-center driver-name-column",
                        "bSearchable": true
                    },
                    {
                        "mData": "contractorName",
                        "bSortable": true,
                        "sClass": "text-center contractor-name-column",
                        "bSearchable": true
                    },
                    //{
                    //    "mData": "quantity",
                    //    "bSortable": true,
                    //    "sClass": "text-center quantity",
                    //    "bSearchable": true
                    //}
                ],
                "rowCallback": function (row, data, index) {
                    var $row = $(row);

                    $row.css("cursor", "pointer");
                    $row.attr("role", "row");
                }
            });
        },

        initEvents: function() {
            $(document).delegate($this.configs.selector.button.vehicle.add, "click", function () {
                $this.funcs.addVehicle();
            });

            $(document).delegate($this.configs.selector.button.hiredPE.add, "click", function () {
                $this.funcs.addHiredPE();
            });

            $(document).delegate($this.configs.selector.button.ownedPE.add, "click", function () {
                $this.funcs.addOwnedPE();
            });

            $(document).delegate(`${$this.configs.selector.button.deleteAsset}`, "click", function () {
                var $btn = $(this);

                var entityId = $btn.data('entity-id');
                var assetType = $btn.data('asset-type');

                switch(assetType){
                    case ASSET_TYPE.VEHICLE: {
                        $this.configs.data.assetVehicles = ($this.configs.data.assetVehicles || []).filter(function(item){
                            return item.vehicleId != entityId;
                        });
                        $this.funcs.reloadLocalDataTable($this.configs.$.datatable.vehicle, $this.configs.data.assetVehicles);
                        break;
                    }
                    case ASSET_TYPE.HIRED_PLANT_EQUIPMENT: {
                        $this.configs.data.assetHiredPEs = ($this.configs.data.assetHiredPEs || []).filter(function(item){
                            return item.hiredPEId != entityId;
                        });
                        $this.funcs.reloadLocalDataTable($this.configs.$.datatable.hiredPE, $this.configs.data.assetHiredPEs);
                        break;
                    }
                    case ASSET_TYPE.OWNED_PLANT_EQUIPMENT: {
                        $this.configs.data.assetOwnedPEs = ($this.configs.data.assetOwnedPEs || []).filter(function(item){
                            return item.ownedPEId != entityId;
                        });
                        $this.funcs.reloadLocalDataTable($this.configs.$.datatable.ownedPE, $this.configs.data.assetOwnedPEs);
                        break;
                    }
                    default: {
                        console.error(`Currently, we doesnot support asset type: ${assetType}`)
                    }
                }
            });
        },

        addVehicle: function(){
            var $addModal = $this.configs.$.modal.addAsset;
            var $addModalBody = $addModal.find($this.configs.selector.modal.addAssetBody);

            // Remove old html
            $addModalBody.html("");
            
            $.ajax({
                url: `${$this.configs.urls.getAsset}?assetType=${ASSET_TYPE.VEHICLE}`,
                type: 'GET',
                success: function (result) {
                    // Append worklog html
                    $addModalBody.html(result);

                    var $asset = $addModalBody.find('#EntityId');

                    // Remove assgined asset
                    ($this.configs.data.assetVehicles || []).forEach(function(item){
                        $($asset.find(`option[value=${item.vehicleId}]`)).remove();
                    })

                    App.initFloatingLabel(true);

                    var $vehicle = $addModalBody.find('#EntityId');
                    var $driver = $($addModal.find('#DriverId'));
                    var $contractor = $($addModal.find('#ContractorId'));
                    var $quantity = $($addModal.find('#Quantity'));

                    $driver.off('change').on('change', function() {
                        $contractor.val('');
                    });

                    $contractor.off('change').on('change', function() {
                        $driver.val('');
                    });

                    // Trigger events
                    $addModal.find('.btn-save').off('click').on('click', function (e) {
                        if($vehicle.val()){
                            var assetVehicle = {
                                id: 0,
                                shiftId: 0,
                                vehicleId: $vehicle.val(),
                                driverId: $driver.val(),
                                vehicleName: $($vehicle.find(`option[value=${$vehicle.val()}]`)).text(),
                                driverName: !$driver.val() || $driver.val() == 0 || $driver.val() == ''
                                    ? null
                                    : $($driver.find(`option[value=${$driver.val()}]`)).text(),
                                quantity: $quantity.val(),
                                contractorId: $contractor.val(),
                                contractorName: !$contractor.val() || $contractor.val() == 0 || $contractor.val() == ''
                                    ? null
                                    : $($contractor.find(`option[value=${$contractor.val()}]`)).text()
                            };

                            if(!$this.configs.data.assetVehicles || $this.configs.data.assetVehicles.length == 0) $this.configs.data.assetVehicles = [];
                            $this.configs.data.assetVehicles.push(assetVehicle);

                            $this.funcs.reloadLocalDataTable($this.configs.$.datatable.vehicle, $this.configs.data.assetVehicles);
                        }
                        
                        $addModal.modal('hide');
                    });

                    $addModal.find('.btn-close').off('click').on('click', function (e) {
                        $addModal.modal('hide');
                    });


                    $addModal.css({ 'top': '200px' });

                    // Show modal
                    $addModal.modal('toggle');

                    // Hide modal callback
                    $addModal.on('hidden.bs.modal', function (e) {
                        $addModalBody.html();
                    });
                },
                error: function (result) {
                    console.log("error: " + result);
                    toastr["error"](`Add asset fail, please try again`);
                },
                beforeSend: function () {
                    showAjaxLoadingMask();
                },
                complete: function () {
                    hideAjaxLoadingMask();
                }
            });
        },

        addHiredPE: function(){
            var $addModal = $this.configs.$.modal.addAsset;
            var $addModalBody = $addModal.find($this.configs.selector.modal.addAssetBody);

            // Remove old html
            $addModalBody.html("");

            // Trigger events
            $addModal.find('.btn-save').off('click').on('click', function (e) {
                var $hiredPE = $addModalBody.find('#EntityId');
                var $quantity = $addModalBody.find('#Quantity');
                if($hiredPE.val()){
                    var assetHiredPE = {
                        id: 0,
                        shiftId: 0,
                        hiredPEId: $hiredPE.val(),
                        hiredPEName: $($hiredPE.find(`option[value=${$hiredPE.val()}]`)).text(),
                        quantity: $quantity.val()
                    };

                    if(!$this.configs.data.assetHiredPEs || $this.configs.data.assetHiredPEs.length == 0) $this.configs.data.assetHiredPEs = [];
                    $this.configs.data.assetHiredPEs.push(assetHiredPE);

                    $this.funcs.reloadLocalDataTable($this.configs.$.datatable.hiredPE, $this.configs.data.assetHiredPEs);
                }
                
                $addModal.modal('hide');
            });

            $addModal.find('.btn-close').off('click').on('click', function (e) {
                $addModal.modal('hide');
            });

            $.ajax({
                url: `${$this.configs.urls.getAsset}?assetType=${ASSET_TYPE.HIRED_PLANT_EQUIPMENT}`,
                type: 'GET',
                success: function (result) {
                    // Append worklog html
                    $addModalBody.html(result);

                    var $asset = $addModalBody.find('#EntityId');

                    // Remove assgined asset
                    ($this.configs.data.assetHiredPEs || []).forEach(function(item){
                        $($asset.find(`option[value=${item.hiredPEId}]`)).remove();
                    })

                    App.initFloatingLabel(true);

                    var scrollTop1 = $("#AddShiftModal").scrollTop();
                    var scrollTop2 = $("#AddRecurrenceShiftModal").scrollTop();

                    $addModal.css({ 'top': 300 + ((scrollTop1 + scrollTop2) / 2) + 'px' });

                    // Show modal
                    $addModal.modal('toggle');

                    // Hide modal callback
                    $addModal.on('hidden.bs.modal', function (e) {
                        $addModalBody.html();
                    });
                },
                error: function (result) {
                    console.log("error: " + result);
                    toastr["error"](`Add asset fail, please try again`);
                },
                beforeSend: function () {
                    showAjaxLoadingMask();
                },
                complete: function () {
                    hideAjaxLoadingMask();
                }
            });
        },

        addOwnedPE: function(){
            var $addModal = $this.configs.$.modal.addAsset;
            var $addModalBody = $addModal.find($this.configs.selector.modal.addAssetBody);

            // Remove old html
            $addModalBody.html("");

            $.ajax({
                url: `${$this.configs.urls.getAsset}?assetType=${ASSET_TYPE.OWNED_PLANT_EQUIPMENT}`,
                type: 'GET',
                success: function (result) {
                    // Append worklog html
                    $addModalBody.html(result);

                    var $asset = $addModalBody.find('#EntityId');

                    // Remove assgined asset
                    ($this.configs.data.assetOwnedPEs || []).forEach(function(item){
                        $($asset.find(`option[value=${item.ownedPEId}]`)).remove();
                    })

                    App.initFloatingLabel(true);

                    var $ownedPE = $addModal.find('#EntityId');
                    var $operatorId = $($addModal.find('#OperatorId'));
                    var $contractor = $($addModal.find('#ContractorId'));
                    var $quantity = $($addModal.find('#Quantity'));

                    $operatorId.off('change').on('change', function() {
                        $contractor.val('');
                    });

                    $contractor.off('change').on('change', function() {
                        $operatorId.val('');
                    });

                    // Trigger events
                    $addModal.find('.btn-save').off('click').on('click', function (e) {
                        if($ownedPE.val()){
                            var assetOwnedPE = {
                                id: 0,
                                shiftId: 0,
                                ownedPEId: $ownedPE.val(),
                                operatorId: $operatorId.val(),
                                ownedPEName: $($ownedPE.find(`option[value=${$ownedPE.val()}]`)).text(),
                                operatorName: !$operatorId.val() || $operatorId.val() == 0 || $operatorId.val() == ''
                                    ? null
                                    : $($operatorId.find(`option[value=${$operatorId.val()}]`)).text(),
                                quantity: $quantity.val(),
                                contractorId: $contractor.val(),
                                contractorName: !$contractor.val() || $contractor.val() == 0 || $contractor.val() == ''
                                    ? null
                                    : $($contractor.find(`option[value=${$contractor.val()}]`)).text()
                            };

                            if(!$this.configs.data.assetOwnedPEs || $this.configs.data.assetOwnedPEs.length == 0) $this.configs.data.assetOwnedPEs = [];
                            $this.configs.data.assetOwnedPEs.push(assetOwnedPE);

                            $this.funcs.reloadLocalDataTable($this.configs.$.datatable.ownedPE, $this.configs.data.assetOwnedPEs);
                        }
                        
                        $addModal.modal('hide');
                    });

                    $addModal.find('.btn-close').off('click').on('click', function (e) {
                        $addModal.modal('hide');
                    });

                    var scrollTop1 = $("#AddShiftModal").scrollTop();
                    var scrollTop2 = $("#AddRecurrenceShiftModal").scrollTop();

                    $addModal.css({ 'top':400 + ((scrollTop1 + scrollTop2) / 2) + 'px' });

                    // Show modal
                    $addModal.modal('toggle');
                },
                error: function (result) {
                    console.log("error: " + result);
                    toastr["error"](`Add asset fail, please try again`);
                },
                beforeSend: function () {
                    showAjaxLoadingMask();
                },
                complete: function () {
                    hideAjaxLoadingMask();
                }
            });
        },

        reloadLocalDataTable: function($datatable, data){
            $datatable.dataTable().fnClearTable();

            if(data && data.length > 0){
                $datatable.dataTable().fnAddData(data);
            }
        },
    }
}