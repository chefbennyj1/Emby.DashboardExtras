define(["loading", "dialogHelper", "emby-checkbox", "emby-select", "emby-input"],
    function(loading, dialogHelper) {
        var pluginId = "4655E73B-C161-49F7-9EDC-265212A0DE9D";
         
        return function (view) {

            view.addEventListener('viewshow',
                () => {

                    view.querySelectorAll('input[type=checkbox]').forEach((checkbox) => {

                        checkbox.checked === false;

                        checkbox.addEventListener('change',
                            (e) => {
                                ApiClient.getPluginConfiguration(pluginId).then((config) => {

                                    var f = view.querySelector('#fahrenheit');
                                    var c = view.querySelector('#celsius');

                                    if (e.target.checked === true) {
                                        config.Degree = e.target.id;
                                        if (e.target.id === f.id) {
                                            c.checked = false;
                                        } else {
                                            f.checked = false;
                                        }
                                    }

                                    ApiClient.updatePluginConfiguration(pluginId, config).then((result) => { });
                                });
                            });
                    });

                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        if (config.OpenWeatherMapApiKey) {
                            view.querySelector('#openWeatherMapAccessToken').value = config.OpenWeatherMapApiKey;
                        }
                        if (config.OpenWeatherMapCityCode) {
                            view.querySelector('#openWeatherMapCityId').value = config.OpenWeatherMapCityCode;
                        }
                        if (config.Degree && config.Degree.length) { 
                            view.querySelector('#' + config.Degree).checked = true; 
                        }
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