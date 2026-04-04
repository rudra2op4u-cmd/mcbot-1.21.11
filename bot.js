const http = require('http');
const mineflayer = require('mineflayer');

// 1. KEEP-ALIVE SERVER (Using Port 8081 for the second bot)
http.createServer((req, res) => {
  res.write("1.21.11 Bot is Online!");
  res.end();
}).listen(8081);

// 2. BOT CONFIGURATION
const botArgs = {
  host: 'corodium.play.hosting', // Change this to your 1.21.11 server
  username: 'Rudra_12111', 
  version: '1.21.11',      // New version support
  auth: 'offline',
  checkTimeoutInterval: 90000, // 90 seconds (1.21.11 is heavier on the initial join)
  hideErrors: false
};

let bot;

function createBot() {
  console.log("[LOG] Connecting to 1.21.11 server...");
  bot = mineflayer.createBot(botArgs);

  bot.on('login', () => {
    console.log(`[SUCCESS] 1.21.11 Bot logged in as ${bot.username}`);
  });

  bot.on('spawn', () => {
    console.log("[LOG] 1.21.11 Bot spawned. Anti-AFK Active.");
    
    if (global.afkInterval) clearInterval(global.afkInterval);
    global.afkInterval = setInterval(() => {
      if (bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      }
    }, 60000); 
  });

  bot.on('death', () => {
    console.log("[WARN] Bot died. Respawning...");
    setTimeout(() => bot.respawn(), 5000);
  });

  bot.on('end', (reason) => {
    console.log(`[WARN] Disconnected: ${reason}. Retrying in 15s...`);
    setTimeout(createBot, 15000);
  });

  bot.on('error', (err) => console.log(`[ERROR] ${err.message}`));
}

createBot();
