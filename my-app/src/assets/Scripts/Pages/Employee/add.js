var employeeAddFunctions = {
    initPage: function() {
        employeeCommonFunctions.initPage();

        $(".mpHomePhone").inputmask({ "mask": "09 9999 9999" });
        $(".mpMobilePhone").inputmask({"mask": "0499 999 999"});
    },
}

$(document).ready(function() {
    employeeAddFunctions.initPage();
})