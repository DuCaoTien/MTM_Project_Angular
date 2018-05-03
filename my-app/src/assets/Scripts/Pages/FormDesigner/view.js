var fixedSize = 1;
var PageData = [];
var PageEditedData = [];
var TotalColum = 0;
var TotalRow = 0;
var IsPortrait = false;
var PageIndex = 0;
var IsInitSignature = false;

function proceedFormData(urlUploadSignature, urlSubmitData, shiftId, formId, shiftFormId) {
    var signatures = getItemByType('signature');
    var array = [];
    if (signatures.length > 0) {
        for (var i = 0; i < signatures.length; i++) {
            if (signatures[i].value != null && signatures[i].value.indexOf('data:image/png') >= 0) {
                array.push(signatures[i].id + '|||' + signatures[i].value);
            }
        }
        if (array.length > 0) {
            uploadSignature(urlUploadSignature, urlSubmitData, shiftId, formId, shiftFormId, array);
        } else {
            submitFormData(urlSubmitData, shiftFormId);
        }
    } else {
        submitFormData(urlSubmitData, shiftFormId);
    }
}

function submitFormData(urlSubmitData, shiftFormId) {
    var currentPageIndex = $('#form-designer-pages li.active a').data('index');
    var currentPage = PageEditedData[currentPageIndex];
    if (currentPage == null) {
        currentPage = {
            pageIndex: currentPageIndex,
            pageData: []
        };
    }
    currentPage.pageData = getFormElements();
    PageEditedData[currentPageIndex] = currentPage;

    var formData = {
        ShiftFormId: shiftFormId,
        EditedData: PageEditedData
    };
    $.ajax({
        type: "POST",
        url: urlSubmitData,
        data: JSON.stringify(formData),
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            showAjaxSuccessMessage(response);
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
        complete: function () {
            hideAjaxLoadingMask();
        }
    });
}

function uploadSignature(urlUploadSignature, urlSubmitData, shiftId, formId, shiftFormId, array) {
    var formData = {
        signatures: array,
    };
    $.ajax({
        type: "POST",
        url: urlUploadSignature + "?shiftId=" + shiftId + "&formId=" + formId,
        data: JSON.stringify(formData),
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            var signatures = response.signatures;
            // update signature images
            for (var i = 0; i < signatures.length; i++) {
                var id = signatures[i].id;
                var value = signatures[i].fileName;
                updateEditedItemValue(id, value);
                $('#' + id).data('val', value).attr('src', '');
            }
            setTimeout(function () {
                $('img.edited-item').each(function() {
                    $(this).attr('src', SignatureFolderPath + $(this).data('val'));
                });
            }, 300);

            submitFormData(urlSubmitData, shiftFormId);
        },
        error: function (response) {
            if (typeof (response.responseJSON) !== 'undefined') {
                showAjaxFailureMessage(response.responseJSON);
            }
            else {
                var text = response.statusText == "OK" ? "Application Error" : response.statusText;
                    showAjaxFailureMessage(text);
            }
            hideAjaxLoadingMask();
        },
        beforeSend: function () {
            showAjaxLoadingMask();
        },
    });
}

function getItemByType(type) {
    var array = [];

    if (PageEditedData == null || PageEditedData.length == 0)
        return array;

    var ids = [];

    for (var i = 0; i < PageData.length; i++) {
        if (PageData[i].pageData != null && PageData[i].pageData.length > 0) {
            for (var j = 0; j < PageData[i].pageData.length; j++) {
                if (PageData[i].pageData[j].type == type) {
                    ids.push(PageData[i].pageData[j].id);
                }
            }
        }
    }
    
    for (var i = 0; i < PageEditedData.length; i++) {
        if (PageEditedData[i].pageData != null && PageEditedData[i].pageData.length > 0) {
            for (var j = 0; j < PageEditedData[i].pageData.length; j++) {
                for (var z = 0; z < ids.length; z++) {
                    if (PageEditedData[i].pageData[j].id == ids[z]) {
                        array.push(PageEditedData[i].pageData[j]);
                    }
                }
            }
        }
    }

    return array;
}

function getItemValue(id, pageIndex) {
    if (PageEditedData == null || PageEditedData.length == 0 || !PageEditedData[pageIndex])
        return "";
    for (var i = 0; i < PageEditedData.length; i++) {
        if (PageEditedData[i].pageIndex == pageIndex && PageEditedData[i].pageData != null && PageEditedData[i].pageData.length > 0) {
            for (var j = 0; j < PageEditedData[i].pageData.length; j++) {
                if (PageEditedData[i].pageData[j].id == id) {
                    var value = PageEditedData[i].pageData[j].value;
                    return value == null ? "" : value;
                }
            }
        }
    }

    return "";
}

function updateEditedItemValue(id, value) {
    if (PageEditedData != null && PageEditedData.length > 0) {
        for (var i = 0; i < PageEditedData.length; i++) {
            if (PageEditedData[i].pageData != null && PageEditedData[i].pageData.length > 0) {
                for (var j = 0; j < PageEditedData[i].pageData.length; j++) {
                    if (PageEditedData[i].pageData[j].id == id) {
                        PageEditedData[i].pageData[j].value = value;
                    }
                }
            }
        }
    }
}

