using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;

namespace RobbieBotten.Util {
    public class Web {
        public static WebResponse GetStreamFromUrl(string url) {
            var http = (HttpWebRequest) WebRequest.Create(url);
            http.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.1) Gecko/2008070208 Firefox/3.0.1";
            http.Method = "GET";
            WebResponse response = http.GetResponse();

            return response;
        }
    }
}
