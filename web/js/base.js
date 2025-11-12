let mode = "production";

    switch (mode) {
      case "production":
        try {
          socket = io("http://127.0.0.1:4433", {
            transports: ["websocket"], // optional: force WebSocket only
          });
          console.log("production - https://127.0.0.1:4433");
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


