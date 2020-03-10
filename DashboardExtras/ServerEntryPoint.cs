using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading;
using MediaBrowser.Controller;
using MediaBrowser.Controller.Plugins;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Logging;

namespace DashboardExtras
{
    public class ServerEntryPoint : IServerEntryPoint
    {
        private IFileSystem FileSystem { get; set; }
        private ILogger logger         { get; set; }
        private ILogManager LogManager { get; set; }
        private IServerApplicationHost host { get; set; }
        public ServerEntryPoint(IFileSystem file, ILogManager logManager, IServerApplicationHost serverApplicationHost)
        {
            FileSystem = file;
            LogManager = logManager;
            logger     = LogManager.GetLogger(Plugin.Instance.Name);
            host = serverApplicationHost;
        }
        public void Dispose()
        {
            throw new NotImplementedException();
        }

        public void Run()
        {
            Plugin.Instance.UpdateConfiguration(Plugin.Instance.Configuration);

            var sysInfo = host.GetSystemInfo(CancellationToken.None).Result; //Yes calling Result!
            var serverRootFolder = sysInfo.ProgramDataPath.Replace("programdata", "");
            logger.Info(serverRootFolder);

            //This will take care of updating and loading the javascript file into the web app when the plugin loads
            const int version = 1;
            var indexPath        = serverRootFolder + @"system\dashboard-ui\index.html";
            var dashboardUiPath  = serverRootFolder + @"system\dashboard-ui";
            var dashboardExtraJs = $"Dashboard_Extras_1-{version}.js";
            
            //Add newest version of the file
            if (!File.Exists($"{dashboardUiPath}\\{dashboardExtraJs}"))
            {
                WriteResourceToFile(GetType().Namespace + ".Assets." + dashboardExtraJs, $"{dashboardUiPath}\\{dashboardExtraJs}");
            }

            //Remove older version of the javascript file from the file system.
            if(File.Exists($"{dashboardUiPath}\\Dashboard_Extras_1-{version - 1}.js")) //<-- plugin updates must happen in increments of 1 in order to do this properly
            {
                File.Delete($"{dashboardUiPath}\\Dashboard_Extras_1-{version - 1}.js");
            }

            var indexLines = GetIndexToList(indexPath);

            var i = 0;
            for (var l = 0; l <= indexLines.Count - 1; l++)
            {
                if (indexLines[l].Contains("apploader.js")) i = l - 1; //Find line to insert new version of the file (right above the apploader.js)
                if (indexLines[l] == $"<script src=\"Dashboard_Extras_1-{version - 1}.js\"></script>") indexLines.RemoveAt(l); //Remove script tags from older version if they exist
            }
            
            if (!indexLines.Exists(l => l == "<script src=\"" + dashboardExtraJs + "\"></script>"))
            {
                indexLines.Insert(i, "<script src=\"" + dashboardExtraJs + "\"></script>");
            }
                
            File.WriteAllLines(indexPath, indexLines); //Save the index file back to the file system for loading.
        }

        private static List<string> GetIndexToList(string indexPath)
        {
            var indexLines = new List<string>();
            using (var sr = new StreamReader(indexPath))
            {
                var line = string.Empty;
                
                while ((line = sr.ReadLine()) != null)
                {
                    indexLines.Add(line);
                }
            }

            return indexLines;
        }

        private static void WriteResourceToFile(string resourceName, string fileName)
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
