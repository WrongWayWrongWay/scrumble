


let mode = "production";

guid=localStorage.getItem("guid");
if(!guid){
  guid="xxxxxxxxyxxxxxyxxxxxyxxxxxyxxxxxy".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  localStorage.setItem("guid", guid);
} 

console.log("GUID:", guid);  
nickname=localStorage.getItem("nickname");
if(!nickname){
  nickname="Player"+Math.floor(Math.random()*1000);
  localStorage.setItem("nickname",nickname);
}







    switch (mode) {
      case "production":
        try {
          socket = io(window.location.href, {
            transports: ["websocket"], // optional: force WebSocket only
          });
          console.log("production",window.location.href);
        } catch (e) {
          socket = io("http://127.0.0.1:4433/", {
            transports: ["websocket"], // optional: force WebSocket only
          });
          console.log("production - errored, using http://127.0.0.1:4433/");
        }

        break;
      default:
        socket = io("http://127.0.0.1:4433/", {
          transports: ["websocket"], // optional: force WebSocket only
        });
        console.log("errored,using default using http://127.0.0.1:4433/");
        break;

    }

    socket.on("connect", () => {
      console.log("✅ Connected to server");

      //document.getElementById("gamescreen").style.display = 'block';
      //document.getElementById("connectscreen").style.display = 'none';
    });


    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

   



function screentoggle(screenid){     
    document.getElementById(screenid).style.display = document.getElementById(screenid).style.display ==='block'?'none':'block'; 
}     

    
    const canvas = document.getElementById("world");
    const ctx = canvas.getContext("2d");

    // Resize canvas
    function resize() {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();


    function draw() {

      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, canvas.width, canvas.height); // fill, not clearRect

      //ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(zoom, zoom);

      ctx.restore();
    }


    // --- Animation loop ---
    function loop() {
      //updateCamera();
      //draw();
      requestAnimationFrame(loop);
    }


