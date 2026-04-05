const http = require('http');
const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const armorManager = require('mineflayer-armor-manager');

// Keep-alive for Render
http.createServer((req, res) => { res.write("Active"); res.end(); }).listen(process.env.PORT || 8080);

const bot = mineflayer.createBot({
  host: 'corodium.play.hosting',
  username: 'BOT1',
  version: '1.21.11', 
  auth: 'offline'
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(armorManager);

let isFighting = false;
let targetPlayer = null;

bot.on('chat', (username, message) => {
  if (username === bot.username) return;

  if (message === '?fight') {
    const player = bot.players[username];
    if (!player || !player.entity) return bot.chat("I can't see you!");

    targetPlayer = username;
    isFighting = true;
    bot.chat("Combat Mode: ENABLED. I will not stop.");
    
    // Initial suit up
    bot.armorManager.equipAll();
    const weapon = bot.inventory.items().find(i => i.name.includes('sword') || i.name.includes('axe') || i.name.includes('spear'));
    if (weapon) bot.equip(weapon, 'hand');
  }

  if (message === '?stop') {
    isFighting = false;
    targetPlayer = null;
    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
    bot.chat("Combat Mode: DISABLED. Stationary dummy mode active.");
  }
});

// --- THE FIX: FORCE THE ATTACK EVERY TICK ---
bot.on('physicsTick', () => {
  if (!isFighting || !targetPlayer) return;

  const player = bot.players[targetPlayer];
  if (player && player.entity) {
    // If the bot has no active target or is just standing there, FORCE it to attack
    if (!bot.pvp.target) {
      const defaultMove = new Movements(bot);
      bot.pathfinder.setMovements(defaultMove);
      bot.pvp.attack(player.entity);
    }
  }
});

// Reset if someone dies
bot.on('entityDead', (entity) => {
  if (entity === bot.entity || (bot.pvp.target && bot.pvp.target === entity)) {
    isFighting = false;
    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
  }
});

bot.on('death', () => {
    isFighting = false;
    setTimeout(() => bot.respawn(), 5000);
});
