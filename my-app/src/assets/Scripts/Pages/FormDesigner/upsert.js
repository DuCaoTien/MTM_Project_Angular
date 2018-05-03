var fixedSize = 1;
var PageData = [];
var NumberOptions = 0;
var TotalColum = 0;
var TotalRow = 0;
var FolderPath = '';
var IsPortrait = false;
var TotalPage = 0;
var PageTemplate = '<li class="{0}"><a data-index="{1}" href="javascript:void(0)" onclick="renderPage(this, {1});">{2}</a><span onclick="deletePage(this)" title="Delete page" class="delete-page">X</span></li>';
var isChangeImage = false;

$(function () {
    registerDraggableWidgetList();
    registerEditor();
    registerColorPicker();
    registerChangeBackgroundEvent();

    console.log("upsert");
});

function registerChangeBackgroundEvent() {
    $('#BackgroundUpload').change(function () {
        var currentPageIndex = $('#form-designer-pages li.active a').data('index');
        // upload to server
        ajaxUploadFile(BackgroundUploadUrl + "?folderPath=" + FolderPath + "&page=" + currentPageIndex,
            "BackgroundUpload",
            function (response) {
                console.log("PDF Upload", response);
                $('#BackgroundUpload').val('');
                // Response: pages uploaded
                if (response == undefined || response == null || response.pages.length <= 0){
                    return;
                }

                var currentPageIndex = $('#form-designer-pages li.active a').data('index');
                if (currentPageIndex != null) {
                    var currentPage = PageData[currentPageIndex];
                    currentPage.pageData = getFormElements();
                }
                
                isChangeImage = true;
                FolderPath = response.folderPath;

                var pageLen = response.pages.length;

                if (PageData.length < pageLen){
                    // if pages uploaded more than current, add empty pages with background
                    for(var i = PageData.length; i < response.pages.length; i ++){
                        var newPage = addPage();
                    }
                    
                } else if (PageData.length > pageLen){
                    // if pages uploaded more than current, remove pages out of range
                    var totalPage = PageData.length;
                    for(var i = pageLen; i < totalPage; i++){
                        deletePageData(pageLen);
                    }

                    //deletePages(rangePages);
                }

                for(var i = 0; i < PageData.length; i ++){
                    PageData[i].imagePath = response.pages[i].imagePath;
                }

                prerenderPages(0);
            });
    });
}

function addPage() {
    TotalPage++;

    var template = PageTemplate;
    template = template.replace('{0}', '').replace('{1}', TotalPage - 1).replace('{1}', TotalPage - 1).replace('{2}', TotalPage);
    $('#form-designer-pages li.new-page').before(template);

    var newPage = {
        formId: -1,
        imagePath: '',
        pageData: [],
        pageIndex: TotalPage - 1
    };

    PageData.push(newPage);

    return newPage;
}

function prerenderPages(currentPageIndex){
    $('#form-designer-pages li:not(.new-page)').remove();
     // reset template page
    for (var i = 0; i < TotalPage; i++) {
        var template = PageTemplate;
        template = template.replace('{0}', '').replace('{1}', i).replace('{1}', i).replace('{2}', i + 1);
        $('#form-designer-pages li.new-page').before(template);
    }

    setTimeout(function() {
        $(`#form-designer-pages li:nth-child(${(currentPageIndex + 1)})`).addClass('active');
        renderPage($('#form-designer-pages li.active a')[0], 0, true);
    }, 300);
}

function deletePages(deletePageIndexs){
     if(deletePageIndexs == null) return;

     for(var i=0; i<deletePageIndexs.length; i++){
        deletePageData(deletePageIndexs[i]);
     }

     $('#form-designer-pages li:not(.new-page)').remove();
     // reset template page
    for (var i = 0; i < TotalPage; i++) {
        var template = PageTemplate;
        template = template.replace('{0}', '').replace('{1}', i).replace('{1}', i).replace('{2}', i + 1);
        $('#form-designer-pages li.new-page').before(template);
    }

    setTimeout(function() {
        $(`#form-designer-pages li:nth-child(${(currentPageIndex + 1)})`).addClass('active');
        renderPage($('#form-designer-pages li.active a')[0], 0, true);
    }, 300);
}

function deletePageData(pageIndex){
    if(pageIndex == 0) return;

    TotalPage--;
    PageData.splice(pageIndex, 1);

    PageData.forEach(function (item, index) {
        item.pageIndex = index;
    });
}

