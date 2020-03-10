define(["loading", "dialogHelper", "emby-checkbox", "emby-select", "emby-input"],
    function(loading, dialogHelper) {
        var pluginId = "4655E73B-C161-49F7-9EDC-265212A0DE9D";

        function openWeatherOptions() {
            var dlg = dialogHelper.createDialog({
                size: "medium-tall",
                removeOnClose: !0,
                scrollY: !1
            });

            dlg.classList.add("formDialog");
            dlg.classList.add("ui-body-a");
            dlg.classList.add("background-theme-a");
            dlg.classList.add("newSubscription");
            dlg.style = "max-width:65%;";

            var html = "";
            html += '<div class="formDialogHeader" style="display:flex">';
            html += '<button is="paper-icon-button-light" class="btnCloseDialog autoSize paper-icon-button-light" tabindex="-1"><i class="md-icon"></i></button><h3 class="formDialogHeaderTitle">Weather Data</h3>';
            html += '</div>';

            html += '<div class="formDialogContent" style="margin:2em; height:35em">';
            html += '<div class="dialogContentInner dialog-content-centered scrollY" style="height:35em;">';

            html += '<div class="inputContainer">';
            html += '<label class="inputLabel inputLabelUnfocused" for="openWeatherMapAccessToken"> Open Weather Map API Key</label>';
            html += '<input type="text" name="openWeatherMapAccessToken" id="openWeatherMapAccessToken" class="emby-input">';
            html += '<div class="fieldDescription">Personal API key for <a href="https://openweathermap.org/">openweathermap.org/</a>.</div> ';
            html += '</div>';

            html += '<div class="inputContainer">';
            html += '<label class="inputLabel inputLabelUnfocused" for="openWeatherMapCityId">Open Weather City ID</label>';
            html += '<input type="text" name="openWeatherMapCityId" id="openWeatherMapCityId" class="emby-input">';
            html += ' <div class="fieldDescription">City Id used to get weather from OpenWeatherMap.org.</div>';
            html += '</div>';


            html += '<div class="checkboxContainer checkboxContainer-withDescription" style="padding-right: 2em">';
            html += '<label class="emby-checkbox-label">';
            html += '<input id="fahrenheit" type="checkbox" is="emby-checkbox" class="emby-checkbox" data-embycheckbox="true">';
            html += '<span class="checkboxLabel">Fahrenheit</span>';
            html += '<span class="emby-checkbox-focushelper"></span>';
            html += '<span class="checkboxOutline">';
            html += '<i class="md-icon checkboxIcon checkboxIcon-checked"></i>';
            html += '<i class="md-icon checkboxIcon checkboxIcon-unchecked"></i>';
            html += '</span>';
            html += '</label>';
            html += '<div class="fieldDescription checkboxFieldDescription">';
            html += '</div>';
            html += '</div>';

            html += '<div class="checkboxContainer checkboxContainer-withDescription" style="padding-right: 2em">';
            html += '<label class="emby-checkbox-label">';
            html += '<input id="celsius" type="checkbox" is="emby-checkbox" class="emby-checkbox" data-embycheckbox="true">';
            html += '<span class="checkboxLabel">Celsius</span>';
            html += '<span class="emby-checkbox-focushelper"></span>';
            html += '<span class="checkboxOutline">';
            html += '<i class="md-icon checkboxIcon checkboxIcon-checked"></i>';
            html += '<i class="md-icon checkboxIcon checkboxIcon-unchecked"></i>';
            html += '</span>';
            html += '</label>';
            html += '<div class="fieldDescription checkboxFieldDescription">';
            html += '</div>';
            html += '</div>';

            html += '<div class="formDialogFooter" style="margin:2em; padding-top:2%;">';
            html += '<button id="okButton" is="emby-button" type="submit" class="raised button-submit block formDialogFooterItem emby-button">Ok</button>';
            html += '</div>';

            html += '</div>';
            html += '</div>';

            dlg.innerHTML = html;
            dialogHelper.open(dlg);
             
            dlg.querySelectorAll('input[type=checkbox]').forEach(
                (checkbox) => {

                checkbox.checked === false;

                checkbox.addEventListener('change',
                    (e) => {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {

                            var f = dlg.querySelector('#fahrenheit');
                            var c = dlg.querySelector('#celsius');

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
            dlg.querySelector('#okButton').addEventListener('click',
                () => {
                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        config.OpenWeatherMapApiKey = view.querySelector('#openWeatherMapAccessToken').value;
                        config.OpenWeatherMapCityCode = view.querySelector('#openWeatherMapCityId').value;
                        ApiClient.updatePluginConfiguration(pluginId, config).then((result) => {
                            Dashboard.processPluginConfigurationUpdateResult(result);
                        });
                    });
                    dialogHelper.close(dlg);
                });
            dlg.querySelector('.btnCloseDialog').addEventListener('click',
                () => {
                    dialogHelper.close(dlg);
                });
            ApiClient.getPluginConfiguration(pluginId).then((config) => {
                if (config.OpenWeatherMapApiKey) {
                    dlg.querySelector('#openWeatherMapAccessToken').value = config.OpenWeatherMapApiKey;
                }
                if (config.OpenWeatherMapCityCode) {
                    dlg.querySelector('#openWeatherMapCityId').value = config.OpenWeatherMapCityCode;
                }
                if (config.Degree && config.Degree.length) {
                    dlg.querySelector('#' + config.Degree).checked = true;
                }
            });

        } 

        return function (view) {

            view.addEventListener('viewshow',
                () => {

                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        config.WeatherEnabled ? view.querySelector('#weatherEnabled').checked = config.WeatherEnabled : false;
                        config.UpTimeEnabled  ? view.querySelector('#upTimeEnabled').checked  = config.UpTimeEnabled  : false;
                        config.StorageEnabled ? view.querySelector('#storageEnabled').checked = config.StorageEnabled : false;
                    });

                    view.querySelector('#weatherEnabled').addEventListener('change',
                        (e) => {
                            var weather = view.querySelector('#weatherEnabled');
                            ApiClient.getPluginConfiguration(pluginId).then((config) => {
                                config.WeatherEnabled = weather.checked;
                                ApiClient.updatePluginConfiguration(pluginId, config).then((result) => {});
                            });
                            if (weather.checked === true) {
                                openWeatherOptions();
                            }
                        });

                    view.querySelector('#upTimeEnabled').addEventListener('change',
                        (e) => {
                            var upTime = view.querySelector('#upTimeEnabled');
                            ApiClient.getPluginConfiguration(pluginId).then((config) => {
                                config.UpTimeEnabled = upTime.checked;
                                ApiClient.updatePluginConfiguration(pluginId, config).then((result) => {});
                            });
                        });

                    view.querySelector('#storageEnabled').addEventListener('change',
                        (e) => {
                            var storage = view.querySelector('#storageEnabled');
                            ApiClient.getPluginConfiguration(pluginId).then((config) => {
                                config.StorageEnabled = storage.checked;
                                ApiClient.updatePluginConfiguration(pluginId, config).then((result) => {});
                            });
                        });

                });
        }
    });