define(["loading", "dialogHelper", "emby-checkbox", "emby-select", "emby-input"],
    function(loading, dialogHelper) {
        var pluginId = "4655E73B-C161-49F7-9EDC-265212A0DE9D";
         
        return function (view) {

            view.addEventListener('viewshow',
                () => {

                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        view.querySelector('#openWeatherMapAccessToken').value = config.OpenWeatherMapApiKey;
                        view.querySelector('#openWeatherMapCityId').value = config.OpenWeatherMapCityCode;
                    });

                    view.querySelector('#saveButton').addEventListener('click', () => {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.OpenWeatherMapApiKey = view.querySelector('#openWeatherMapAccessToken').value;
                            config.OpenWeatherMapCityCode = view.querySelector('#openWeatherMapCityId').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then((result) => {
                                Dashboard.processPluginConfigurationUpdateResult(result); 
                            });
                        });
                    });
                });
        }
    });