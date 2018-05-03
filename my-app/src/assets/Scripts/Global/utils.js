function reloadDatatable(e) {
    if (e.api()) {
        e.api().ajax.reload(false, null);
    } else {
        e.ajax.reload(false, null);
    }
}

function getLocalFromUtc(utcTime) {
    if (utcTime == null) return "";
    var localTime = moment(utcTime).format(constant.dateTimeFormat);
    return localTime;
}

function getLocalFromUtcWithFormat(utcTime, format) {
    if (utcTime == null) return "";
    var localTime = moment(utcTime).format(format);
    return localTime;
}

function DecodeHtml(str) {
    return $('<div/>').html(str).text();
}

function openLink(link, isNewTab) {
    if (isNewTab && isNewTab === true) {
        var win = window.open(link, '_blank');
        win.focus();
    } else {
        window.open(link, "_self");
    }
}

function addListener_Keyboard_Enter(selectorsSource, elementDestination, action) {
    /// <summary>
    ///     Add listener when element source press enter make element destination fire a action
    /// </summary>
    /// <param name="selectorsSource" type="type">seperate "," multiple selector: ".class1,#element1"</param>
    /// <param name="elementDestination" type="type">destination selector</param>
    /// <param name="action" type="type">action: "click", "dbclick" and so on</param>

    var elements = selectorsSource.split(",");
    $.each(elements, function (index, element) {
        $(element).keydown(function (e) {
            if (e.which === 13) {
                $(elementDestination).trigger(action);
            }
        });
    });
}

