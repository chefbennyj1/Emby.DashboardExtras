using System;
using System.Collections.Generic;
using System.IO;
using CPULoad.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Drawing;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace CPULoad
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasThumbImage, IHasWebPages
    {
        public static Plugin Instance { get; set; }
        public ImageFormat ThumbImageFormat => ImageFormat.Jpg;

        private readonly Guid _id = new Guid("4655E73B-C161-49F7-9EDC-265212A0DE9D");
        public override Guid Id => _id;

        public override string Name => "Dashboard Extras";


        public Stream GetThumbImage()
        {
            var type = GetType();
            return type.Assembly.GetManifestResourceStream(type.Namespace + ".thumb.png");
        }

        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer) : base(applicationPaths,
            xmlSerializer)
        {
            Instance = this;
        }

        public IEnumerable<PluginPageInfo> GetPages() => new[]
        {
            new PluginPageInfo
            {
                Name = "DashboardExtrasPluginConfigurationPage",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DashboardExtrasPluginConfigurationPage.html"

            },
            new PluginPageInfo
            {
                Name = "DashboardExtrasPluginConfigurationPageJS",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.DashboardExtrasPluginConfigurationPage.js"
            },
            new PluginPageInfo
            {
                Name = "Chart.bundle.js",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.Chart.bundle.js"
            }
        };

    }
}