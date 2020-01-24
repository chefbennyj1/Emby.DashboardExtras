define(["loading", "dialogHelper", "emby-checkbox", "emby-select", "emby-input"],
    function(loading, dialogHelper) {
        var pluginId = "4655E73B-C161-49F7-9EDC-265212A0DE9D";
         
        return function (view) {

            view.addEventListener('viewshow',
                () => { 
                    ApiClient.getJSON(ApiClient.getUrl("OpenProcessorEvent").replace('http', 'ws')).then((result) => {
                        view.querySelector('#uptime').value = result;
                    });
                    require([Dashboard.getConfigurationResourceUrl('Chart.bundle.js')],
                        (chart) => {

                            //drawDriveChart(view, chart);

                        });
                });
        }
    });