function deleteSinglePage(deletePageIndex){
    var currentPageIndex = $('#form-designer-pages li.active a').data('index');
    if(deletePageIndex == 0) return;

    if (currentPageIndex != deletePageIndex) {
        var currentPage = PageData[currentPageIndex];
        currentPage.pageData = getFormElements();
    } else {
        // clear workspace
        var grid = $('#grid-stack').data('gridstack');
        grid.removeAll();
        grid.addWidget($('<div style="display: none"><div class="grid-stack-item-content default-grid-stack-item"></div>'), TotalColum, TotalRow, 1, 1);
        currentPageIndex = 0;
    }

    TotalPage--;
    PageData.splice(deletePageIndex, 1);

    PageData.forEach(function (item, index) {
        item.pageIndex = index;
    });

    if (currentPageIndex == null) {
        currentPageIndex = 0;
    }

    $('#form-designer-pages li:not(.new-page)').remove();

    // reset template page
    for (var i = 0; i < TotalPage; i++) {
        var template = PageTemplate;
        template = template.replace('{0}', '').replace('{1}', i).replace('{1}', i).replace('{2}', i + 1);
        $('#form-designer-pages li.new-page').before(template);
    }

    setTimeout(function() {
        $(`#form-designer-pages li:nth-child(${(currentPageIndex + 1)})`).addClass('active');
        renderPage($('#form-designer-pages li.active a')[0], 0, true);
    }, 300);
}

function deletePage(obj) {
    var $li = $(obj).closest('li');
    var deletePageIndex = $li.find('a').data('index');
    
    deleteSinglePage(deletePageIndex);
}

function confirmMode() {
    $('#uploadPDFModal').modal('hide');

    swal({
        title: "Page Orientation",
        text: "Please select the orientation of your Interactive Document!",
        type: "info",
        showCancelButton: true,
        confirmButtonClass: "btn-info",
        cancelButtonClass: "btn-danger",
        confirmButtonText: "Portrait",
        cancelButtonText: "Landspace",
        closeOnConfirm: true,
        closeOnCancel: true
    }, function (isConfirm) {
        IsPortrait = isConfirm;

        switchOrientation();

        $('head').append('<link rel="stylesheet" href="' + (IsPortrait ? PortraitCSSLink : LandScapeCSSLink) + '" type="text/css" />');

        registerFormDesigner(fixedSize);
        renderDefaultPage();
    });
}

function switchOrientation() {
    $('#form-designer').removeClass('portrait');
    $('#form-designer').addClass(IsPortrait ? 'portrait' : 'landscape');
    $('#orientation').removeClass('col-md-8').addClass(IsPortrait ? 'col-md-8' : 'col-md-12');
    $('#leftToolbox').removeClass('col-md-2').addClass(IsPortrait ? 'col-md-2' : 'col-md-12');
    $('#rightToolbox').removeClass('col-md-2').addClass(IsPortrait ? 'col-md-2' : 'hidden');

    if (IsPortrait) {
        registerDraggablePredefineListPortrait();
    } else {
        registerDraggablePredefineListLandscape();
    }
}

function renderDefaultPage() {
    var template = PageTemplate;
    template = template.replace('{0}', 'active').replace('{1}', 0).replace('{1}', 0).replace('{2}', 1);
    $('#form-designer-pages li.new-page').before(template);

    TotalPage = 1;
    PageData.push({
        formId: -1,
        imagePath: '',
        pageData: [],
        pageIndex: TotalPage - 1
    });
}

function renderPDFAndData(id, folderPath, isPortrait) {
    var hiddenData = $(id).val();
    PageData = JSON.parse(hiddenData);
    FolderPath = $(folderPath).val();
    IsPortrait = isPortrait;

    PageData.forEach(function (item, index) {
        var template = PageTemplate;
        template = template.replace('{0}', '').replace('{1}', index).replace('{1}', item.pageIndex).replace('{2}', item.pageIndex + 1);
        $('#form-designer-pages li.new-page').before(template);
    });

    TotalPage = PageData.length;

    switchOrientation();

    registerFormDesigner(fixedSize);

    renderPage($('#form-designer-pages a[data-index=0]')[0], 0, true);
}

