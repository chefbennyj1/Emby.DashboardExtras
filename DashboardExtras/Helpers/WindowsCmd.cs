using System.Diagnostics;

namespace DashboardExtras.Helpers
{
    public class WindowsCmd
    {
        public static string GetCommandOutput(string args)
        {
            ProcessStartInfo procStartInfo = new ProcessStartInfo("cmd", "/c " + args)
            {
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (Process process = new Process())
            {
                process.StartInfo = procStartInfo;
                process.Start();

                string result = process.StandardOutput.ReadToEnd();
                return (result);
            }
        }
        
        public static void StartProcessOutput(string args)
        {
            
            ProcessStartInfo procStartInfo = new ProcessStartInfo("cmd",  args)
            {
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (Process process = new Process())
            {
                process.StartInfo = procStartInfo;
                process.Start();
                
                string result = process.StandardOutput.ReadToEnd();
               
            }
        }
        
    }
}
