using MediaBrowser.Model.Plugins;

namespace DashboardExtras.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public string OpenWeatherMapApiKey { get; set; }
        public string OpenWeatherMapCityCode { get; set; }
        public string Degree { get; set; }

    }
}
