using MediaBrowser.Model.Plugins;

namespace DashboardExtras.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public bool WeatherEnabled           { get; set; }
        public bool UpTimeEnabled            { get; set; }
        public bool StorageEnabled           { get; set; }
        public string OpenWeatherMapApiKey   { get; set; }
        public string OpenWeatherMapCityCode { get; set; }
        public string Degree                 { get; set; }
        public string CustomJavascript       { get; set; }
        public bool BackgroundBlur           { get; set; }
    }
}
