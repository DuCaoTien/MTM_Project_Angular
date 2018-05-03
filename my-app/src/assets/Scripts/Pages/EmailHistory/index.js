var emailHistoryConfigs = {
    $table: null,
    tableId: "#email_History_Datatable",
    $datatable: $("#email_History_Datatable"),
    urls: {
        getList: apiUrl.emailHistory.getList,
        detail: apiUrl.emailHistory.detail,
        download: apiUrl.emailHistory.download
    }
};

var emailHistoryFncs = {
    initPage: function (shiftId) {
        emailHistoryConfigs.shiftId = shiftId;

        emailHistoryFncs.initDatatable();
        emailHistoryFncs.initEvents();
    },
    initDatatable: function () {
        if(emailHistoryConfigs.$table) return;

        emailHistoryConfigs.$table = emailHistoryConfigs.$datatable.dataTable({
            ajax: {
                url: emailHistoryConfigs.urls.getList + "?shiftId=" + emailHistoryConfigs.shiftId,
                type: "POST"
            },
            "serverSide": true,
            "aaSorting": [[7, 'desc']],
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
                    "render": function (data) {
                        var html = '<div>';
                            html += `<a href="${emailHistoryConfigs.urls.detail}/${data.id}" class="btn btn-xs btn-primary" data-toggle="tooltip" data-placement="right" title="View Detail"><i class="fa fa-eye"></i></a>`;
                            html += `<a href="${emailHistoryConfigs.urls.download}?globalId=${data.globalId}" target="_blank" class="btn btn-xs btn-primary" ${tooltipHelper.download("Pdf")}><i class="fa fa-download"></i></a>`;
                            html += '</div>';
                        return html;
                    }
                },
                {
                    "mData": "shiftNumber",
                    // "sClass": "text-center"
                },
                {
                    "mData": "to",
                    // "sClass": "text-center"
                },
                {
                    "mData": "cCs",
                    // "sClass": "text-center",
                    render: function(data) {
                        if(!data || data == "") return '';

                        var ccs = data.trim().split(',') || [];
                        var html = '';

                        ccs.forEach(function(cc) {
                            html += cc + '<br/>';
                        })

                        return html;
                    }
                },
                {
                    "mData": "subject",
                    // "sClass": "text-center"
                },
                {
                    "mData": "status",
                    "sClass": "text-center"
                },
                {
                    "mData": "createdOnUtc",
                    "render": function (data) {
                        if (data != null)
                            return getLocalFromUtcWithFormat(data, constant.dateFormat);
                        return "";
                    }
                },
            ],
            "initComplete": function (settings, json) {
            },
            "fnDrawCallback": function (settings) {
                // datatable set cursor is pointer
                emailHistoryConfigs.$datatable.find('tbody tr').each(function () {
                    $(this).css("cursor", "pointer");
                    $(this).attr("role", "row");
                });

                $('[data-toggle="tooltip"]').tooltip();
            }
        });
    },
    initEvents: function () {
        
    }
}