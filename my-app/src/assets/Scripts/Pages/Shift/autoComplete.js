function ContactAutoComplete() {
    const $this = this;

    $this.configs = {
        selecters: {
            $txtSearchBox: null,
            $customerId: null,
        },
        urls: {
            getContact: apiUrl.contact.quickSearch
        }
    };

    $this.funcs = {
        initEvents: function (customerId, searchBoxId) {
            $this.configs.selecters.$customerId = $(customerId);
            $this.configs.selecters.$txtSearchBox = $(searchBoxId);
            $this.configs.selecters.$customerId.on("change", function () {
                if (this.value != null && this.value != "") {
                    $this.configs.selecters.$txtSearchBox.val("");
                    $this.configs.selecters.$txtSearchBox.trigger("change");
                }
            });
            $this.funcs.get($this.configs.selecters.$txtSearchBox);
        },
        get: function ($selecter) {
            $selecter.select2({
                placeholder: "Input at least 1 character to search",
                minimumInputLength: 1,
                ajax: {
                    url: $this.configs.urls.getContact,
                    data: function (params) {
                        return {
                            term: params.term, // search term
                            customerId: $this.configs.selecters.$customerId.val()
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
        },
    };
}

var contactAutoCompleteConfigs = {
    selecters: {
        $txtSearchBox: null,
        $customerId: null,
    },
    urls: {
        getContact: apiUrl.contact.quickSearch
    }
}

var contactAutoCompleteFncs = {
    initEvents: function (customerId, searchBoxId) {
        contactAutoCompleteConfigs.selecters.$customerId = $(customerId);
        contactAutoCompleteConfigs.selecters.$txtSearchBox = $(searchBoxId);
        contactAutoCompleteConfigs.selecters.$customerId.on("change", function () {
            if (this.value != null && this.value != "") {
                contactAutoCompleteConfigs.selecters.$txtSearchBox.val("");
                contactAutoCompleteConfigs.selecters.$txtSearchBox.trigger("change");
            } 
        });
        contactAutoCompleteFncs.get(contactAutoCompleteConfigs.selecters.$txtSearchBox);
    },
    get: function ($selecter) {
        $selecter.select2({
            placeholder: "Input at least 1 character to search",
            minimumInputLength: 1,
            ajax: {
                url: contactAutoCompleteConfigs.urls.getContact,
                data: function (params) {
                    return {
                        term: params.term, // search term
                        customerId: contactAutoCompleteConfigs.selecters.$customerId.val()
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
    },
}
