var configs = {
    selecters: {
        contactTypeId: "#ContactType",
        $contactType: $("#ContactType"),
        $customer: $("#CustomerId"),
        customer: "#CustomerId",
        $supplier: $("#SupplierId"),
        supplier: "#SupplierId"
    },
    urls: {
        getList: apiUrl.contact.getList,
        edit: apiUrl.contact.edit
    }
};

var fncs = {
    contactTypeChanged: function($selecter) {
        const value = $selecter.val();
        if(value === "Customer") {
            configs.selecters.$customer.closest(".col-xs-12.col-md-4").removeClass("hidden");
            configs.selecters.$supplier.closest(".col-xs-12.col-md-4").addClass("hidden");
        }else {
            configs.selecters.$supplier.closest(".col-xs-12.col-md-4").removeClass("hidden");
            configs.selecters.$customer.closest(".col-xs-12.col-md-4").addClass("hidden");
        }
    },
    customerTextChanged: function ($selecter) {
        const value = $selecter.val();
        configs.selecters.$customer.val(value);
        if(configs.selecters.$supplier) {
            configs.selecters.$supplier.val("");
        }
    },
    supplierTextChanged: function ($selecter) {
        const value = $selecter.val();
        configs.selecters.$supplier.val(value);
        if (configs.selecters.$customer) {
            configs.selecters.$customer.val("");
        }
    },
    wireEvents: function () {
        if (configs.selecters.customer) {
            customerAutoCompleteFncs.initEvents(configs.selecters.customer);
        }

        if (configs.selecters.$supplier) {
            supplierAutoCompleteFncs.initEvents(configs.selecters.supplier);
        }

        if (configs.selecters.$supplier) {
            configs.selecters.$supplier.on("change", function () {
                fncs.supplierTextChanged($(this));
            });
        }

        if (configs.selecters.$customer) {
            configs.selecters.$customer.on("change", function () {
                fncs.customerTextChanged($(this));
            });
        }
        
        configs.selecters.$contactType.on("change", function (e) {
            fncs.contactTypeChanged($(this));
        });
    }
};

$(document).ready(function () {
    fncs.wireEvents();
});