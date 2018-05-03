var report = {
    urls: {
        search: apiUrl.report.search
    },
    memberType: {
        wholeTeam: "1",
        individual: "2"
    },
    selector: {
        exportType: '#ExportType'
    },
    initReport: function() {
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
   
    memberTypeOnChange: function() {
         $('input[name="MemberType"]').on('change', function() {
            var $this = $(this);
            var memberType = $this.val();
            var $memberType = $('#MemberType');
            var $customerIdClass = $('.customer-ids');

            $memberType.val(memberType);

            switch(memberType) {
                case report.memberType.wholeTeam: {
                    $customerIdClass.hide();

                    break;
                }
                case report.memberType.individual: {
                    $customerIdClass.show();
                    break;
                }
            }
         });
    },

    getMemberType: function() {
        return $('#MemberType');
    }
}

$(document).ready(function() {
    report.initReport();
})