function renderPage(obj, pageIndex, isFirstLoad) {
    pageIndex = $(obj).data('index');
    if (!isFirstLoad) {
        // save data of current page
        var currentPageIndex = $('#form-designer-pages li.active a').data('index');
        if (currentPageIndex != null) {
            var currentPage = PageData[currentPageIndex];
            currentPage.pageData = getFormElements();
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
        // load page data
        page.pageData.forEach(function (item, index) {
            var template = $(`#form-designer .widget-list .grid-stack-item.${item.type}`)[0].outerHTML;
            var control = $(template);
            control.data('value', item.value);
            control.data('size', item.size);
            if (item.size == null || item.size == '') {
                item.size = 14;
            }

            switch (item.type) {
                case 'text':
                {
                    control.find('.preview').html(item.value);
                    break;
                }
                case 'image':
                {
                    if (item.value == "" || item.value == null) {
                        item.value = "/Resource/default.png";
                    }
                    control.find('.preview img').attr('src', item.value);
                    break;
                }
                case 'textbox': 
                case 'textarea':
                case 'date-picker':
                case 'time-picker':
                case 'tickbox':
                case 'signature':
                {
                    control.find('.preview').css('fontSize', item.size + 'px');
                    break;
                }
                case 'dropdown':
                {
                    control.find('.grid-stack-item').data('value', item.value);
                    var value = [];
                    if (item.value != null && item.value != "") {
                        value = item.value.split(',');
                    }
                    control.find('.preview').html(value.length > 1 ? value.length + " options" : value.length + " option");
                    control.find('.preview').css('fontSize', item.size + 'px');
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
                    control.find('.preview').html("$" + item.type);
                    control.find('.preview').css('fontSize', item.size + 'px');
                    break;
                }
            }
            grid.addWidget(control, item.x, item.y, item.width, item.height, null, null, null, null, null, item.id);
        });
    }
    // set background image
    $('#grid-stack').css('background-image', 'url("' + page.imagePath + '")').css({ 'background-size': '100%', 'background-repeat': 'no-repeat' });
    $('#form-designer-pages li').removeClass('active');
    $(obj).closest('li').addClass('active');

    setTimeout(function() {
        hideAjaxLoadingMask();
    }, 200);
}

function uploadPDF(url) {
    ajaxUploadFile(url, "PDFFileUpload", function (response) {
        FolderPath = response.folderPath;
        IsPortrait = response.isPortarit;
        PageData = response.pages;
        var message = response.message;
        showAjaxSuccessMessage(message);
        
        $('#Name').addClass('edited').val(response.originalFileName);

        PageData.forEach(function (item, index) {
            var template = PageTemplate;
            template = template.replace('{0}', '').replace('{1}', index).replace('{1}', item.pageIndex).replace('{2}', item.pageIndex + 1);
            $('#form-designer-pages li.new-page').before(template);
        });

        switchOrientation();

        $('head').append('<link rel="stylesheet" href="' + (IsPortrait ? PortraitCSSLink : LandScapeCSSLink) + '" type="text/css" />');

        registerFormDesigner(fixedSize);

        renderPage($('#form-designer-pages a[data-index=0]')[0], 0, true);

        $('#uploadPDFModal').modal('hide');

        TotalPage = PageData.length;
    });
}

function registerFormDesigner(fixedSize) {
    TotalColum = Math.round($('#grid-stack').width() / fixedSize);
    TotalRow = Math.round($('#grid-stack').height() / fixedSize);
    var options = {
        width: TotalColum,
        float: true,
        scroll: true,
        removeTimeout: 100,
        acceptWidgets: '.grid-stack-item',
        cell_height: fixedSize,
        vertical_margin: 0,
        alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        resizable: {
            handles: 'se, sw'
        }
    };

    $('#grid-stack').gridstack(_.defaults({
        float: true,
    }, options));

    // default node
    var grid = $('#grid-stack').data('gridstack');
    grid.addWidget($('<div style="display:none"><div class="grid-stack-item-content default-grid-stack-item"></div>'), TotalColum, TotalRow, 1, 1);
}

function registerColorPicker() {
    $('.colorpicker-default').colorpicker({
        format: 'hex'
    });
}

function registerEditor() {
    tinymce.init({
        selector: "textarea#control-text-content",
        theme: "modern",
        menubar: false,
        plugins: [
             "wordcount",
             "textcolor"
        ],
        height: 300,
        toolbar: "undo redo | styleselect | bold italic underline strikethrough | forecolor backcolor | removeformat",
        style_formats: [
            { title: '10px', inline: 'span', styles: { fontSize: '10px' }, classes: 's-10px' },
            { title: '12px', inline: 'span', styles: { fontSize: '12px' }, classes: 's-12px' },
            { title: '14px', inline: 'span', styles: { fontSize: '14px' }, classes: 's-14px' },
            { title: '18px', inline: 'span', styles: { fontSize: '16px' }, classes: 's-18px' },
            { title: '24px', inline: 'span', styles: { fontSize: '24px' }, classes: 's-24px' },
            { title: '28px', inline: 'span', styles: { fontSize: '28px' }, classes: 's-28px' },
            { title: '36px', inline: 'span', styles: { fontSize: '36px' }, classes: 's-36px' },
            { title: '48px', inline: 'span', styles: { fontSize: '48px' }, classes: 's-48px' },
            { title: '72px', inline: 'span', styles: { fontSize: '72px' }, classes: 's-72px' },
        ]
    });
}

function createGridLine(fixedSize) { 
    var ratioW = Math.floor($('#grid-stack').width() / fixedSize);
    var ratioH = Math.floor($('#grid-stack').height() / fixedSize) + 1;
    var parent = $('#grid-stack');

    for (var i = 0; i < ratioH; i++) {
        for (var p = 0; p < ratioW; p++) {
            $('<div />', {
                'class': 'grid-line',
                width: fixedSize ,
                height: fixedSize,
            }).appendTo(parent);
        }
    }
}

function registerDraggableWidgetList() {
    $('#widget-list .grid-stack-item').draggable({
        revert: 'invalid',
        handle: '.toolbar',
        appendTo: 'body',
        helper: "clone",
        stop: function (event, ui) {
            var index = $(this).data('index');
            if (index == 1) {
                $("#widget-list .widget-list").prepend(this);
            } else {
                $("#widget-list .widget-list > div:nth-child(" + (index - 1) + ")").after(this);
            }
            setTimeout(function () {
                registerDraggableWidgetList();
            }, 300);
        }
    });
}

function registerDraggablePredefineListLandscape() {
    $('#widget-list').addClass('col-md-6');
    $('#predefine-list-landscape').removeClass('hidden').addClass('col-md-6');
    $('#predefine-list-landscape .grid-stack-item').draggable({
        revert: 'invalid',
        handle: '.toolbar',
        appendTo: 'body',
        helper: "clone",
        stop: function (event, ui) {
            var index = $(this).data('index');
            if (index == 1) {
                $("#predefine-list-landscape .widget-list").prepend(this);
            } else {
                $("#predefine-list-landscape .widget-list > div:nth-child(" + (index - 1) + ")").after(this);
            }
            setTimeout(function () {
                registerDraggablePredefineListLandscape();
            }, 300);
        }
    });

    var $window = $(window);
    var $scrollPosition = 0;
    var headerHeight = $('.page-top').innerHeight();
    var widgetHeight = $('#leftToolbox').innerHeight();
    var leftWidth = $('.page-sidebar-menu').innerWidth() + 5;
    var width = $('#orientation').width();
    $('#leftToolbox').width(width);
    
    $window.scroll(function () {
        $scrollPosition = $window.scrollTop();
        if ($scrollPosition > 90) { // if body is scrolled down by 90 pixels
            $('#leftToolbox').css('top', headerHeight + 'px').css('left', leftWidth + 'px').addClass('sticky');
            //$('body').css('padding-top', (widgetHeight - $scrollPosition + 20) + 'px');
            $("#form-designer").css('padding-top', (widgetHeight) + 'px');
        } else {
            $('#leftToolbox').css('top', '0').css('left', '0').removeClass('sticky');
            $("#form-designer").css('padding-top', '0px');
        }
    });
}

function registerDraggablePredefineListPortrait() {
    $('#predefine-list-portrait .grid-stack-item').draggable({
        revert: 'invalid',
        handle: '.toolbar',
        appendTo: 'body',
        helper: "clone",
        stop: function (event, ui) {
            var index = $(this).data('index');
            if (index == 1) {
                $("#predefine-list-portrait .widget-list").prepend(this);
            } else {
                $("#predefine-list-portrait .widget-list > div:nth-child(" + (index - 1) + ")").after(this);
            }
            setTimeout(function () {
                registerDraggablePredefineListPortrait();
            }, 300);
        }
    });

    var $window = $(window);
    var $scrollPosition = 0;
    var headerHeight = $('.page-top').innerHeight();

    $('#leftToolbox .form-widget').css('top', '150px').addClass('position-fixed');
    $('#rightToolbox .form-widget').css('top', '150px').addClass('position-fixed');

    $window.scroll(function () {
        $scrollPosition = $window.scrollTop();
        
        if ($scrollPosition > 90) { // if body is scrolled down by 90 pixels
            $('#leftToolbox .form-widget').css('top', headerHeight + 'px').addClass('position-fixed');
            $('#rightToolbox .form-widget').css('top', headerHeight + 'px').addClass('position-fixed');
        } else {
            $('#leftToolbox .form-widget').css('top', '150px').addClass('position-fixed');
            $('#rightToolbox .form-widget').css('top', '150px').addClass('position-fixed');
        }
    });
}

function deleteControl(obj) {
    var parent = $(obj).parents('.grid-stack-item');
    $(parent).fadeOut();
}

function editText(obj) {
    var stackItem = $(obj).parents('.grid-stack-item');
    var text = stackItem.find('.preview').html();
    tinymce.get('control-text-content').setContent(text);
    $('#control-text-content').val(text);
    $('#control-text-id').val(stackItem.data('id'));
    $('#editTextModal').modal();
}

function saveText(obj) {
    var text = tinymce.get('control-text-content').getContent();
    var controlId = $('#control-text-id').val();
    var control = $('.grid-stack-item[data-id="' + controlId + '"]');
    control.find('.preview').html(text);
    control.data('value', text);
    tinymce.get('control-text-content').setContent('');
    $('#editTextModal').modal('hide');
}

function addOption(obj) {
    var template = $('#dropdrop-list-option-template').html();
    var container = $('#control-dropdown-options');
    NumberOptions++;
    template = template.replace("{0}", NumberOptions);
    template = template.replace("{1}", "");
    container.append(template);
}

function deleteOption(obj) {
    $(obj).parents('.ddl-option').remove();
}

function editDropdown(obj) {
    var stackItem = $(obj).parents('.grid-stack-item');
    var options = stackItem.data('value');
    var size = stackItem.data('size');

    var template = $('#dropdrop-list-option-template').html();
    var container = $('#control-dropdown-options');
    container.html('');
    NumberOptions = 0;

    if (options == null || options == "") {
        template = template.replace("{0}", 1);
        template = template.replace("{1}", "");
        container.append(template);
        NumberOptions = 1;
    } else {
        options = options.split(',');
        $.each(options, function (index) {
            var temp = template;
            temp = temp.replace("{0}", index + 1);
            temp = temp.replace("{1}", this);
            container.append(temp);
            NumberOptions++;
        });
    }

    if (size == null || size == '') {
        size = 14;
    }

    $('#control-dropdown-size').val(size);
    $('#control-dropdown-id').val(stackItem.data('id'));
    $('#editDropdownModal').modal();
}

function saveDropdown(obj) {
    var controlId = $('#control-dropdown-id').val();
    var control = $('.grid-stack-item[data-id="' + controlId + '"]');
    control.find('.preview select').html('');
    var size = $('#control-dropdown-size').val();
    var values = '';

    var count = 0;
    $('#control-dropdown-options input[type=text]').each(function () {
        var value = this.value;
        if (value != null && $.trim(value) != "") {
            value = $.trim(value);
            values += value + ',';
            count++;
        }
    });

    if (count > 0) {
        values = values.substr(0, values.length - 1);
    }

    control.find('.preview').html(count + ' ' + (count > 1 ? 'options' : 'option'));
    control.find('.preview').css('fontSize', size + 'px');

    control.data('value', values);
    control.data('size', size);
    console.log(size);
    $('#editDropdownModal').modal('hide');
}

function editImage(obj) {
    var stackItem = $(obj).parents('.grid-stack-item');
    var src = stackItem.find('.preview img').attr('src');
    $('#editImageModal').find('img').attr('src', src);
    $('#control-image-id').val(stackItem.data('id'));
    $('#editImageModal').modal();
}

function saveImage(url, obj) {
    var src = $('#editImageModal .fileinput-preview').find('img').attr('src');
    if (src.indexOf('data:image') != -1) {
        // upload to server
        ajaxUploadFile(url + "?folderPath=" + FolderPath,
            "FileUpload",
            function(response) {
                $('#FileUpload').val('');

                var imagePath = response.imagePath;
                var message = response.message;
                FolderPath = response.folderPath;

                showAjaxSuccessMessage(message);

                var controlId = $('#control-image-id').val();
                var control = $('.grid-stack-item[data-id="' + controlId + '"]');

                control.find('.preview img').attr('src', imagePath);
                control.find('.preview img').css('visibility', 'visible');

                control.data('value', imagePath);
                $('#editImageModal').modal('hide');

                isChangeImage = true;
            });
    } else {
        $('#editImageModal').modal('hide');
    }
}

function editLine(obj) {
    var stackItem = $(obj).parents('.grid-stack-item');
    var colorCode = stackItem.find('.preview').css('borderBottomColor');
    var colorHex = colorCode;
    var size = stackItem.find('.preview').css('borderBottomWidth');
    if (size == '0px') {
        size = stackItem.find('.preview').css('borderRightWidth');
    }
    size = Math.round(parseFloat(size.replace('px', '')));

    if (colorCode.indexOf('rgb') != -1) {
        colorHex = rgb2hex(colorCode);
    }
    $('#control-line-colorcode').val(colorHex);
    $('#control-line-size').val(size);
    $('#control-line-colorpicker').css('background', colorCode);
    $('#control-line-id').val(stackItem.data('id'));
    $('#editLineModal').modal();
}

function saveLine(obj) {
    var colorCode = $('#control-line-colorcode').val();
    var size = $('#control-line-size').val();
    var controlId = $('#control-line-id').val();
    var control = $('.grid-stack-item[data-id="' + controlId + '"]');

    control.find('.preview')
        .css('borderBottomColor', colorCode).css('borderBottomWidth', size + 'px')
        .css('borderRightColor', colorCode).css('borderRightWidth', size + 'px');

    var lineDataObject = size + "," + colorCode;
    control.data('value', lineDataObject);
    control.data('size', size);
    $('#editLineModal').modal('hide');
}


function editPreDefineField(obj) {
    var stackItem = $(obj).parents('.grid-stack-item');
    var fontSize = stackItem.find('.preview').css('fontSize');
    if (fontSize == '' || typeof (fontSize) == 'undefined') {
        fontSize = '14px';
    }
    $('#control-PreDefineField-size').val(fontSize.replace('px', ''));
    $('#control-PreDefineField-id').val(stackItem.data('id'));
    $('#editPreDefineFieldModal').modal();
}

function savePreDefineField(obj) {
    var size = $('#control-PreDefineField-size').val();
    var controlId = $('#control-PreDefineField-id').val();
    var control = $('.grid-stack-item[data-id="' + controlId + '"]');

    control.find('.preview').css('fontSize', size + 'px');
    control.data('size', size);
    $('#editPreDefineFieldModal').modal('hide');
}

function getFormElements() {
    return _.map($('#grid-stack .grid-stack-item:visible'), function (el) {
        el = $(el);
        var node = el.data('_gridstack_node');
        var size = getElementSize(el);
        return {
            id: el.data('id'),
            type: el.data('type'),
            value: getElementValue(el),
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            size: size == null || size == "" ? "" : size
        };
    });
}

function getElementValue(el) {
    return el.data('value');
}

function getElementSize(el) {
    return el.data('size');
}

function cloneControl(obj) {
    var el = $(obj).parents('.grid-stack-item');
    var node = el.data('_gridstack_node');
    var grid = $('#grid-stack').data('gridstack');
    var size = el.data('size');
    if (size == '' || size == null) {
        size = 14;
    }
    var cloneWidget = $(`<div data-value="${el.data('value')}" data-size="${size}" data-type="${el.data('type')}" data-index=${el.data('index')}>${el.html()}</div>`)
    cloneWidget.find('.ui-resizable-handle').remove();
    grid.addWidget(cloneWidget, node.x + 50, node.y, node.width, node.height, false);
}

function saveFormDesigner(url, formId, replaceText, callback, args, isEdit) {
    var currentPageIndex = $('#form-designer-pages li.active a').data('index');
    var currentPage = PageData[currentPageIndex];
    currentPage.pageData = getFormElements();

    $('#Template').val(JSON.stringify(PageData));
    $('#FolderPath').val(FolderPath);
    $('#IsPortrait').val(IsPortrait);
    $('#IsBackgroundChange').val(isChangeImage);

    if (!isEdit) {
        var callBackFunc = function (response) {
            showAjaxSuccessMessage(response.message);
            setTimeout(function() {
                window.location.href = callback + "/" + response.id;
            }, 1500);
        };

        submitAjaxForm(url, formId, replaceText, callBackFunc, args, true);
    } else {
        submitAjaxForm(url, formId, replaceText, callback, args);
    }
}