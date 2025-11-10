

    // --- TILE STORAGE SYSTEM ---
    // Using a Map for efficient key/value access (supports infinite world)
    

    const users = new Map();

    function generateAuthorName() {
      const titles = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
      const adjectives = [
        "Eloquent", "Mysterious", "Somber", "Brilliant", "Enigmatic", "Gentle",
        "Brooding", "Inspired", "Melancholic", "Witty", "Stoic", "Dreamy",
        "Vivid", "Arcane", "Noble", "Poetic", "Clever", "Ambitious", "Haunted",
        "Fabled", "Quiet", "Venerable", "Charming", "Daring", "Curious"
      ];
      const firstNames = [
        "Tobias", "Ada", "Lillian", "Oscar", "Julian", "Clara", "Eleanor", "Hugo",
        "Daphne", "Nathaniel", "Rowan", "Sylvia", "Edgar", "Vera", "August",
        "Florence", "Lucian", "Ivy", "Gideon", "Mabel", "Arthur", "Beatrice",
        "Felix", "Cecilia", "Miles"
      ];
      const lastNames = [
        "Quill", "Penwright", "Inkwell", "Thorne", "Austen", "Brontë", "Heming",
        "Wordsworth", "Hawthorne", "Byron", "Poe", "Shelley", "Twain", "Chaucer",
        "Dickens", "Wilde", "Frost", "Lowell", "Whitman", "Melville", "Keats",
        "Tennyson", "Carroll", "Eliot", "Huxley", "Orwell"
      ];
      const rand = arr => arr[Math.floor(Math.random() * arr.length)];
      return `${rand(titles)} ${rand(adjectives)} ${rand(firstNames)} ${rand(lastNames)}`;
    }
    
    // mode = prompt("Which mode?", mode);

    let socket;
    let testName = localStorage.getItem("nickname");
    let myName = testName || generateAuthorName(); // Math.random();

    let mode = 'development';// 'production'; // production  // development

document.getElementById("nickname").onchange = (e) => {
  myName = e.target.value;
  socket.emit("setnick", { nickname: myName });
};

