using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using CPULoad.Helpers;
using MediaBrowser.Common.Net;
using MediaBrowser.Controller.Net;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Serialization;
using MediaBrowser.Model.Services;

namespace CPULoad.Api
{

    public class CpuLoadService : IService 
    {


        [Route("/GetCpuUsageData", "GET", Summary = "Get System CPU Data")]
        public class SystemCpuData : IReturn<string>
        {
            public string CpuUsage { get; set; }
        }

        [Route("/GetSystemUptimeData", "GET", Summary = "Get System Up-time Data")]
        public class SystemUpTimeData : IReturn<string>
        {
            public string UpTimeDays { get; set; }
            public string UpTimeHours { get; set; }
        }

        private IJsonSerializer JsonSerializer { get; set; }
        private IFileSystem FileSystem { get; set; }
        
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
        //typeperf "\Processor(_Total)\% Processor Time"
        public string Get(SystemUpTimeData request)
        {
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
                    var info1 = info.Split(new[] {"Statistics since"}, StringSplitOptions.None)[1];
                    var info2 = info1.Split(new[] { "M" }, StringSplitOptions.None)[0];
                    upTime = (DateTime.Now - DateTime.Parse(info2 + "M"));
                    
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
    }
}
