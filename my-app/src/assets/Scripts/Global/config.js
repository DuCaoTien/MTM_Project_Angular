$(document).ready(function () {
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');

    $('.nav-tabs a').click(function (e) {
        $(this).tab('show');
        window.location.hash = this.hash;
        $('body').animate({ scrollTop: 0 }, 'fast');
        $('.modal').animate({ scrollTop: 0 }, 'fast');
    });

    $.ajaxSetup({
        cache: false,
        error: function (xhr, textStatus, errorThrown) {
            try {
                const data = JSON.parse(xhr.responseText);
                console.log("ajax error", data);

                if (data.errorCode && data.errorCode === error.parameterValidationError) {
                    toastr["error"](data.errorMessage);
                }
                else {
                    toastr["error"]("Fail, please try again later");
                }
            } catch (e) {
                toastr["error"]("Fail, please try again later");
            }
        }
    });

    $(document).ajaxSend(function(evt, xhr, settings) {
        if (settings.url.toLowerCase().indexOf('/signalr/') >= 0){
            return;
        }
        var current = new moment().format('MMMM DD YYYY, h:mm:ss a');
        xhr.setRequestHeader('X-Time', current);

        var timeZone = new Date().getTimezoneOffset() * (-1);
        xhr.setRequestHeader('X-Zone', timeZone.toString());

        console.log(current, timeZone);
    });

    if ($.fn.dataTable) {
        $.extend(true, $.fn.dataTable.defaults, {
            "processing": true,
            "lengthMenu": [[10, 25, 50, 100, 200, 300, -1], [10, 25, 50, 100, 200, 300, "All"]]
        });
    }

    toastr.options = {
        closeButton: true,
        debug: false,
        positionClass: "toast-top-center",
        onclick: null,
        showDuration: 300,
        hideDuration: 900,
        timeOut: 10000,
        extendedTimeOut: 0,
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "slideDown",
        hideMethod: "slideUp",
        progressBar: true
    }

    $('.date-picker').datepicker({
        rtl: App.isRTL(),
        orientation: "bottom",
        autoclose: true,
        format: constant.datePickerFormat,
        todayHighlight: true,
        todayBtn: true
    });

    $('.datetime-picker').datetimepicker({
        rtl: App.isRTL(),
        orientation: "bottom",
        autoclose: true,
        minuteStep: 10,
        showMeridian: true,
        format: constant.dateTimePickerFormat,
        showSecond: false,
        showMillisec: false,
        showMicrosec: false,
        showTimezone: false
    });

    $('.time-picker').timepicker({
        showMeridian: false,
        orientation: "bottom",
        autoclose: true,
        minuteStep: 10,
        defaultTime: null
    });

    $('.year-picker').datepicker({
        rtl: App.isRTL(),
        orientation: "bottom",
        autoclose: true,
        format: " yyyy", // Notice the Extra space at the beginning
        viewMode: "years",
        minViewMode: "years"
    });

    $('.year-picker').each(function () {
        var date = new Date(this.value);
        if (date != "Invalid Date") {
            this.value = getLocalFromUtcWithFormat(date, constant.yearFormat);
        }
    });

    $(".select2:not(.special-case").select2({
        placeholder: "Select an option"
    });
    $(".select2_not_required").select2({
        placeholder: "Select an option",
        allowClear: true
    });

    $(".select2-multiple:not(.special-case)").select2({
        placeholder: "Select multiple options",
    });
});

function showAjaxLoadingMask() {
    $('#loading-mask').show();
};

function showAjaxSuccessMessage(message) {
    toastr.success(message, notifyResult.title);
};
function showAjaxWarningMessage(message) {
    toastr.warning(message, notifyResult.title);
};

function hideAjaxLoadingMask() {
    $('#loading-mask').hide();
};

function showAjaxFailureMessage(message) {
    toastr.error(message, notifyResult.title);
}

function replaceAll(str, search, replacement) {
    if (str == null) return null;
    while (str.indexOf(search) >= 0) {
        str = str.replace(search, replacement);
    }
    return str;
}

function resetForm(formId) {
    const $form = $(`#${formId}`);
    if ($form == null) return;
    resetCheckboxValue($form);
    $form[0].reset();
    removeSelect($form);
    $form.find(".select2").trigger("change");
}

