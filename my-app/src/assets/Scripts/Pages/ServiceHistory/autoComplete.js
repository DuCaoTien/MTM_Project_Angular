var asset_auto_complete_configs = {
    $assetType : $("#AssetType"),
    selecters: {
        $txtSearchBox: $("#AssetId")
    },
    urls: {
        getAsset: apiUrl.serviceHistory.search
    }
}

var asset_auto_complete_configs_fncs = {
    initEvents: function () {
        asset_auto_complete_configs_fncs.get(asset_auto_complete_configs.selecters.$txtSearchBox);
        asset_auto_complete_configs.$assetType.change(function() {
            $(asset_auto_complete_configs.selecters.$txtSearchBox).find("option").remove();
        });

    },
    get: function ($selecter) {
        $selecter.select2({
            placeholder: "Input at least 1 character to search",
            minimumInputLength: 1,
            ajax: {
                url: asset_auto_complete_configs.urls.getAsset,
                data: function (params) {
                    return {
                        type: asset_auto_complete_configs.$assetType.val(),
                        keyword: params.term
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