String.prototype.preventInjection = function preventInjection() {
    return this.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

String.prototype.genSlug = function changeToSlug() {
    var title, slug;
    title = this;

    slug = title.toLowerCase();

    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');

    slug = slug.replace(/c#/gi, 'c-sharp');

    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');

    slug = slug.replace(/ /gi, "-");

    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');

    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');

    return slug;
}

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Array.prototype.contains = function (element) {
    return this.indexOf(element) > -1;
};

function renderSlugAuto($element, $slugElement) {
    $element.on('keyup', function () {
        $slugElement.val($element.val().genSlug());
    });
};

jQuery.fn.serializeObjectX = function () {
    var arrayData, objectData;
    arrayData = this.serializeArray();
    objectData = {};

    $.each(arrayData, function () {
        var value;

        if (this.value != null) {
            value = this.value;
        } else {
            value = '';
        }

        if (objectData[this.name] != null) {
            if (!objectData[this.name].push) {
                objectData[this.name] = [objectData[this.name]];
            }

            objectData[this.name].push(value);
        } else {
            objectData[this.name] = value;
        }
    });

    return objectData;
};


var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

function rgb2hex(orig) {
    var rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
    return (rgb && rgb.length === 4) ? "#" +
     ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
     ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
     ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : orig;
}

function getGeoAddress(streetAddress, city, state) {
    return (streetAddress ? streetAddress + ", " : "") + city + (state ? ", " + state : "");
}

var geoMap = {
    getMap: function (elementId) {
        return new GMaps({
            lat: 0,
            lng: 0,
            div: "#" + elementId
        });
    },
    loadMap: function (map, address) {
        try {
            if (!address || address.trim() === "") return;
            GMaps.geocode({
                address: address,
                callback: function (results, status) {
                    if (status === "OK") {
                        var latlng = results[0].geometry.location;
                        if (map.markers && map.markers.length > 0) {
                            map.removeMarkers();
                        }
                        map.addMarker({
                            lat: latlng.lat(),
                            lng: latlng.lng()
                        });
                        map.setCenter(latlng.lat(), latlng.lng());
                    } else {
                        toastr.error("Could not load map");
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
}

function getActiveTab() {
    var activeLi = $(".nav-tabs li.active");
    var aTag = !activeLi ? null : activeLi.find("a");
    return !aTag ? "" : aTag.attr("href");
}

function isPdf(extension) {
    return extension === "pdf";
};

function isImage(extension) {
    var extensions = (imageExtensions || []).map(function (imageExtension) {
        return imageExtension.toLowerCase();
    });
    return extensions && extensions.indexOf(extension) >= 0;
};

function DatatableUtil(cfgs) {
    const $this = this;
    $this.configs = {};
    if (cfgs) {
        $this.configs = cfgs;
    }

    $this.funcs = {
        initEvents: function (settings) {

            // datable header checkboxes on click
            $this.funcs.offBulkCheck();
            $this.funcs.onBulkCheck();

            // datatable checkboxes on click
            $this.configs.$datatable.off("click", "tbody tr .checkboxes");
            $this.configs.$datatable.on("click", "tbody tr .checkboxes", function () {
            var checkboxes = $(this);
            if (!checkboxes.hasClass("ignore")) {
                $(checkboxes).parents("span").toggleClass("checked");
                $.uniform.update(checkboxes);

                // bind selected array
                var id = $(checkboxes).data("id");
                if ($(checkboxes).parents("span").hasClass("checked")) {
                    $this.configs.selected.push(id);
                    var totalRecords = settings.fnRecordsTotal();
                    if ($this.configs.selected.length === totalRecords) {
                        $this.funcs.offBulkCheck();
                        $this.funcs.checkBulkCheck();
                        $this.funcs.onBulkCheck();
                    }
                } else {
                    $this.configs.selected.remove(id);
                    $this.funcs.offBulkCheck();
                    $this.funcs.unCheckBulkCheck();
                    $this.funcs.onBulkCheck();
                }
            }
        });

            $('[data-toggle="tooltip"]').tooltip();
        },

        getFilterColumnByName: function (data, columnName) {
            for (let i = 0; i < data.columns.length; i++) {
                if(data.columns[i].data === columnName) {
                    return data.columns[i];
                }
            }
            return null;
        },

        validateSelected: function (entity) {
            if ($this.configs.selected.length < 1) {
                toastr["error"](`Error - No ${entity} selected`);
                return false;
            }
            return true;
        },

        deSelectAll: function () {
            $this.configs.selected = [];
            $this.funcs.offBulkCheck();
            var groupCheck = $this.configs.$datatable.find(".group-checkable");
            if ($(groupCheck).parents("span").hasClass("checked")) {
                $(groupCheck).trigger("click");
            }
            $this.funcs.onBulkCheck();
            $this.configs.$datatable.find('tbody tr').each(function () {
                if ($(this).hasClass("active")) {
                    $(this).trigger("click");
                }
            });
        },
        onBulkCheck: function () {

            $this.configs.$datatable.find(".group-checkable").change(function () {
                var checkboxs = $(this).attr("data-set");
                var isCheckedAll = $(this).is(":checked");
                $this.configs.selected = [];
                $(checkboxs).each(function () {
                    if (isCheckedAll === true) {
                        if (!$(this).hasClass("ignore")) {
                            $(this).parents("tr").addClass("active");
                            $(this).parents("span").addClass("checked");

                            // bind selected array
                            var id = $(this).data("id");
                            $this.configs.selected.push(id);
                        }
                    } else {
                        $(this).parents("tr").removeClass("active");
                        $(this).parents("span").removeClass("checked");
                    }
                });
                $.uniform.update(checkboxs);
            });
        },
        offBulkCheck: function () {
            $this.configs.$datatable.find(".group-checkable").off("change");
        },
        checkBulkCheck: function () {
            if (!$(".group-checkable").parents("span").hasClass("checked")) {
                $(".group-checkable").trigger("click");
            }
        },
        unCheckBulkCheck: function () {
            if ($(".group-checkable").parents("span").hasClass("checked")) {
                $(".group-checkable").trigger("click");
            }
        }
    }
}

var datatableUtils = {
    configs: {},
    initEvents: function (settings, configs) {
        if (!configs) {
            configs = datatableUtils.configs;
        }

        // datable header checkboxes on click
        datatableUtils.offBulkCheck(configs);
        datatableUtils.onBulkCheck(configs);

        // datatable checkboxes on click
        configs.$datatable.off("click", "tbody tr .checkboxes");
        configs.$datatable.on("click", "tbody tr .checkboxes", function () {
            var checkboxes = $(this);
            if (!checkboxes.hasClass("ignore")) {
                $(checkboxes).parents("span").toggleClass("checked");
                $.uniform.update(checkboxes);

                // bind selected array
                var id = $(checkboxes).data("id");
                if ($(checkboxes).parents("span").hasClass("checked")) {
                    configs.selected.push(id);
                    var totalRecords = settings.fnRecordsTotal();
                    if (configs.selected.length === totalRecords) {
                        datatableUtils.offBulkCheck(configs);
                        datatableUtils.checkBulkCheck();
                        datatableUtils.onBulkCheck(configs);
                    }
                } else {
                    configs.selected.remove(id);
                    datatableUtils.offBulkCheck(configs);
                    datatableUtils.unCheckBulkCheck();
                    datatableUtils.onBulkCheck(configs);
                }
            }
        });

        $('[data-toggle="tooltip"]').tooltip();
    },

    getFilterColumnByName: function (data, columnName) {
        for (let i = 0; i < data.columns.length; i++) {
            if(data.columns[i].data === columnName) {
                return data.columns[i];
            }
        }
        return null;
    },

    validateSelected: function (entity, configs) {
        if (!configs) {
            configs = datatableUtils.configs;
        }
        if (configs.selected.length < 1) {
            toastr["error"](`Error - No ${entity} selected`);
            return false;
        }
        return true;
    },

    deSelectAll: function (configs) {
        if (!configs) {
            configs = datatableUtils.configs;
        }

        configs.selected = [];
        datatableUtils.offBulkCheck();
        var groupCheck = configs.$datatable.find(".group-checkable");
        if ($(groupCheck).parents("span").hasClass("checked")) {
            $(groupCheck).trigger("click");
        }
        datatableUtils.onBulkCheck();
        configs.$datatable.find('tbody tr').each(function () {
            if ($(this).hasClass("active")) {
                $(this).trigger("click");
            }
        });
    },
    onBulkCheck: function (configs) {
        if (!configs) {
            configs = datatableUtils.configs;
        }
        configs.$datatable.find(".group-checkable").change(function () {
            var checkboxs = $(this).attr("data-set");
            var isCheckedAll = $(this).is(":checked");
            configs.selected = [];
            $(checkboxs).each(function () {
                if (isCheckedAll === true) {
                    if (!$(this).hasClass("ignore")) {
                        $(this).parents("tr").addClass("active");
                        $(this).parents("span").addClass("checked");

                        // bind selected array
                        var id = $(this).data("id");
                        configs.selected.push(id);
                    }
                } else {
                    $(this).parents("tr").removeClass("active");
                    $(this).parents("span").removeClass("checked");
                }
            });
            $.uniform.update(checkboxs);
        });
    },
    offBulkCheck: function (configs) {
        if (!configs) {
            configs = datatableUtils.configs;
        }
        configs.$datatable.find(".group-checkable").off("change");
    },
    checkBulkCheck: function () {
        if (!$(".group-checkable").parents("span").hasClass("checked")) {
            $(".group-checkable").trigger("click");
        }
    },
    unCheckBulkCheck: function () {
        if ($(".group-checkable").parents("span").hasClass("checked")) {
            $(".group-checkable").trigger("click");
        }
    }
}

var contains = function (needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (needle) {
            var i = -1, index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if ((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

var PAGE_PERMISSION= {
    FULL_PERMISSION: 1,
    VIEW_ONLY: 2
};

function getDataTableUtils(configs) {
    return {
        configs: configs,
        initEvents: function (settings) {
            var onBulkCheck = this.onBulkCheck;
            var offBulkCheck = this.offBulkCheck;
            var checkBulkCheck = this.checkBulkCheck;
            var unCheckBulkCheck = this.unCheckBulkCheck;

            // datable header checkboxes on click
            offBulkCheck();
            onBulkCheck();

            // datatable tr on click
            configs.$datatable.off("click", "tbody tr");
            configs.$datatable.on("click", "tbody tr", function () {
                $(this).toggleClass("active");
                const checkboxes = $(this).find(".checkboxes");
                if (!checkboxes.hasClass("ignore")) {
                    $(checkboxes).parents("span").toggleClass("checked");
                    $.uniform.update(checkboxes);

                    // bind selected array
                    var id = $(checkboxes).data("id");
                    if ($(checkboxes).parents("span").hasClass("checked")) {
                        configs.selected.push(id);
                        var totalRecords = settings.fnRecordsTotal();
                        if (configs.selected.length === totalRecords) {
                            offBulkCheck();;
                            checkBulkCheck();;
                            onBulkCheck();
                        }
                    } else {
                        configs.selected.remove(id);
                        offBulkCheck();;
                        unCheckBulkCheck();;
                        onBulkCheck();
                    }
                }
            });

            $('[data-toggle="tooltip"]').tooltip();
        },

        getFilterColumnByName: function (data, columnName) {
            for (let i = 0; i < data.columns.length; i++) {
                if(data.columns[i].data === columnName) {
                    return data.columns[i];
                }
            }
            return null;
        },

        validateSelected: function (entity) {
            if (configs.selected.length < 1) {
                toastr["error"](`Error - No ${entity} selected`);
                return false;
            }
            return true;
        },

        deSelectAll: function () {
            configs.selected = [];
            this.offBulkCheck();
            var groupCheck = configs.$datatable.find(".group-checkable");
            if ($(groupCheck).parents("span").hasClass("checked")) {
                $(groupCheck).trigger("click");
            }
            this.onBulkCheck();
            configs.$datatable.find('tbody tr').each(function () {
                if ($(this).hasClass("active")) {
                    $(this).trigger("click");
                }
            });
        },
        onBulkCheck: function () {
            configs.$datatable.find(".group-checkable").change(function () {
                var checkboxs = $(this).attr("data-set");
                var isCheckedAll = $(this).is(":checked");
                configs.selected = [];
                $(checkboxs).each(function () {
                    if (isCheckedAll === true) {
                        if (!$(this).hasClass("ignore")) {
                            $(this).parents("tr").addClass("active");
                            $(this).parents("span").addClass("checked");

                            // bind selected array
                            var id = $(this).data("id");
                            configs.selected.push(id);
                        }
                    } else {
                        $(this).parents("tr").removeClass("active");
                        $(this).parents("span").removeClass("checked");
                    }
                });
                $.uniform.update(checkboxs);
            });
        },
        offBulkCheck: function () {
            configs.$datatable.find(".group-checkable").off("change");
        },
        checkBulkCheck: function () {
            if (!$(".group-checkable").parents("span").hasClass("checked")) {
                $(".group-checkable").trigger("click");
            }
        },
        unCheckBulkCheck: function () {
            if ($(".group-checkable").parents("span").hasClass("checked")) {
                $(".group-checkable").trigger("click");
            }
        }
    }
}

function getExpireText(module, expire) {
    if (expire == "1") {
        return `Expires in ${expire} month`;
    }

    return `Expires in ${expire} months`;
}