function renderPDFAndData(templateId, editedDataId, isPortrait) {
    var templateData = $(templateId).val();
    PageData = JSON.parse(templateData);

    var editedData = $(editedDataId).val();
    PageEditedData = JSON.parse(editedData);

    IsPortrait = isPortrait;

    $('#form-designer-pages').html('');

    PageData.forEach(function (item, index) {
        $('#form-designer-pages').append(`<li><a data-index='${index}' href='javascript:void(0)' onclick='renderPage(this, ${item.pageIndex}, false);'>${item.pageIndex + 1}</a></li>`);
    });

    $('#form-designer').addClass(IsPortrait ? 'portrait' : 'landscape');
    $('#orientation').removeClass('col-md-8').addClass(IsPortrait ? 'col-md-8' : 'col-md-12');

    registerFormDesigner(fixedSize);

    renderPage($('#form-designer-pages a[data-index=0]')[0], 0, true);
}

function registerFormDesigner(fixedSize) {
    TotalColum = Math.round($('#grid-stack').width() / fixedSize);
    TotalRow = Math.round($('#grid-stack').height() / fixedSize);
    var options = {
        width: TotalColum,
        float: true,
        scroll: false,
        removeTimeout: 100,
        acceptWidgets: '.grid-stack-item',
        cell_height: fixedSize,
        vertical_margin: 0,
    };

    $('#grid-stack').gridstack(_.defaults({
        float: true
    }, options));

    // default node
    var grid = $('#grid-stack').data('gridstack');
    grid.addWidget($('<div style="display:none"><div class="grid-stack-item-content default-grid-stack-item"></div>'), TotalColum, TotalRow, 1, 1);
}

function editSignature(itemId) {
    var $parent = $(`#${itemId}`).closest('.grid-stack-item');
    var zoom = 5;
    var modalDefaultWidth = 565;
    var width = $parent.width() * zoom;
    var height = $parent.height() * zoom;

    if (width > modalDefaultWidth) {
        height = height * modalDefaultWidth / width;
        width = modalDefaultWidth;
    }

    if (!IsInitSignature) {
        IsInitSignature = true;
    } else {
        $('#signature').signature('destroy');
    }

    $('#signature').width(width).height(height);

    $('#signature').signature({ color: '#000', thickness: 4 });

    $('#signature').signature('clear');
    $('#editSignatureModal').modal('show');
    $('#control-signature-id').val(itemId);
}

function saveSignature() {
    var id = $('#control-signature-id').val();
    var canvas = $('#signature').find('canvas')[0];
    var based64 = canvas.toDataURL();
    $(`#${id}`).attr('src', based64);
    $('#' + id).data('val', based64);

    var isUpdated = false;
    for (var i = 0; i < PageEditedData.length; i++) {
        if (PageEditedData[i].pageIndex == PageIndex) {
            if (PageEditedData[i].pageData == null)
                PageEditedData[i].pageData = [];

            if (PageEditedData[i].pageData.length > 0) {
                for (var j = 0; j < PageEditedData[i].pageData.length; j++) {
                    if (PageEditedData[i].pageData[j].id == id) {
                        PageEditedData[i].pageData[j].value = based64;
                        isUpdated = true;
                    }
                }
            }
            
            if (!isUpdated) {
                PageEditedData[i].pageData.push({
                    id: id,
                    value: based64
                });
                isUpdated = true; 
            }
        }
    }

    if (!isUpdated) {
        PageEditedData.push({
            pageIndex: PageIndex,
            pageData: [
                {
                    id: id,
                    value: based64
                }
            ]
        });
    }

    $('#editSignatureModal').modal('hide');
}

function clearSignature() {
    $('#signature').signature('clear');
}

