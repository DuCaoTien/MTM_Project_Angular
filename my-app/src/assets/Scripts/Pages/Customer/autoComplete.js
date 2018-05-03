var customerAutoCompleteConfigs = {
    selecters: {
        $txtSearchBox: null
    },
    urls: {
        getCustomer: apiUrl.customer.quickSearch
    }
}

var customerAutoCompleteFncs = {
    initEvents: function (txtSearchBoxId) {
        customerAutoCompleteConfigs.selecters.$txtSearchBox = $(txtSearchBoxId);
        customerAutoCompleteFncs.get(customerAutoCompleteConfigs.selecters.$txtSearchBox);
    },
    get: function ($selecter) {
        $selecter.select2({
            placeholder: "Input at least 1 character to search",
            minimumInputLength: 1,
            ajax: {
                url: customerAutoCompleteConfigs.urls.getCustomer,
                data: function (params) {
                    return {
                        term: params.term, // search term
                    };
                },
                dataType: "json",
                type: "GET",
                delay: 250,
                quietMillis: 100,
                processResults: function (data) {
                    return {
                        results: data
                    };
                },
                cache: true
            }
        });
    }
}