using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Threading;
using DashboardExtras.Helpers;

namespace DashboardExtras.Events
{
    public class Resources //Currently only working for NVidia on windows
    {
        private Timer ResourceTimer { get; set; }
        
        public event EventHandler<OnResourceEventArgs> OnResourceDataEvents;
        
        public class GraphicsProcessor
        {
            public string Percentage { get; set; }
            public string Temp { get; set; }
        }

        public class NetworkStatistics
        {
            public string BytesSent { get; set; }
            public string BytesReceived { get; set; }
        }

        public class OnResourceEventArgs : EventArgs
        {
            public GraphicsProcessor Gpu                   { get; set; }
            public NetworkStatistics NetworkInterface { get; set; }
        }

        public Resources()
        {
            ResourceTimer = new Timer(Update);
            ResourceTimer.Change(1000, Timeout.Infinite);
        }

        private NetworkStatistics GetNetworkStatsData()
        {
            return new NetworkStatistics()
            {
                BytesSent     = NetworkInterface.GetAllNetworkInterfaces().Sum(n => n.GetIPv4Statistics().BytesSent)
                    .ToString(),
                BytesReceived = NetworkInterface.GetAllNetworkInterfaces().Sum(n => n.GetIPv4Statistics().BytesReceived)
                    .ToString()
            };
        }

        private GraphicsProcessor GetGraphicsProcessorData()
        {
            //Nvidea GPU Info
            var gpuCommandArgsTemp    = @"--query-gpu=temperature.gpu --format=csv,noheader";
            var gpuCommandArgsPercent = @"--query-gpu=utilization.gpu --format=csv,noheader";
            
            return new GraphicsProcessor()
            {
                Percentage = WindowsCmd.GetCommandOutput(@"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe", gpuCommandArgsPercent).Trim(),
                Temp       = WindowsCmd.GetCommandOutput(@"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe", gpuCommandArgsTemp).Trim()
            };
        }

        private void Update(object sender)
        {
            ResourceTimer.Change(Timeout.Infinite, Timeout.Infinite);

            OnResourceDataEvents?.Invoke(this, new OnResourceEventArgs()
            {
                NetworkInterface = GetNetworkStatsData(),
                Gpu = GetGraphicsProcessorData()
            });

            ResourceTimer.Change(1000, Timeout.Infinite);
        }

    }
}

    

