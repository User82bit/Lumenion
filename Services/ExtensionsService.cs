using System;
using System.Collections.Generic;
using System.Text;


namespace Lumenion.Services
{
    internal class resolve 
    {
        int code;
        string message;
    }
    public class ExtensionsService
    {
        public static resolve WriteCMD(string command)
        {
            var result = new resolve();
            try
            {
                System.Diagnostics.ProcessStartInfo procStartInfo =
                    new System.Diagnostics.ProcessStartInfo("cmd", "/c " + command);
                procStartInfo.RedirectStandardOutput = true;
                procStartInfo.UseShellExecute = false;
                procStartInfo.CreateNoWindow = true;
                System.Diagnostics.Process proc = new System.Diagnostics.Process();
                proc.StartInfo = procStartInfo;
                proc.Start();
                string resultCMD = proc.StandardOutput.ReadToEnd();
                result.code = 0;
                result.message = resultCMD;
            }
            catch (Exception objException)
            {
                result.code = 1;
                result.message = objException.Message;
            }
            return result;
        }
    }
}
