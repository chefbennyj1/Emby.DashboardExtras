using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading;
using DashboardExtras.Events;
using MediaBrowser.Controller;
using MediaBrowser.Controller.Plugins;
using MediaBrowser.Controller.Session;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Logging;
using MediaBrowser.Model.Serialization;


namespace DashboardExtras
{
    public class ServerEntryPoint : IServerEntryPoint
    {
        private IFileSystem FileSystem                          { get; set; }
        private ILogger Logger                                  { get; set; }
        private ILogManager LogManager                          { get; set; }
        private IServerApplicationPaths ServerApplicationPaths  { get; set; }
        private static ISessionManager SessionManager           { get; set; }
        private static IJsonSerializer JsonSerializer           { get; set; }

        // ReSharper disable once TooManyDependencies
        public ServerEntryPoint(IFileSystem file, ILogManager logManager, IServerApplicationPaths paths, ISessionManager ses, IJsonSerializer json)
        {
            FileSystem             = file;
            LogManager             = logManager;
            Logger                 = LogManager.GetLogger(Plugin.Instance.Name);
            ServerApplicationPaths = paths;
            SessionManager         = ses;
            JsonSerializer         = json;
        }
        public void Dispose()
        {
           
        }

        public void Run()
        {
            Plugin.Instance.UpdateConfiguration(Plugin.Instance.Configuration);

            var rootFolderPath   = ServerApplicationPaths.RootFolderPath; 
            var serverRootFolder = rootFolderPath.Replace(@"programdata\root", "");
            Logger.Info(serverRootFolder);

            //This will take care of updating and loading the javascript file into the web app when the plugin loads
            const int version = 2;
            var indexPath        = serverRootFolder + @"\system\dashboard-ui\index.html";
            var dashboardUiPath  = serverRootFolder + @"\system\dashboard-ui";
            var dashboardExtraJs = $"Dashboard_Extras_1-{version}.js";
            
            //Add newest version of the file
            if (!File.Exists($"{dashboardUiPath}\\{dashboardExtraJs}"))
            {
                WriteResourceToFile(GetType().Namespace + ".Assets." + dashboardExtraJs, $"{dashboardUiPath}\\{dashboardExtraJs}");
            }

            //Remove older version of the javascript file from the file system.
            if(File.Exists($"{dashboardUiPath}\\Dashboard_Extras_1-" + (version - 1) + ".js")) //<-- plugin updates must happen in increments of 1 in order to do this properly
            {
                File.Delete($"{dashboardUiPath}\\Dashboard_Extras_1-" + (version - 1) + ".js");
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


            //var res = new Resources();

            //res.OnResourceDataEvents += Resources_OnResourceDataEvents;

        }
        
        private async void Resources_OnResourceDataEvents(object sender, Resources.OnResourceEventArgs e)
        {
            var json = JsonSerializer.SerializeToString(e);

            await SessionManager.SendMessageToAdminSessions("Resources", json, CancellationToken.None);
        }
        

        private static List<string> GetIndexToList(string indexPath)
        {
            var indexLines = new List<string>();
            using (var sr = new StreamReader(indexPath))
            {
                var line = String.Empty;
                
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
