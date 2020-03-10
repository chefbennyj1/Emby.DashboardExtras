﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using MediaBrowser.Common.Net;
using MediaBrowser.Controller.Net;
using MediaBrowser.Controller.Plugins;
using MediaBrowser.Controller.Session;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Logging;

namespace DashboardExtras
{
    public class ServerEntryPoint : IServerEntryPoint
    {
        private IFileSystem FileSystem { get; set; }
        private ILogger logger         { get; set; }
        private ILogManager LogManager { get; set; }
        
        public ServerEntryPoint(IFileSystem file, ILogManager logManager)
        {
            FileSystem = file;
            LogManager = logManager;
            logger     = LogManager.GetLogger(Plugin.Instance.Name);
            
        }
        public void Dispose()
        {
            throw new NotImplementedException();
        }

        public void Run()
        {
            Plugin.Instance.UpdateConfiguration(Plugin.Instance.Configuration);

            var indexPath       = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\Emby-Server\system\dashboard-ui\index.html";
            var dashboardUiPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\Emby-Server\system\dashboard-ui";
            var dashboardExtraJs = "Dashboard_Extras_1-0.js";
            
            
            if (!File.Exists(dashboardUiPath + "\\" + dashboardExtraJs))
            {
                WriteResourceToFile(GetType().Namespace + ".Assets." + dashboardExtraJs, dashboardUiPath + "\\" + dashboardExtraJs);
            }

            var indexLines          = new List<string>();
            var insertWeatherScript = 0;

            using (var sr = new StreamReader(indexPath))
            {
                var line = string.Empty;
                var i    = 0;

                while ((line = sr.ReadLine()) != null)
                {
                    if (line.Contains("apploader.js"))
                    {
                        insertWeatherScript = i - 1;
                    }
                    
                    i++;
                }
            }

            if (!indexLines.Exists(l => l == "<script src=\"" + dashboardExtraJs + "\"></script>"))
            {
                indexLines.Insert(insertWeatherScript, "<script src=\"" + dashboardExtraJs + "\"></script>");
            }
                
            File.WriteAllLines(indexPath, indexLines);
        }

        private void WriteResourceToFile(string resourceName, string fileName)
        {
            using (var resource = Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName))
            {
                using (var file = new FileStream(fileName, FileMode.Create, FileAccess.Write))
                {
                    resource?.CopyTo(file);
                }
            }
        }
    }
}
