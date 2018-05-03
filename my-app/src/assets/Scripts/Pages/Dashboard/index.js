var dashBoardConfig = {
    selectors: {
        shiftsperday: $("#shifts-per-day"),
        shiftsperdayDateRange: $("#shifts-per-day-date-range"),
        shiftsplannedperday: $("#shifts-planned-per-day"),
        shiftsplannedperdayDateRange: $("#shifts-planned-per-day-date-range"),
        employeeworkingonday: document.getElementById("employee-working-on-day-div"),
        employeeworkingondayCanvas: document.getElementById("employee-working-on-day-canvas"),
        employeeworkingondaytext: document.getElementById("employee-working-on-day-text"),
        employeeworkingondaytextmax: document.getElementById("employee-working-on-day-text-max"),
        vehiclesusedonday: document.getElementById("vehicles-used-on-day-div"),
        vehiclesusedondayCanvas: document.getElementById("vehicles-used-on-day-canvas"),
        vehiclesusedondaytext: document.getElementById("vehicles-used-on-day-text"),
        vehiclesusedondaytextmax: document.getElementById("vehicles-used-on-day-text-max"),
        ownedplantequipmentusedonday: document.getElementById("owned-plant-equipment-used-on-day-div"),
        ownedplantequipmentusedondayCanvas: document.getElementById("owned-plant-equipment-used-on-day-canvas"),
        ownedplantequipmentusedondaytext: document.getElementById("owned-plant-equipment-used-on-day-text"),
        ownedplantequipmentusedondaytextmax: document.getElementById("owned-plant-equipment-used-on-day-text-max")
    },
    charts: {
      shiftsperdayChart: null,
      shiftsplannedperdayChart: null,
      employeeworkingondayChart: null,
      vehiclesusedondayChart: null,
      ownedplantequipmentusedondayChart: null
    },
    moduleName: "shift",
    $table: null,
    tableId: "#datatable",
    $datatable: $("#datatable"),
    urls: {
        getList: apiUrl.shift.getListForDashBoard,
        edit: apiUrl.shift.edit,
        clone: apiUrl.shift.clone,
        getShiftsPerDay: apiUrl.dashboard.getShiftsPerDay,
        getShiftsPlannedPerDay: apiUrl.dashboard.getShiftsPlannedPerDay,
        getResourcesOnTheDay: apiUrl.dashboard.getResourcesOnTheDay
    },
    shiftStatuses: constant.shiftStatuses,
    chartColors: {
        blue : "rgb(54, 162, 235)",
        green: "#30B32D",
        grey: "rgb(201, 203, 207)",
        orange: "rgb(255, 159, 64)",
        purple:"rgb(153, 102, 255)",
        red: "#F03E3E",
        yellow: "#FFDD00"
    }
};

