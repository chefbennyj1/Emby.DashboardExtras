using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Threading;
using DashboardExtras.Helpers;
using MediaBrowser.Common.Net;
using MediaBrowser.Controller.Net;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Net;
using MediaBrowser.Model.Serialization;
using MediaBrowser.Model.Services;

namespace DashboardExtras.Api
{

    public class CpuLoadService : IService 
    {

        [Route("/EnabledExtras", "GET", Summary = "Get System CPU Data")]
        public class EnabledExtras : IReturn<string>
        {
            public bool UpTimeEnabled  { get; set; }
            public bool StorageEnabled { get; set; }
            public bool WeatherEnabled { get; set; }
        }


        [Route("/GetCpuUsageData", "GET", Summary = "Get System CPU Data")]
        public class SystemCpuData : IReturn<string>
        {
            public string CpuUsage { get; set; }
        }

        [Route("/GetSystemUptimeData", "GET", Summary = "Get System Up-time Data")]
        public class SystemUpTimeData : IReturn<string>
        {
            public string UpTimeDays  { get; set; }
            public string UpTimeHours { get; set; }
           
        }

        [Route("/GetWeatherData", "GET", Summary = "Get System Up-time Data")]
        public class WeatherData : IReturn<string>
        {
            public string weatherData { get; set; }
            public string units       { get; set; }
            
        }

        private IJsonSerializer JsonSerializer { get; set; }
        private IFileSystem FileSystem         { get; set; }
        
        public CpuLoadService(IJsonSerializer json, IFileSystem fS)
        {
            JsonSerializer = json;
            FileSystem = fS;
           
        }
        
        private bool IsUnix()
        {
            var isUnix = RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ||
                         RuntimeInformation.IsOSPlatform(OSPlatform.Linux);

            return isUnix;
        }


        public string Get(EnabledExtras request)
        {
            var config = Plugin.Instance.Configuration;
            return JsonSerializer.SerializeToString(new EnabledExtras()
            {
                StorageEnabled = config.StorageEnabled != null ? config.StorageEnabled : false,
                UpTimeEnabled = config.UpTimeEnabled != null ? config.UpTimeEnabled : false,
                WeatherEnabled = config.WeatherEnabled != null ? config.WeatherEnabled : false,
            });
        }


        //typeperf "\Processor(_Total)\% Processor Time"
        public string Get(SystemUpTimeData request)
        {
            var config = Plugin.Instance.Configuration;
            var info = string.Empty;
            TimeSpan upTime;
            switch (IsUnix())
            {
                case true:
                    info = LinuxBash.GetCommandOutput("uptime -s");
                    upTime = (DateTime.Now - DateTime.Parse(info));
                    return JsonSerializer.SerializeToString(new SystemUpTimeData()
                    {
                        UpTimeDays  = upTime.Days.ToString(),
                        UpTimeHours = upTime.Hours.ToString()
                    });

                case false:
                    info = WindowsCmd.GetCommandOutput("net statistics server");
                    var info1 = info.Split(new[] { "Statistics since" }, StringSplitOptions.RemoveEmptyEntries)[1];
                    var info2 = info1.Split(new[] { "Sessions accepted" }, StringSplitOptions.RemoveEmptyEntries)[0];
                    upTime = (DateTime.Now.Subtract(DateTime.Parse(info2)));

                    return JsonSerializer.SerializeToString(new SystemUpTimeData()
                    {
                        UpTimeDays =  upTime.Days.ToString(),
                        UpTimeHours = upTime.Hours.ToString()

                    });
                default:
                    return string.Empty;
            }
        }

        public string Get(SystemCpuData request)
        {
            var startTime     = DateTime.UtcNow;
            var startCpuUsage = Process.GetCurrentProcess().TotalProcessorTime;
            Thread.Sleep(500);

            var endTime       = DateTime.UtcNow;
            var endCpuUsage   = Process.GetCurrentProcess().TotalProcessorTime;
            var cpuUsedMs     = (endCpuUsage - startCpuUsage).TotalMilliseconds;
            var totalMsPassed = (endTime - startTime).TotalMilliseconds;
            var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);
            return JsonSerializer.SerializeToString(new SystemCpuData()
            {
                CpuUsage = Math.Round((cpuUsageTotal * 100), 1, MidpointRounding.AwayFromZero).ToString()
            });
        }

        public string Get(WeatherData request)
        {
            //6101645
            //13c656493c60fce29fa63b5f887fe515
            var config = Plugin.Instance.Configuration;
            if (config.OpenWeatherMapApiKey == null) return string.Empty;
            var units = config.Degree == "celsius" ? "metric" : "imperial";
            var url = $"http://api.openweathermap.org/data/2.5/weather?id={config.OpenWeatherMapCityCode}&&units={units}&appid={config.OpenWeatherMapApiKey}";
            try
            {
                var req = HttpWebRequest.Create(url);
                req.Method = "GET";
                using (WebResponse response = req.GetResponse())
                {
                    using (StreamReader streamReader = new StreamReader(response.GetResponseStream()))
                    {
                        return JsonSerializer.SerializeToString(new WeatherData() { weatherData = streamReader.ReadToEnd(), units = config.Degree });
                    }
                }

            }
            catch (Exception ex)
            {
                
            }

            return string.Empty;
        }
    }
}