function submitAjaxForm(url, formId, replaceText, callback, args, handleResponse) {
    var $form = $(`#${formId}`);
    var form = $form.serializeObjectX();

    
    if ($form != null && $form.valid()) {
        clearSummaryValidation($form);

        // Replace team leader
        if(form["Schedule.TeamLeaderId"])
            form["Schedule.TeamLeaderId"] = form["Schedule.TeamLeaderId"].replace("[Team Leader - select if TL unknown]", "");

        let formData = JSON.stringify(form);
        if (replaceText !== "") {
            formData = replaceAll(formData, replaceText + ".", "");
        }
        $.ajax({
            type: "POST",
            url: url,
            data: formData,
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                if (typeof callback === "function") {
                    if (handleResponse) {
                        callback(response);
                        return;
                    }
                    else
                        callback.apply(this, args);
                } else {
                    if (callback && callback !== "") {
                        setTimeout(function () {
                            showAjaxLoadingMask();
                        }, 300);
                        if (typeof (response) == 'string') {
                            window.location.href = callback;
                        } else {
                            window.location.href = callback + "/" + response.id;
                        }
                    }
                }
                if (typeof (response) == 'string') {
                    showAjaxSuccessMessage(response);
                } else {
                    showAjaxSuccessMessage(response.message);
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
    return false;
}

function deferredSubmitAjaxForm(url, formId, replaceText) {
    var dfd = jQuery.Deferred();

    const $form = $(`${formId}`);
    updateCheckboxValue($form);

    var form = $form.serializeObjectX();
    // Replace team leader
    if(form["Schedule.TeamLeaderId"])
        form["Schedule.TeamLeaderId"] = form["Schedule.TeamLeaderId"].replace("[Team Leader - select if TL unknown]", "");

    let formData = JSON.stringify(form);
    
    if (replaceText !== "") {
        formData = replaceAll(formData, replaceText + ".", "");
    }
    $.ajax({
        type: "POST",
        url: url,
        data: formData,
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            dfd.resolve({
                status: true,
                message: response
            });
        },
        error: function (response) {
            var msg;
            if (typeof (response.responseJSON) !== 'undefined') {
                msg = response.responseJSON;
            }
            else {
                msg = response.statusText;
            }
            showAjaxFailureMessage(msg);

            dfd.reject({
                status: false,
                message: msg
            });
        },
        beforeSend: function () {
            showAjaxLoadingMask();
        },
        complete: function () {
            hideAjaxLoadingMask();
        }
    });

    // Return the Promise so caller can't change the Deferred
    return dfd.promise();
}


function submitRecurrenceAjaxForm(url, formId, replaceText, callback, args, handleResponse) {
    var $form = $(`#${formId}`);
    var form = $form.serializeObjectX();

    // Replace team leader
    if(form["Schedule.TeamLeaderId"])
        form["Schedule.TeamLeaderId"] = form["Schedule.TeamLeaderId"].replace("[Team Leader - select if TL unknown]", "");

    let formData = JSON.stringify(form);
    if (replaceText !== "") {
        formData = replaceAll(formData, replaceText + ".", "");
    }
    $.ajax({
        type: "POST",
        url: url,
        data: formData,
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            if (typeof callback === "function") {
                if (handleResponse) {
                    callback(response);
                    return;
                }
                else
                    callback.apply(this, args);
            } else {
                if (callback && callback !== "") {
                    setTimeout(function () {
                        showAjaxLoadingMask();
                    }, 300);
                    if (typeof (response) == 'string') {
                        window.location.href = callback;
                    } else {
                        window.location.href = callback + "/" + response.id;
                    }
                }
            }
            if (typeof (response) == 'string') {
                showAjaxSuccessMessage(response);
            } else {
                showAjaxSuccessMessage(response.message);
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
    
    return false;
}

function ajaxUploadMultipleFileForShifts(url, files, requestParam, successCallback) {
    if (!files.length || files.length <= 0) return;

    let formData = new FormData();

    // Add request params
    for (var key in requestParam) {
        if (!requestParam.hasOwnProperty(key)) continue;

        formData.append(key, requestParam[key]);
    }

    // Add files
    for (let i = 0; i < files.length; i++) {
        formData.append("file" + i, files[i]);
    }

    $.ajax({
        type: "POST",
        url: url,
        data: formData,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function (response) {
            successCallback(response);
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

function ajaxUploadMultipleFile(url, files, callback) {
    if (files.length <= 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("file" + i, files[i]);
    }

    $.ajax({
        type: "POST",
        url: url,
        data: formData,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function (response) {
            if (typeof (response) == 'string') {
                //showAjaxSuccessMessage(response);
            }

            if (typeof callback === "function") {
                callback(response);
            } else {
                if (callback && callback !== "") {
                    setTimeout(function () {
                        showAjaxLoadingMask();
                    }, 300);
                    window.location.href = callback;
                }
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

function ajaxUploadFile(url, inputFileId, callback) {
    const formData = new FormData();
    const totalFiles = document.getElementById(inputFileId).files.length;
    if (totalFiles === 0) return;
    for (let i = 0; i < totalFiles; i++) {
        const file = document.getElementById(inputFileId).files[i];
        formData.append("FileUpload", file);
    }
    $.ajax({
        type: "POST",
        url: url,
        data: formData,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function (response) {
            if (typeof (response) == 'string') {
                showAjaxSuccessMessage(response);
            }

            if (typeof callback === "function") {
                callback(response);
            } else {
                if (callback && callback !== "") {
                    setTimeout(function () {
                        showAjaxLoadingMask();
                    }, 300);
                    window.location.href = callback;
                }
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

function submitAjaxFormAndUploadFile(url, formId, inputFileId, replaceText, callback, args, handleResponse) {
    var $form = $(`#${formId}`);

    var valid = false;
    try {
        valid = $form != null && $form.valid();
    } catch (ex) {
        valid = true;
    }

    if (valid) {
        clearSummaryValidation($form);

        var formData = new FormData();
        var totalFiles = document.getElementById(inputFileId).files.length;
        for (let i = 0; i < totalFiles; i++) {
            var file = document.getElementById(inputFileId).files[i];
            formData.append("FileUpload", file);
        }

        var otherData = $form.serializeArray();
        $.each(otherData || [], function (key, item) {
            formData.append(item.name, item.value);
        });

        if (replaceText !== "") {
            formData = replaceAll(formData, replaceText + ".", "");
        }

        $.ajax({
            type: "POST",
            url: url,
            data: formData,
            dataType: "json",
            contentType: false,
            processData: false,
            success: function (response) {
                if (typeof callback === "function") {
                    if (handleResponse) {
                        callback(response);
                        return;
                    }
                    else
                        callback.apply(this, args);
                } else {
                    if (callback && callback !== "") {
                        setTimeout(function () {
                            showAjaxLoadingMask();
                        }, 300);
                        if (typeof (response) == 'string') {
                            window.location.href = callback;
                        } else {
                            window.location.href = callback + "/" + response.id;
                        }
                    }
                }
                if (typeof (response) == 'string') {
                    showAjaxSuccessMessage(response);
                } else {
                    showAjaxSuccessMessage(response.message);
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
    return false;
}

var tooltipHelper = {
    edit: function (name) {
        if (name && name.length > 0)
            return `data-toggle="tooltip" data-placement="top" title="Edit ${name}"`;

        return 'data-toggle="tooltip" data-placement="top" title="Edit item"';
    },
    details: function (name) {
        if (name && name.length > 0)
            return `data-toggle="tooltip" data-placement="top" title="View ${name} details"`;

        return 'data-toggle="tooltip" data-placement="top" title="View details"';
    },
    remove: function (name) {
        if (name && name.length > 0)
            return `data-toggle="tooltip" data-placement="top" title="Remove ${name}"`;

        return 'data-toggle="tooltip" data-placement="top" title="Remove item"';
    },
    canNotRemove: function (name) {
        if (name && name.length > 0)
            return `data-toggle="tooltip" data-placement="top" title="Cannot remove ${name}"`;

        return 'data-toggle="tooltip" data-placement="top" title="Cannot remove item"';
    },
    exportPdf: function (name) {
        if (name && name.length > 0)
            return `data-toggle="tooltip" data-placement="top" title="Export ${name}"`;

        return 'data-toggle="tooltip" data-placement="top" title="Export item"';
    },

    download: function (name) {
        if (name && name.length > 0)
            return `data-toggle="tooltip" data-placement="top" title="Download ${name}"`;

        return 'data-toggle="tooltip" data-placement="top" title="Download item"';
    },

    active: function (name, isactive) {
        var activelabel = "Active";
        if (isactive) {
            activelabel = "Deactive";
        }

        ///if (name && name.length > 0)
        ///    return `data-toggle="tooltip" data-placement="top" title="${activelabel} ${name}"`;

        return `data-toggle="tooltip" data-placement="top" title="${activelabel} ${name}"`;
    },

    tooltips: function (name, action, additionName = "item") {
        if (name && name.length > 0)
            return `data-toggle="tooltip" data-placement="top" title="${action} ${name}"`;

        return `data-toggle="tooltip" data-placement="top" title="${action} ${additionName}"`;
    }
}

function updateCheckboxValue($form) {
    try {
        var checkboxs = $form.find('input[type="checkbox"]');
        if (!checkboxs || checkboxs.length === 0) return;
        for (var i = 0; i < checkboxs.length; i++) {
            var $checkbox = $(checkboxs[i]);
            if ($checkbox.val() && $checkbox.val() === "on") {
                $checkbox.val(true);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

function resetCheckboxValue($form) {
    try {
        var checkboxs = $form.find('input[type="checkbox"]');
        if (!checkboxs || checkboxs.length === 0) return;
        for (var i = 0; i < checkboxs.length; i++) {
            var $checkbox = $(checkboxs[i]);
            $checkbox.attr('checked', false);
            $checkbox.closest('span').removeClass('checked');
        }
    } catch (err) {
        console.log(err);
    }
}

function formatPhoneNumber(phoneNumer) {
    return phoneNumer;
}

function resetFormValidator(formId) {
    $('#' + formId).removeData('validator');
    $('#' + formId).removeData('unobtrusiveValidation');
    $.validator.unobtrusive.parse('#' + formId);
}
function initUserSetting(tableId, tableType, components) {
    $(`#${tableId}`).on('init.dt', function () {
        var userSettingByType = (userSettings || []).filter(function(item) {
            return item.table == tableType;
        });

        for (let j = 0; j < components.length; j++) {
            var component = components[j];

            var userSetting = (userSettingByType || []).find(function(item) {
                return item.type == component.type;
            });

            if (userSetting) {
                if (component.id === "") {
                    $(`select[name='${tableId}_length']`).val(userSetting.value);
                    $(`#${tableId}`).dataTable().api().page.len(userSetting.value);
                } else {
                    if (userSetting.value !== "null") {
                        $(`#${component.id}`).val(userSetting.value);
                    }
                }
            }

            if (component.id === "") {
                initTableLenghtSetting(tableId, tableType, component.type);
            } else {
                initCustomSetting(tableId, component.id, tableType, component.type);
            }
        }

        setTimeout(function() {
            reloadDatatable($(`#${tableId}`).dataTable());
        }, 0);
    });
}
function initTableLenghtSetting(tableId, tableType, userSettingType) {
    $(`#${tableId}`).on('length.dt', function () {
        $.post(`${apiUrl.userSetting.updateValue}?table=${tableType}&type=${userSettingType}&value=${$(`select[name='${tableId}_length']`).val()}`);
    });
}
function initCustomSetting(tableId, elementId, tableType, userSettingType) {
    $(`#${elementId}`).on('change',
        function () {
            if ($(`#${elementId}`).val() !== null && $(`#${elementId}`).val() !== "") {
                $.post(
                    `${apiUrl.userSetting.updateValue}?table=${tableType}&type=${userSettingType}&value=${$(
                        `#${elementId}`).val()}`);
            } else {
                $.post(
                    `${apiUrl.userSetting.updateValue}?table=${tableType}&type=${userSettingType}&value=null`);
            }
        });
}

function clearSummaryValidation($form) {
    $form.find("[data-valmsg-summary=true]")
        .removeClass("validation-summary-errors")
        .addClass("validation-summary-valid")
        .find("ul").empty();
}

function removeSelect($form) {
    $form.find("select").trigger("change");
    $form.find(".select2-selection__rendered").html('<span class="select2-selection__placeholder">Select an option</span>');
}

function redirectToUrl(url) {
    window.location.href = url;
}