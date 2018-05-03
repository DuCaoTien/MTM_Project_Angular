var report = {
    urls : {},
    memberType: {
        wholeTeam: "1",
        individual: "2"
    },
    selector: {
        exportType: '#ExportType'
    },
    initReport: function() {
        report.contractorTypeOnChange();
        report.memberTypeOnChange();
        report.contractorIdOnChange();
    },

    generateReport: function(formId, exportType) {
        $(report.selector.exportType).val(exportType);

        var $form = $(`#${formId}`);

        if ($form != null && $form.valid()) {
            let formDataObj = $form.serializeObjectX(); 

            let formData = JSON.stringify(formDataObj);

            $.ajax({
                type: "POST",
                url: report.urls.reportSubmitUrl,
                data: formData,
                dataType: "json",
                contentType: "application/json",
                success: function(response) {
                    try {
                        newWindow.close();
                    } catch (ex) {
                    }

                    if (response.isPreview == true) {
                        newWindow = window.open(response.previewUrl, "Report");
                    } else if (response.isPreview == false) {
                        // export to excel
                        newWindow = window.open(report.urls.exportUrl + "?fileName=" + response.fileName, '_blank');
                    }
                    if (newWindow) {
                        //Browser has allowed it to be opened
                        newWindow.focus();
                    } else {
                        //Browser has blocked it
                        alert('Please allow popups for this website');
                    }
                },
                error: function(response) {
                    if (typeof (response.responseJSON) !== 'undefined') {
                        showAjaxFailureMessage(response.responseJSON);
                    } else {
                        var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                        showAjaxFailureMessage(text);
                    }
                },
                beforeSend: function() {
                    showAjaxLoadingMask();
                },
                complete: function() {
                    hideAjaxLoadingMask();
                }
            });
        }
    },
    /* Helper Methods */
    contractorTypeOnChange: function() {
        $('input[name="ContractorType"]').on('change',
            function () {
                var contractorType = $(this).val();
                $('#ContractorType').val(contractorType);

                report.generateOptions();
            });
    },

    memberTypeOnChange: function() {
        $('input[name="MemberType"]').on('change',
            function () {
                var memberType = $(this).val();
                $('#MemberType').val(memberType);

                report.generateOptions();
            });
    },

    contractorIdOnChange: function () {
        $('select[name="ContractorIds"]').on('change',
            function () {
                report.generateOptions();
            });
    },

    generateOptions: function () {
        var $contractorIdClass = $('.contractor-ids');
        var $hiredPlantEquipmentIdClass = $('.hiredplantequipment-ids');
        var $contractorIds = $('#ContractorIds');
        var $hiredplantequipmentIds = $('#HiredPlantEquipmentIds');
        var contractorType = $('#ContractorType').val();
        var memberType = $('#MemberType').val();
        var contractorIds = $contractorIds.val() || [];

        switch (contractorType) {
            case "WholeTeam":// Whole Team
            case report.memberType.wholeTeam: {
                switch (memberType) {
                    case "WholeTeam":// Whole Team
                    case report.memberType.wholeTeam: {
                        $contractorIdClass.hide();
                        $hiredPlantEquipmentIdClass.hide();

                        break;
                    }
                    case "Individual": // Individual
                    case report.memberType.individual: {
                        $contractorIdClass.hide();
                        $hiredPlantEquipmentIdClass.show();
                        report.generateHiredPlantEquipmentList($hiredplantequipmentIds, report.hiredPlantEquipments);

                        break;
                    }
                }

                break;
            }
            case "Individual": // Individual
            case report.memberType.individual: {
                switch (memberType) {
                    case "WholeTeam":// Whole Team
                    case report.memberType.wholeTeam: {
                        $contractorIdClass.show();
                        $hiredPlantEquipmentIdClass.hide();
                        
                        report.generateContractorList($contractorIds, report.contractors, contractorIds);

                        break;
                    }
                    case "Individual": // Individual
                    case report.memberType.individual: {
                        $contractorIdClass.show();
                        $hiredPlantEquipmentIdClass.show();
                        var hiredPlantEquipments = (report.hiredPlantEquipments || []).filter(function(item) {
                            return contractorIds.find(function (contractorId) { return contractorId && parseInt(contractorId) == item.SupplierId });
                        });

                        report.generateContractorList($contractorIds, report.contractors, contractorIds);
                        report.generateHiredPlantEquipmentList($hiredplantequipmentIds, hiredPlantEquipments);

                        break;
                    }
                }

                break;
            }
        }
    },

    generateContractorList: function ($contractorId, contractorList, contractorIds) {
        // Refresh select
        $contractorId.val(contractorIds);
        $contractorId.find('option').remove();

        // Add new employee options
        (contractorList || []).forEach(function (item) {
            var selected = (contractorIds || []).find(function (contractorId) { return contractorId && parseInt(contractorId) == item.Id}) ? "selected" : "";
            var option = `<option value="${item.Id}" ${selected}>${item.CompanyName}</option>`;

            $contractorId.append($(option));
        });

        $contractorId.trigger('change.select2');
    },

    generateHiredPlantEquipmentList: function ($hiredPlantEquipmentIds, hiredPlantEquipmentList) {
        // Reset hiredPlantEquipmentIds
        $hiredPlantEquipmentIds.val();
        $hiredPlantEquipmentIds.find('option').remove();

        // Add new hiredPlantEquipment options
        (hiredPlantEquipmentList || []).forEach(function (item) {
            var option = `<option value="${item.Id}">${item.Name}</option>`;

            $hiredPlantEquipmentIds.append($(option));
        })

        $hiredPlantEquipmentIds.trigger('change.select2');
    },

    getMemberType: function () {
        return $('#MemberType');
    }
}

$(document).ready(function () {
    report.initReport();
})