var dashBoardFunction = {
    initPage: function() {
        dashBoardFunction.initShiftTable();
        dashBoardFunction.initEvent();
        dashBoardFunction.initChart();
        dashBoardFunction.initSignalR();
    },
    initShiftTable: function() {
        dashBoardConfig.$table = dashBoardConfig.$datatable.dataTable({
            ajax: {
                url: dashBoardConfig.urls.getList,
                type: "POST"
            },
            "serverSide": true,
            "searching": false,
            "lengthChange": false,
            "aaSorting": [[3, 'desc']],
            "aoColumns": [
                {
                    "mData": "id",
                    "sClass": "hidden",
                    "bSearchable": false
                },
                {
                    "mData": null,
                    "bSortable": false,
                    "bSearchable": false,
                    "sClass": "text-center",
                    "render": function(data) {
                        return `<div><a href="${dashBoardConfig.urls.edit}/${data.id}" class="btn btn-xs btn-primary" ${
                            tooltipHelper.edit("Shift")}><i class="fa fa-edit"></i></a></div>`;
                    }
                },
                {
                    "mData": "shiftNumber"
                },
                {
                    "mData": "startDateTime",
                    "render": function(data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateTimeFormat);
                        return "";
                    }
                },
                {
                    "mData": "finishDateTime",
                    "render": function(data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateTimeFormat);
                        return "";
                    }
                },
                {
                    "mData": "city"
                },
                {
                    "mData": "teamLeaderName",
                },
                {
                    "mData": "teamMemberNames",
                    "bSortable": false,
                    "bSearchable": false,
                },
                {
                    "mData": "shiftStatusName",
                    "render": function(data) {
                        if (data == dashBoardConfig.shiftStatuses.Planned) {
                            return '<span class="label label-sm bg-shift-planned"> ' + data + ' </span>';
                        }
                        if (data == dashBoardConfig.shiftStatuses.ShiftConfirmed) {
                            return '<span class="label label-sm bg-shift-confirmed"> ' + data + ' </span>';
                        }
                        if (data == dashBoardConfig.shiftStatuses.Dispatched) {
                            return '<span class="label label-sm bg-shift-dispatched"> ' + data + ' </span>';
                        }
                        if (data == dashBoardConfig.shiftStatuses.Active) {
                            return '<span class="label label-sm bg-shift-active"> ' + data + ' </span>';
                        }
                        if (data == dashBoardConfig.shiftStatuses.Cancelled) {
                            return '<span class="label label-sm bg-shift-cancelled"> ' + data + ' </span>';
                        }
                        if (data == dashBoardConfig.shiftStatuses.Cancelled) {
                            return '<span class="label label-sm bg-shift-cancelled"> ' + data + ' </span>';
                        }
                        if (data == dashBoardConfig.shiftStatuses.PersonnelConfirmed) {
                            return '<span class="label label-sm bg-shift-personnel-confirmed"> ' +
                                data +
                                ' </span>';
                        }
                        if (data == dashBoardConfig.shiftStatuses.Complete) {
                            return '<span class="label label-sm bg-shift-complete"> ' + data + ' </span>';
                        }
                        return '<span class="label label-sm label-success"> ' + data + ' </span>';
                    }
                }
            ]
        });
    },
    initEvent: function () {
        dashBoardConfig.selectors.shiftsperdayDateRange.on("change",
            function() {
               dashBoardFunction.initShiftsPerDay();   
            });

        dashBoardConfig.selectors.shiftsplannedperdayDateRange.on("change",
            function() {
               dashBoardFunction.initShiftsPlannedPerDay();   
            });

        var shiftsperdayId = dashBoardConfig.selectors.shiftsperdayDateRange.attr("id");
        var shiftsperdayTable = dashBoardConfig.selectors.shiftsperday.attr("table");
        var shiftsperdayType = dashBoardConfig.selectors.shiftsperday.attr("type");

        var shiftsplannedperdayId = dashBoardConfig.selectors.shiftsplannedperdayDateRange.attr("id");
        var shiftsplannedperdayTable = dashBoardConfig.selectors.shiftsplannedperday.attr("table");
        var shiftsplannedperdayType = dashBoardConfig.selectors.shiftsplannedperday.attr("type");

        var shiftsperdayConfigs = userSettings.find(function(item) {
            return item.table == shiftsperdayTable && item.type == shiftsperdayType;
        });

        if (shiftsperdayConfigs != null) {
            dashBoardConfig.selectors.shiftsperdayDateRange.val(shiftsperdayConfigs.value);
        }

        var shiftsplannedperdayConfigs = userSettings.find(function(item) {
            return item.table == shiftsplannedperdayTable && item.type == shiftsplannedperdayType;
        });

        if (shiftsplannedperdayConfigs != null) {
            dashBoardConfig.selectors.shiftsplannedperdayDateRange.val(shiftsplannedperdayConfigs.value);
        }

        initCustomSetting(null, shiftsperdayId, shiftsperdayTable, shiftsperdayType);
        initCustomSetting(null, shiftsplannedperdayId, shiftsplannedperdayTable, shiftsplannedperdayType);
    },
    initChart: function () {
        dashBoardFunction.initShiftsPerDay();

        dashBoardFunction.initShiftsPlannedPerDay();

        dashBoardFunction.initResourcesOnDay();
    },
    installChartJS: function(element, selector, listLabel, listData, itemLabel, chartLabel, chartType) {
        var tmax = 3;
        var minSize = 10;
        var step = 5;

        //get max of total
       listData.forEach(function (item) {
           
            if (item > tmax) {
                tmax = item;
            }
        });

        tmax = tmax + step;

        tmax = tmax > 50 ? tmax : 50;

        // Calculate Step
        //step = parseInt(tmax / minSize + (tmax % minSize != 0 ? 1 : 0));

        if (element == null) {
            element = new Chart(selector,
            {
                type: chartType,
                data: {
                    labels: listLabel,
                    datasets: [
                        {
                            label: itemLabel,
                            data: listData,
                            borderColor: dashBoardConfig.chartColors.red,
                            backgroundColor: dashBoardConfig.chartColors.red,
                            fill: false
                        }
                    ]
                },
                options: {
                    legend: { display: false },
                    tootips: {
                        intersect: false,
                        mode: "index",
                        position: "average"
                    },
                    title: {
                        display: true,
                        text: chartLabel
                    },
                    scales: {
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                max: tmax,
                                stepSize: step,
                            },
                            scaleLabel:{
                                display: true,
                                labelString: "Shift"
                            }
                        }],
                        xAxes: [{
                            scaleLabel:{
                                display: true,
                                labelString: "Date"
                            }
                        }]
                    },
                    elements: {
                        line: {
                            tension: 0 // disables bezier curves
                        },
                        // point: {
                        //     //radius: 0,
                        //     // hoverRadius: 5,
                        //     // hitRadius: 5
                        // }
                    }
                }
            });

            selector.click(function (evt) {
                var activePoints = element.getElementsAtEvent(evt); 

                if (activePoints.length > 0) {
                     console.log(element.data.labels[activePoints[0]._index]);

                    //var date = moment(element.data.labels[activePoints[0]._index]);

                    //window.location = "/RunSheet?date=" + date.format('DD/MM/YYYY');
                }
            });
        } else {
            element.data.labels = listLabel;

            element.data.datasets[0].label = itemLabel;
            element.data.datasets[0].data = listData;

            element.config.options.title.text = chartLabel;

            element.config.options.scales.yAxes[0].ticks.max = tmax;
            element.config.options.scales.yAxes[0].ticks.stepSize = step;

            element.update();
        }

        return element;
    },
    installLineChart: function (element, selector, listLabel, listData, itemLabel, chartLabel) {
        var tmax = 3;
        var minSize = 10;
        var step = 5;

        //get max of total
       listData.forEach(function (item) {
           
            if (item > tmax) {
                tmax = item;
            }
        });

        tmax = tmax + step;

        tmax = tmax > 50 ? tmax : 50;

        // Calculate Step
        //step = parseInt(tmax / minSize + (tmax % minSize != 0 ? 1 : 0));

        if (element == null) {
            element = new Chart(selector,
            {
                type: 'line',
                data: {
                    labels: listLabel,
                    datasets: [
                        {
                            label: itemLabel,
                            data: listData,
                            borderColor: dashBoardConfig.chartColors.red,
                            backgroundColor: dashBoardConfig.chartColors.red,
                            fill: false
                        }
                    ]
                },
                options: {
                    legend: { display: false },
                    tootips: {
                        intersect: false,
                        mode: "index",
                        position: "average"
                    },
                    title: {
                        display: true,
                        text: chartLabel
                    },
                    scales: {
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                max: tmax,
                                stepSize: step,
                            },
                            scaleLabel:{
                                display: true,
                                labelString: "Shift"
                            }
                        }],
                        xAxes: [{
                            scaleLabel:{
                                display: true,
                                labelString: "Date"
                            }
                        }]
                    },
                    elements: {
                        line: {
                            
                            tension: 0 // disables bezier curves
                        },
                        // point: {
                        //     //radius: 0,
                        //     // hoverRadius: 5,
                        //     // hitRadius: 5
                        // }
                    }
                }
            });

            selector.click(function (evt) {
                var activePoints = element.getElementsAtEvent(evt); 

                if (activePoints.length > 0) {
                     console.log(element.data.labels[activePoints[0]._index]);

                    //var date = moment(element.data.labels[activePoints[0]._index]);

                    //window.location = "/RunSheet?date=" + date.format('DD/MM/YYYY');
                }
            });
        } else {
            element.data.labels = listLabel;

            element.data.datasets[0].label = itemLabel;
            element.data.datasets[0].data = listData;

            element.config.options.title.text = chartLabel;

            element.config.options.scales.yAxes[0].ticks.max = tmax;
            element.config.options.scales.yAxes[0].ticks.stepSize = step;

            element.update();
        }

        return element;
    },
    installBarChart: function (element, selector, listLabel, listData, itemLabel, chartLabel) {
        var tmax = 3;
        var minSize = 10;
        var step = 5;

        //get max of total
       listData.forEach(function (item) {
           
            if (item > tmax) {
                tmax = item;
            }
        });

        tmax = tmax + step;

        tmax = tmax > 50 ? tmax : 50;

        // Calculate Step
        //step = parseInt(tmax / minSize + (tmax % minSize != 0 ? 1 : 0));

        if (element == null) {
            element = new Chart(selector,
            {
                type: 'bar',
                data: {
                    labels: listLabel,
                    datasets: [
                        {
                            label: itemLabel,
                            data: listData,
                            borderColor: dashBoardConfig.chartColors.red,
                            backgroundColor: dashBoardConfig.chartColors.red,
                            fill: false
                        }
                    ]
                },
                options: {
                    legend: { display: false },
                    tootips: {
                        intersect: false,
                        mode: "index",
                        position: "average"
                    },
                    title: {
                        display: true,
                        text: chartLabel
                    },
                    scales: {
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                max: tmax,
                                stepSize: step,
                            },
                            scaleLabel:{
                                display: true,
                                labelString: "Shift"
                            }
                        }],
                        xAxes: [{
                            scaleLabel:{
                                display: true,
                                labelString: "Date"
                            }
                        }]
                    },
                    elements: {
                        line: {
                            
                            tension: 0 // disables bezier curves
                        },
                        // point: {
                        //     //radius: 0,
                        //     // hoverRadius: 5,
                        //     // hitRadius: 5
                        // }
                    }
                }
            });

            selector.click(function (evt) {
                var activePoints = element.getElementsAtEvent(evt); 

                if (activePoints.length > 0) {
                     console.log(element.data.labels[activePoints[0]._index]);

                    var date = moment(element.data.labels[activePoints[0]._index]);

                    //window.location = "/RunSheet?date=" + date.format('DD/MM/YYYY');
                }
            });
        } else {
            element.data.labels = listLabel;

            element.data.datasets[0].label = itemLabel;
            element.data.datasets[0].data = listData;

            element.config.options.title.text = chartLabel;

            element.config.options.scales.yAxes[0].ticks.max = tmax;
            element.config.options.scales.yAxes[0].ticks.stepSize = step;

            element.update();
        }

        return element;
    },
    initShiftsPerDay: function() {
        var thedays = dashBoardConfig.selectors.shiftsperdayDateRange.val();

        var requestData = {
            days: thedays
        }

        var successCallback = function(response) {
            var tlabels = [];
            var tdata = [];

            response.shiftsPerDay.forEach(function (item) {
                var date = moment(item.date);
                tlabels.push(date.format('DD/MM/YYYY'));
                tdata.push(item.total);
            });

            dashBoardConfig.charts.shiftsperdayChart = dashBoardFunction.installLineChart(
                dashBoardConfig.charts.shiftsperdayChart,
                dashBoardConfig.selectors.shiftsperday,
                tlabels, tdata, "Completed Shifts", "Completed Shifts");
        };

        var errorCallback = function(response) {
            
        };

        $.ajax({
            type: "POST",
            url: dashBoardConfig.urls.getShiftsPerDay,
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
    initShiftsPlannedPerDay: function() {
        var thedays = dashBoardConfig.selectors.shiftsplannedperdayDateRange.val();

        var requestData = {
            days: thedays
        }

        var successCallback = function(response) {
            var tlabels = [];
            var tdata = [];
          
            response.shiftsPerDay.forEach(function (item) {
                var date = moment(item.date);

                //get data
                tlabels.push(date.format('DD/MM/YYYY'));
                tdata.push(item.total);
            });

            dashBoardConfig.charts.shiftsplannedperdayChart = dashBoardFunction.installBarChart(
                dashBoardConfig.charts.shiftsplannedperdayChart,
                dashBoardConfig.selectors.shiftsplannedperday,
                tlabels, tdata, "Planned Shifts", "Planned Shifts");
        };

        var errorCallback = function(response) {
            
        };

        $.ajax({
            type: "POST",
            url: dashBoardConfig.urls.getShiftsPlannedPerDay,
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
    installGaugeN: function(element, selector, labelText, labelmax, value, total){
         if (element){
            element.refresh(value, total);
         } else {
            element = new JustGage({
            id: $(selector).attr("id"),
            value: value,
            min: 0,
            max: total,
            pointer: true,
            gaugeWidthScale: 1,
            customSectors: [{
              color: dashBoardConfig.chartColors.red,
              lo: 0,
              hi: total / 3
            }, {
              color: dashBoardConfig.chartColors.yellow,
              lo: total / 3,
              hi: total / 3 * 2
            },
            {
              color: dashBoardConfig.chartColors.green,
              lo: total / 3 * 2,
              hi: total
            }],
            counter: true,
            label: labelText
          });

         }
        
        return element;
    },
    installGauge: function(element, selector, label, labelmax, value, total){
        if (element){
            // Update Chart
            element.maxValue = total; // set max gauge value
            element.set(value); // set actual value
            element.setTextField(label);
            $(labelmax).html(total);
        } else {
            // Create New Chart
            // Min value = 0

            var opts = {
                angle: -0.2, // The span of the gauge arc
                lineWidth: 0.23, // The line thickness
                radiusScale: 1, // Relative radius
                pointer: {
                    length: 0.6, // // Relative to gauge radius
                    strokeWidth: 0.03, // The thickness
                    color: '#000000' // Fill color
                },
                limitMax: false,     // If false, max value increases automatically if value > maxValue
                limitMin: false,     // If true, the min value of the gauge will be fixed
                //colorStart: '#ff0000',   // Colors
                //colorStop: '#4db319',    // just experiment with them
                //strokeColor: '#E0E0E0',  // to see which ones work best for yous
                generateGradient: true,
                highDpiSupport: true,     // High resolution support
                staticZones: [
                    {strokeStyle: dashBoardConfig.chartColors.red, min: 0, max: total * 0.295}, //red
                    {strokeStyle: dashBoardConfig.chartColors.yellow, min: total * 0.3, max: total * 0.695 }, //yellow
                    {strokeStyle: dashBoardConfig.chartColors.green, min: total * 0.7, max: total} //green
                ],
                staticLabels: {
                    font: "12px sans-serif",  // Specifies font
                    labels: [0, total],  // Print labels at these values
                    color: "#000000",  // Optional: Label text color
                    fractionDigits: 0  // Optional: Numerical precision. 0=round off.
                }
            };

            element = new Gauge(selector).setOptions(opts); // create sexy gauge!
            element.maxValue = total; // set max gauge value
            element.setMinValue(0); // Prefer setter over gauge.minValue = 0
            element.animationSpeed = 64; // set animation speed (32 is default value)
            element.set(value); // set actual value
            element.setTextField(label);
            //$(labelmax).html(total);
        }
        
    },
    initResourcesOnDay: function () {
        var successCallback = function(response) {
            // Init missing data

           // Get Data From Api
           if (response.employees){
                // dashBoardConfig.charts.employeeworkingondayChart = dashBoardFunction.installGaugeN(dashBoardConfig.charts.employeeworkingondayChart,
                //     dashBoardConfig.selectors.employeeworkingonday,
                //     "employees",
                //     dashBoardConfig.selectors.employeeworkingondaytextmax,
                //     response.employees.length, response.totalEmployee);

                dashBoardConfig.charts.employeeworkingondayChart = dashBoardFunction.installGauge(dashBoardConfig.charts.employeeworkingondayChart,
                    dashBoardConfig.selectors.employeeworkingondayCanvas,
                    dashBoardConfig.selectors.employeeworkingondaytext,
                    dashBoardConfig.selectors.employeeworkingondaytextmax,
                    response.employees.length, response.totalEmployee);
           }

           if (response.vehicles){
                // dashBoardConfig.charts.vehiclesusedondayChart = dashBoardFunction.installGaugeN(dashBoardConfig.charts.vehiclesusedondayChart,
                //     dashBoardConfig.selectors.vehiclesusedonday, 
                //     "vehicles", 
                //     dashBoardConfig.selectors.vehiclesusedondaytextmax, 
                //     response.vehicles.length, response.totalVehicle);

                dashBoardConfig.charts.vehiclesusedondayChart = dashBoardFunction.installGauge(dashBoardConfig.charts.vehiclesusedondayChart,
                    dashBoardConfig.selectors.vehiclesusedondayCanvas, 
                    dashBoardConfig.selectors.vehiclesusedondaytext, 
                    dashBoardConfig.selectors.vehiclesusedondaytextmax, 
                    response.vehicles.length, response.totalVehicle);
            }

            if (response.ownedPlantEquipments){
                // dashBoardConfig.charts.ownedplantequipmentusedondayChart = dashBoardFunction.installGaugeN(dashBoardConfig.charts.ownedplantequipmentusedondayChart,
                //     dashBoardConfig.selectors.ownedplantequipmentusedonday, 
                //     "plants & equipments", 
                //     dashBoardConfig.selectors.ownedplantequipmentusedondaytextmax, 
                //     response.ownedPlantEquipments.length, response.totalOwnedPlantEquipment);

                dashBoardConfig.charts.ownedplantequipmentusedondayChart = dashBoardFunction.installGauge(dashBoardConfig.charts.ownedplantequipmentusedondayChart,
                    dashBoardConfig.selectors.ownedplantequipmentusedondayCanvas, 
                    dashBoardConfig.selectors.ownedplantequipmentusedondaytext, 
                    dashBoardConfig.selectors.ownedplantequipmentusedondaytextmax, 
                    response.ownedPlantEquipments.length, response.totalOwnedPlantEquipment);
            }
        };

        var errorCallback = function(response) {
            
        };

        $.ajax({
            type: "POST",
            url: dashBoardConfig.urls.getResourcesOnTheDay,
            data: { 'date': '' },
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
    initSignalR: function () {
        try {
            // Add shift changed event
            signalRHelper.funcs.addListener(signalRHelper.configs.eventType.shiftChanged,
                function(type, response) {
                    console.log(type);
                    console.log(response);

                    dashBoardFunction.initChart();
                }
            );

            // Add worklog changed event
            signalRHelper.funcs.addListener(signalRHelper.configs.eventType.worklogChanged,
                function(type, response) {
                    console.log(type);
                    console.log(response);

                    dashBoardFunction.initChart();
                }
            );
        } catch (err) {
            console.log(err);
        }
    }
};

$(document).ready(function () {
    dashBoardFunction.initPage();
});