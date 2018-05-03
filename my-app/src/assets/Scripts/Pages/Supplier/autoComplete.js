var supplierAutoCompleteConfigs = {
    selecters: {
        $txtSearchBox: null
    },
    urls: {
        getSupplier: apiUrl.supplier.quickSearch
    }
}

var supplierAutoCompleteFncs = {
    initEvents: function (txtSearchBoxId) {
        supplierAutoCompleteConfigs.selecters.$txtSearchBox = $(txtSearchBoxId);
        supplierAutoCompleteFncs.get(supplierAutoCompleteConfigs.selecters.$txtSearchBox);
    },
    get: function ($selecter) {
        $selecter.select2({
            placeholder: "Input at least 1 character to search",
            minimumInputLength: 1,
            ajax: {
                url: supplierAutoCompleteConfigs.urls.getSupplier,
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