document.getElementById("nickname").value = myName;    


    // localStorage.setItem("myName", myName);
    // localStorage.setItem("myRoom", myRoom);


    switch (mode) {
      case "production":
        try {
          socket = io("https://pasciak.com:4433", {
            transports: ["websocket"], // optional: force WebSocket only
          });
          console.log("production - https://pasciak.com:4433");
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

    const log = (text) => {
      document.getElementById("log").textContent += text + "\n";
    };

    socket.on("connect", () => {
      log("✅ Connected to server");

      document.getElementById("gamescreen").style.display = 'block';
      document.getElementById("connectscreen").style.display = 'none';
    });


    socket.on("disconnect", () => {
      log("❌ Disconnected");
    });

    socket.on("roomsList", (data) => {
      log(JSON.stringify(data));
    })


    socket.on("userlist", (data) => {
      console.log(JSON.stringify(data));
    })



    socket.on("roomUsers", (data) => {
      log(JSON.stringify(data));
    })

    
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

      const startX = Math.floor(cameraX / TILE);
      const startY = Math.floor(cameraY / TILE);
      const endX = Math.ceil((cameraX + canvas.width / zoom) / TILE);
      const endY = Math.ceil((cameraY + canvas.height / zoom) / TILE);

      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";

      playerX = playerCol * TILE - cameraX;
      playerY = playerRow * TILE - cameraY;

      // actual tiles
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const px = x * TILE - cameraX;
          const py = y * TILE - cameraY;

          let theTile = getTile(x, y);

          let colBoundary = 69;
          let rowBoundary = 69;

          // drawLetterTile(ctx, '_', px, py);

          if (theTile && theTile.letter !== "~" && theTile.col > -colBoundary && theTile.col < colBoundary && theTile.row > -rowBoundary && theTile.row < rowBoundary) { // "_"

            if (theTile?.letter == "_") {
              drawLetterTile(ctx, theTile.letter, px, py, true);
            } else {
              drawLetterTile(ctx, theTile.letter, px, py);
            }

            ctx.lineWidth = 3;
            ctx.strokeStyle = "white"
            if (theTile.isSelected == true) { ctx.strokeRect(px + 6, py + 6, 64 - 12, 64 - 12) }
          } else {
            // if (theTile.col > -colBoundary && theTile.col < colBoundary && theTile.row > -rowBoundary && theTile.row < rowBoundary) {
            //drawLetterTile(ctx, '_', px, py);
            //}
          }

          // Draw tile border
          // ctx.strokeStyle = "red";
          // ctx.lineWidth = 2;
          // ctx.strokeRect(px, py, TILE, TILE);

          // Draw col,row centered on tile
          //      ctx.fillText(`${x},${y}`, px + TILE / 2, py + TILE / 2);

          // if (x == playerCol) {
          //   playerX = px;
          // }

          // if (y == playerRow) {
          //   playerY = py;
          // }

        }
      }


      // proposed tiles
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const px = x * TILE - cameraX;
          const py = y * TILE - cameraY;

          let theTile = getProposedTile(x, y);

          // console.log(theTile.letter)

          let colBoundary = 69;
          let rowBoundary = 69;

          // drawLetterTile(ctx, '_', px, py);

          if (theTile && theTile.letter !== "_" && theTile.col > -colBoundary && theTile.col < colBoundary && theTile.row > -rowBoundary && theTile.row < rowBoundary) { // "_"
            drawLetterTile(ctx, theTile.letter, px, py, true); // override draw to use proposed tile drawing image
            ctx.lineWidth = 3;
            ctx.strokeStyle = "white"
            if (theTile.isSelected == true) { ctx.strokeRect(px + 6, py + 6, 64 - 12, 64 - 12) }
          } else {
            // if (theTile.col > -colBoundary && theTile.col < colBoundary && theTile.row > -rowBoundary && theTile.row < rowBoundary) {
            //drawLetterTile(ctx, '_', px, py);
            //}
          }



        }
      }



      users.forEach((u) => {

        console.log(u);

        let cplayerX = u.playerCol * TILE - cameraX;
        let cplayerY = u.playerRow * TILE - cameraY;

        let nickname = u?.nickname || "Unknown";

        ctx.font = "18px Arial";

        // if ((u?.dateTime)) {
        //   ctx.fillText(u.dateTime, cplayerX - 22, cplayerY - 32);
        // }

        if (nickname == myName) {
          ctx.fillStyle = 'black';
        } else {
          ctx.fillStyle = 'yellow';
        }

        if (nickname != myName && (Date.now() - u.dateTime) > 15000) {

        } else {
          ctx.drawImage(playerImage, cplayerX - 22, cplayerY - 22);

          if ((Date.now() - u.dateTime) < 1000) {
            ctx.fillText(nickname, cplayerX - 22, cplayerY - 22);
          }

        }

        if (nickname == myName) {

          if (lastDirectionXY.x > 0) {
            ctx.font = "32px courier";
            ctx.fillStyle = 'white';
            // ctx.fillRect(cplayerX + 25, cplayerY + 1, 15, 15);
            ctx.fillText("→", cplayerX + 25, cplayerY + 10)
          }

          if (lastDirectionXY.y > 0) {
            ctx.font = "32px courier";
            ctx.fillStyle = 'white';
            // ctx.fillRect(cplayerX + 1, cplayerY + 25, 15, 15);
            ctx.fillText("↓", cplayerX + 10, cplayerY + 25)
          }

        }

        // ctx.drawImage(playerImage, cplayerX - 22, cplayerY - 22);
        // ctx.fillText(nickname, cplayerX - 22, cplayerY - 22);

      });

      //ctx.drawImage(playerImage, playerX - 22, playerY - 22);

      ctx.restore();
    }


    // --- Animation loop ---
    function loop() {
      //updateCamera();
      //draw();
      requestAnimationFrame(loop);
    }


