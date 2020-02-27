using System.Diagnostics;

namespace CPULoad.Helpers
{
    public class LinuxBash
    {
        public static string GetCommandOutput(string args)
        {
            var escapedArgs = args.Replace("\"", "\\\"");

            ProcessStartInfo procStartInfo = new ProcessStartInfo("/bin/bash", $"-c \"{escapedArgs}\"")
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
    }
}
