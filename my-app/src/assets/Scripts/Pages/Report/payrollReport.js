var report = {
    urls: {
        search: apiUrl.report.search
    },
    reportType: {
        teamLeader: "1",
        teamMember: "2"
    },
    memberType: {
        wholeTeam: "1",
        individual: "2"
    },
    selector: {
        exportType: '#ExportType',
        employeeId: '#EmployeeIds',
    },
    initReport: function() {
        report.reportTypeOnChange();
        report.memberTypeOnChange();
    },
    generateReport: function (formId, exportType) {
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
                success: function (response) {
                    try {
                        newWindow.close();
                    } catch (ex) {}
                    
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
                error: function (response) {
                    if (typeof (response.responseJSON) !== 'undefined') {
                        showAjaxFailureMessage(response.responseJSON);
                    }
                    else {
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
        }
    },
    /* Helper Methods */
    reportTypeOnChange: function() {
         $('input[name="WorklogType"]').on('change', function() {
            var $this = $(this);
            var reportType = $this.val();
            var $reportType = $('#WorklogType');
            var $employeeIdClass = $('.employee-ids');
            var $employeeIds = $('#EmployeeIds');
            var memberType = $('#MemberType').val();

            switch(memberType) {
                case "WholeTeam":
                case report.memberType.wholeTeam: {
                    $employeeIds.val();
                    $employeeIdClass.hide();

                    break;
                }
                case "Individual":
                case report.memberType.individual: {
                    report.generateEmployee($employeeIds);
                    $employeeIdClass.show();
                    break;
                }
            }

            $reportType.val(reportType);

            console.log("reportType", reportType)
         })
    },

    memberTypeOnChange: function() {
         $('input[name="MemberType"]').on('change', function() {
            var $this = $(this);
            var memberType = $this.val();
            var $memberType = $('#MemberType');
            var $employeeIdClass = $('.employee-ids');
            var $employeeIds = $('#EmployeeIds');

            $memberType.val(memberType);

            switch(memberType) {
                case report.memberType.wholeTeam: {
                    report.generateEmployeeList($employeeIds, []);
                    $employeeIdClass.hide();

                    break;
                }
                case report.memberType.individual: {
                    report.generateEmployee($employeeIds);
                    $employeeIdClass.show();
                    break;
                }
            }

            console.log("memberType", memberType)
         })
    },

    generateEmployee: function($employeeIds) {
        var $reportType = $('#WorklogType');
        var reportType = $reportType.val();

        // Refresh select
        $employeeIds.val();
        $employeeIds.find('option').remove();

        switch(reportType) {
            case "TeamLeader":// Team leader
            case report.reportType.teamLeader: {
                report.generateEmployeeList($employeeIds, report.teamLeaders);

                break;
            }
            case "TeamMember": // Team member
            case report.reportType.teamMember: {
                report.generateEmployeeList($employeeIds, report.teamMembers);

                break;
            }
        }
    },

    generateEmployeeList: function($employeeIds, employeeList) {
        // Reset employeeIds
        $employeeIds.val('');

        // Add new employee options
        (employeeList || []).forEach(function(employee) {
            var option = `<option value="${employee.Id}">${employee.FullName}</option>`;

            $employeeIds.append($(option));
        })

        $employeeIds.trigger('change.select2');
    },

    getMemberType: function() {
        return $('#MemberType');
    }
}

$(document).ready(function() {
    report.initReport();
})