function renderPage(obj, pageIndex, isFirstLoad) {
    PageIndex = pageIndex;

    if (!isFirstLoad) {
        // save data of current page
        var currentPageIndex = $('#form-designer-pages li.active a').data('index');
        if (currentPageIndex != null) {
            var currentPage = PageEditedData[currentPageIndex];
            if (currentPage == null) {
                currentPage = {
                    pageIndex: currentPageIndex,
                    pageData: []
                };
            }

            currentPage.pageData = getFormElements();
            PageEditedData[currentPageIndex] = currentPage;
        }
        if (currentPageIndex == null || currentPageIndex == pageIndex) {
            return;
        }
    }

    setTimeout(function () {
        showAjaxLoadingMask();
    }, 0);

    // clear workspace
    var grid = $('#grid-stack').data('gridstack');
    grid.removeAll();
    grid.addWidget($('<div style="display: none"><div class="grid-stack-item-content default-grid-stack-item"></div>'), TotalColum, TotalRow, 1, 1);

    var page = PageData[pageIndex];
    if (page.pageData != null && page.pageData != '') {

        var template = '<div class="grid-stack-item {0}" data-type="{0}">' +
                        '<div class="grid-stack-item-content">' +
                            '<div class="preview preview-{0}"></div>' +
                        '</div>' +
                    '</div>';

        // load page data
        page.pageData.forEach(function (item, index) {
            var editedValue = getItemValue(item.id, pageIndex);

            var control = template;
            control = control.replace("{0}", item.type).replace("{0}", item.type).replace("{0}", item.type);
            control = $(control);
            if (item.size == null || item.size == '') {
                item.size = 14;
            }

            // render control by type
            switch (item.type) {
                case 'text':
                    {
                        control.find('.preview').html(item.value);
                        break;
                    }
                case 'textbox':
                    {
                        control.find('.preview').html(`<input id="${item.id}" style="font-size: ${item.size}px" type="text" class="textbox edited-item" value="${editedValue}" />`);
                        break;
                    }
                case 'textarea':
                    {
                        control.find('.preview').html(`<textarea class="edited-item" style="font-size: ${item.size}px" id="${item.id}">${editedValue}</textarea>`);
                        break;
                    }
                case 'date-picker':
                    {
                        control.find('.preview').html(`<input id="${item.id}" type="text" style="font-size: ${item.size}px" class="date-picker edited-item" value="${editedValue}" />`);
                        break;
                    }
                case 'time-picker':
                    {
                        control.find('.preview').html(`<input id="${item.id}" type="text" style="font-size: ${item.size}px" class="time-picker edited-item" value="${editedValue}" />`);
                        break;
                    }
                case 'dropdown':
                    {
                        var value = [];
                        if (item.value != null && item.value != "") {
                            value = item.value.split(',');
                        }
                        var $select = $(`<select id="${item.id}" class="edited-item" style="font-size: ${item.size}px"/>`);
                        $select.append('<option value=""></option>');
                        for (var i = 0; i < value.length; i++) {
                            if (editedValue == value[i]) {
                                $select.append(`<option selected value="${value[i]}">${value[i]}</option>`);
                            } else {
                                $select.append(`<option value="${value[i]}">${value[i]}</option>`);
                            }
                        }
                        control.find('.preview').append($select);
                        break;
                    }
                case 'tickbox':
                    {
                        control.find('.preview').html(`<input id="${item.id}" class="edited-item" type="checkbox" ${(editedValue == 'True' || editedValue == 'true' || editedValue == true ? "checked" : "")} />`);
                        break;
                    }
                case 'image':
                    {
                        if (item.value == "" || item.value == null) {
                            item.value = "/Resource/default.png";
                        }
                        control.find('.preview').html(`<img id="${item.id}" class="fullsize" src="${item.value}"/>`);
                        break;
                    }
                case 'signature':
                    {
                        var signature = "";
                        if (editedValue != null && editedValue != "") {
                            if (editedValue.indexOf('data:image/png') >= 0) {
                                signature = editedValue;
                            } else {
                                signature = SignatureFolderPath + editedValue;
                            }
                        }
                        control.find('.preview').html(`<img id="${item.id}" data-val="${editedValue}" onclick="editSignature(${item.id})" class="edited-item fullsize signature" src="${signature}"/>`);
                        break;
                    }
                case 'v-line': case 'h-line':
                    {
                        var color = item.value.split(',')[0];
                        var size = item.value.split(',')[1];
                        control.find('.preview').css('borderWidth', size + 'px').css('borderColor', color);
                        break;
                    }
                default:
                    {
                        if (editedValue != null && editedValue != "") {
                            var $hidden = $('<input class="edited-item" type="hidden" id="' + item.id + '" value="' + editedValue + '"></input>');
                            control.append($hidden);
                            control.find('.preview').html(editedValue);
                            if (item.size != '') {
                                control.find('.preview').css('fontSize', item.size + 'px');
                            }
                        }
                    }
            }
            grid.addWidget(control, item.x, item.y, item.width, item.height, null, null, null, null, null, item.id);
        });
    }
    // set background image
    $('#grid-stack').css('background-image', 'url("' + page.imagePath + '")').css('background-size', 'cover');
    $('#form-designer-pages li').removeClass('active');
    $(obj).closest('li').addClass('active');

    $('.ui-draggable').draggable('disable').resizable('disable');

    $('.date-picker').datepicker({
        rtl: App.isRTL(),
        orientation: "bottom",
        autoclose: true,
        format: constant.datePickerFormat
    });

    $('.time-picker').timepicker({
        showMeridian: false,
        orientation: "bottom",
        autoclose: true,
        minuteStep: 10,
        defaultTime: null,
        onSelect: function (timeText, inst) {
            $(this).attr('value', timeText);
        }
    }).on('changeTime.timepicker', function (e) {
        $(this).find('input').val(e.time.value);
    });

    $('input').iCheck({
        labelHover: false,
        cursor: true
    });

    setTimeout(function () {
        hideAjaxLoadingMask();
    }, 200);
}

function getFormElements() {
    return _.map($('.edited-item'), function (el) {
        el = $(el);
        var value = el.val();
        if (value == null)
            value = "";
        return {
            id: el.attr('id'),
            value: el.attr('type') == 'checkbox' ? el[0].checked : (el[0].tagName == 'IMG' ? el.data('val') : value),
        };
    });
}