const WebSocket = require('ws');
const chalk = require("chalk");
const figlet = require("figlet");
const gradient = require("gradient-string");
const readline = require("readline");
const { exec } = require('child_process');
const os = require('os');

// Konfigurasi
const WS_PORT = 3000;
const EXIT_WORDS = ["exit", "keluar", "quit", "q"];
const VERSION = "2.0.0";

// Kredensial login
const VALID_USERNAME = "Dravin";
const VALID_PASSWORD = "dravinzx";

// Daftar perintah Minecraft
const commands = [
  "/gamerule commandblockoutput false",
  "/gamerule sendcommandfeedback false",
  "/tickingarea add ~ ~ ~ ~ ~ ~ ToolDroid",
  "execute at @a[tag=!ToolDroid] run fill ~20 ~-2 ~-20 ~-20 ~-2 ~20 air",
  "title @a title §l§7Raid §fHack",
  "replaceitem entity @a slot.armor.head 0 carved_pumpkin 1 0 {\"minecraft:item_lock\":{ \"mode\": \"lock_in_slot\" }, \"minecraft:keep_on_death\":{}}",
  "execute at @a run replaceitem entity @a slot.weapon.offhand 0 totem_of_undying 1 0 {\"minecraft:item_lock\":{ \"mode\": \"lock_in_slot\" }, \"minecraft:keep_on_death\":{}}",
  "gamemode a @a",
  "/playsound mob.enderdragon.growl @a",
  "say  §l§cby§bRADIT: §o§7 Raid hacked §r",
  "/give @a barrier 999 0 {\"keep_on_death\":{}}",
  "effect @a blindness 9999 255",
  "effect @a nausea 99999 255",
  "execute at @a[tag=!ToolDroid] run summon lightning_bolt ~~1",
  "playsound ambient.nether_wastes.mood @a",
  "playsound ambient.basalt_deltas.mood @a",
  "/gamerule doimmediaterespawn true",
  "/title @a subtitle §l§f Raid §cHack",
  "tellraw @a {\"rawtext\":[{\"text\":\"§b§r§l§7Team Radit Raid hack\"}]}",
  "/effect @a night_vision 10000 255 true",
  "/title @a actionbar §r§l§7Team §eRadit",
  "/title @a times 3 3 3",
  "playsound mob.endermen.scream @a",
  "/fill ~20 ~9 ~-20 ~-20 ~9 ~20 deny",
  "/replaceitem entity @a slot.hotbar 0 barrier 64 0 {\"keep_on_death\":{}}",
  "/replaceitem entity @a slot.hotbar 1 barrier 64 0 {\"keep_on_death\":{}}",
  "/replaceitem entity @a slot.hotbar 2 barrier 64 0 {\"keep_on_death\":{}}",
  "/replaceitem entity @a slot.hotbar 3 barrier 64 0 {\"keep_on_death\":{}}",
  "/replaceitem entity @a slot.hotbar 4 barrier 64 0 {\"keep_on_death\":{}}",
  "/replaceitem entity @a slot.hotbar 5 barrier 64 0 {\"keep_on_death\":{}}",
  "/replaceitem entity @a slot.hotbar 6 barrier 64 0 {\"keep_on_death\":{}}",
  "/replaceitem entity @a slot.hotbar 7 barrier 64 0 {\"keep_on_death\":{}}",
  "/replaceitem entity @a slot.hotbar 8 barrier 64 0 {\"keep_on_death\":{}}",
  "effect @a mining_fatigue 100 255 true",
  "execute at @a run fill ~1 ~0 ~-1 ~-1 ~1 ~1 air 0 destroy",
  "/effect @a hunger 1000 255 true",
  "/effect @a Weakness 100 255 true",
  "/effect @a slow_falling 10000 255 true",
  "/effect @a darkness 100 255 true",
  "/effect @a conduit_power 10000 255 true",
  "/effect @a haste 10000 255 true",
  "/effect @a Strength 10000 255 true",
  "/effect @a fatal_poison 10000 255 true",
  "/effect @a absorption 1000 250 true",
  "/effect @a health_boost 100 20 true",
  "/effect @a fire_resistance 1000 255 true",
  "/gamerule dodaylightcycle false",
  "/gamerule showcoordinates false",
  "/gamerule pvp false",
  "/gamerule doweathercycle false",
  "/gamerule keepinventory false",
  "/gamerule naturalregeneration true",
  "/weather clear",
  "/difficulty hard",
  "/time set day",
  "/playsound mob.wither.shoot @a ~ ~ ~ 100",
  "/playsound ambient.cave @a",
  "/execute as @a at @a run particle minecraft:large_explosion ~ ~ ~",
  "/execute as @a at @a run particle minecraft:dragon_dying_explosion ~ ~ ~",
  "/execute at @a as @a run particle mobflame_single ~ ~ ~",
  "/execute as @a run /particle minecraft:totem_particle ~ ~ ~",
  "effect @a slowness 10000 2",
  "/effect @a invisibility 1000 200 true",
  "/execute as @a run summon snowball ~ -2",
  "/execute as @a run playsound mob.enderdragon.death @a ~ ~ ~ 100000 0.1 10000",
  "camerashake add @a 4.00 100",
  "/execute as @a run fog @a push \"minecraft:fog_the_end\" \"hell\"",
  "/damage @a 99",
  "/scoreboard objectives add Raid dummy \"§l§7Team §cRadit\"",
  "/scoreboard objectives setdisplay list Raid",
  "/scoreboard objectives setdisplay sidebar Raid",
  "/scoreboard players add @a Raid 1",
  "execute as @a run Particle minecraft:blue_flame_particle ~ ~ ~",
  "/playanimation @a animation.zombie.attack_bare_hand a 999",
  "/effect @a blindness 9999 255 true",
  "/effect @a jump_boost 10000 5 true",
  "/gamerule showdeathmessages false",
  "/gamerule firedamage false",
  "effect @a poison 100 100",
  "/tickingarea add ~ ~ ~ ~ ~ ~ ToolDroidiu",
  "/playsound mob.creeper.say @a",
  "/time add 300"
];

// Fungsi utilitas
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const question = (text, hidden = false) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    if (hidden) {
      // Untuk input password yang tersembunyi
      const stdin = process.openStdin();
      process.stdin.on("data", (char) => {
        switch (char.toString()) {
          case "\n":
          case "\r":
          case "\u0004":
            stdin.pause();
            break;
          default:
            process.stdout.clearLine();
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(text + Array(rl.line.length + 1).join("*"));
            break;
        }
      });
      
      rl.question(text, (ans) => {
        const val = ans.trim().toLowerCase();
        if (EXIT_WORDS.includes(val)) {
          console.log(chalk.red("\n[!] Keluar dari tools..."));
          rl.close();
          process.exit(0);
        }
        rl.close();
        resolve(ans);
      });
    } else {
      rl.question(text, (ans) => {
        const val = ans.trim().toLowerCase();
        if (EXIT_WORDS.includes(val)) {
          console.log(chalk.red("\n[!] Keluar dari tools..."));
          rl.close();
          process.exit(0);
        }
        rl.close();
        resolve(ans);
      });
    }
  });
};

const progressBar = async (text = "Loading", total = 20, delay = 100) => {
  for (let i = 0; i <= total; i++) {
    const percent = Math.round((i / total) * 100);
    const bar = "█".repeat(i) + "░".repeat(total - i);
    process.stdout.write(`\r${chalk.hex('#FFA500')(`[⌛]`)} ${chalk.cyan(text)} [${bar}] ${percent}%`);
    await sleep(delay);
  }
  process.stdout.write(chalk.green(" ✓\n"));
};

const animasiGaris = (length = 50) => {
  console.log(chalk.hex('#FFA500')('═'.repeat(length)));
};

const typeEffect = async (text, delay = 10, color = 'magenta') => {
  process.stdout.write(chalk[color](''));
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delay);
  }
  process.stdout.write('\n');
};

const copyToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    if (process.platform === 'win32') {
      exec(`echo ${text} | clip`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    } else if (process.platform === 'darwin') {
      exec(`echo "${text}" | pbcopy`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      exec(`echo "${text}" | xclip -selection clipboard`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }
  });
};

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
};

const showBanner = async () => {
  console.clear();
  
  // Animasi banner
  const bannerText = "DRAVIN";
  const fonts = ["ANSI Shadow", "Big", "Blocks", "Ogre"];
  
  for (const font of fonts) {
    console.clear();
    const banner = figlet.textSync(bannerText, { font });
    console.log(gradient.rainbow.multiline(banner));
    await sleep(200);
  }
  
  console.clear();
  const finalBanner = figlet.textSync(bannerText, { font: "ANSI Shadow" });
  console.log(gradient.instagram.multiline(finalBanner));
  
  await typeEffect(chalk.magenta(`[⚙️] Minecraft Raid System v${VERSION} - BY DRAVIN`), 15);
  animasiGaris();
  await typeEffect(chalk.green("• Jangan disalahgunakan, tanggung sendiri resikonya"), 5);
  await typeEffect(chalk.yellow("• Ketik exit/quit/keluar/q untuk keluar"), 5);
  await typeEffect(chalk.cyan("• Pastikan Minecraft Bedrock Edition terbuka"), 5);
  animasiGaris();
  
  // Tampilkan info sistem
  console.log(chalk.blue(`\n💻 Sistem: ${os.type()} ${os.release()} | 🖥️  CPU: ${os.cpus()[0].model}`));
  console.log(chalk.blue(`🌐 Alamat IP: ${getLocalIP()}:${WS_PORT}`));
};

// Fungsi login
const login = async () => {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    console.log(chalk.cyan('\n ┌─╼') + chalk.red('[LOGIN') + chalk.hex('#FFA500')('🔐') + chalk.red('SYSTEM]'));
    console.log(chalk.cyan(' ├──╼') + chalk.yellow('Masukkan kredensial untuk mengakses tools'));
    
    const username = await question(
      chalk.cyan(' ├──╼') + chalk.yellow('Username: ') + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
    );
    
    const password = await question(
      chalk.cyan(' └──╼') + chalk.yellow('Password: ') + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ '),
      true
    );
    
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      console.log(chalk.green('\n[✓] Login berhasil!'));
      await progressBar("Mengakses tools", 15);
      return true;
    } else {
      attempts++;
      console.log(chalk.red(`\n[✗] Login gagal! Percobaan ${attempts}/${maxAttempts}`));
      if (attempts >= maxAttempts) {
        console.log(chalk.red('[!] Terlalu banyak percobaan gagal. Keluar...'));
        await progressBar("Membersihkan sistem", 10, 150);
        process.exit(1);
      }
    }
  }
};

// Fungsi utama WebSocket
const startWebSocketServer = () => {
  const wss = new WebSocket.Server({ port: WS_PORT });
  let isConnected = false;
  let isRunning = true;
  let successCount = 0;
  let failCount = 0;

  wss.on('connection', (ws) => {
    isConnected = true;
    console.log(chalk.green('\n🎮 Minecraft terhubung! Memulai raid system...'));
    console.log(chalk.cyan(`📊 Total perintah yang akan dieksekusi: ${commands.length}`));

    let currentIndex = 0;
    const pending = new Map();

    const sendCommand = (cmd) => {
      if (!isRunning) return;
      
      const requestId = `cmd-${Date.now()}-${currentIndex}`;
      const packet = {
        header: {
          version: 1,
          requestId,
          messagePurpose: "commandRequest",
          messageType: "commandRequest"
        },
        body: {
          version: 1,
          commandLine: cmd,
          origin: { type: "server" }
        }
      };
      
      try {
        ws.send(JSON.stringify(packet));
        pending.set(requestId, cmd);
        
        console.log(
          `📤 ${chalk.cyan(`[${currentIndex + 1}/${commands.length}]`)} ` +
          chalk.green(cmd.substring(0, 50) + (cmd.length > 50 ? "..." : ""))
        );
      } catch (err) {
        // Jika error mengirim, stop execution
        isRunning = false;
      }
    };

    const executeCommands = async () => {
      for (let i = 0; i < commands.length && isRunning; i++) {
        sendCommand(commands[i]);
        currentIndex = i;
        await sleep(100);
        
        // Cek jika koneksi masih aktif
        if (ws.readyState !== WebSocket.OPEN) {
          isRunning = false;
          break;
        }
      }

      if (isRunning) {
        console.log(chalk.yellow('\n✅ Semua perintah telah dikirim!'));
        console.log(chalk.green(`✓ Berhasil: ${successCount} | ✗ Gagal: ${failCount}`));
        console.log(chalk.cyan('⏳ Menunggu server/world dimatikan...'));
      }
    };

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.header.messagePurpose === "commandResponse") {
          const { requestId } = data.header;
          const { statusCode } = data.body;
          const cmd = pending.get(requestId);
          if (!cmd) return;

          if (statusCode === 0) {
            console.log(chalk.gray(`   ✅ OK: ${cmd.substring(0, 30)}...`));
            successCount++;
          } else {
            console.log(chalk.red(`   ⚠️ Gagal: ${cmd.substring(0, 30)}...`));
            failCount++;
          }
          
          pending.delete(requestId);
        }
      } catch (err) {
        // Ignore parse errors
      }
    });

    executeCommands();

    ws.on('close', () => {
      console.log(chalk.red('\n❌ Koneksi terputus - Server/World dimatikan'));
      console.log(chalk.green('🎉 Raid berhasil dilakukan!'));
      console.log(chalk.green(`📊 Statistik: ${successCount} berhasil, ${failCount} gagal`));
      isConnected = false;
      isRunning = false;
      
      // Tampilkan pesan penutup
      setTimeout(() => {
        console.log(chalk.cyan('\n✨ Terima kasih telah menggunakan tools ini!'));
        console.log(chalk.yellow('👋 Sampai jumpa lagi...'));
        wss.close();
        process.exit(0);
      }, 2000);
    });

    ws.on('error', (err) => {
      console.log(chalk.red('\n⚠️ Error koneksi:'), err.message);
      isRunning = false;
    });
  });

  // Copy connect command to clipboard
  const connectCommand = `/connect ${getLocalIP()}:${WS_PORT}`;
  copyToClipboard(connectCommand).then(() => {
    console.log(chalk.green(`\n🚀 Server Raid Ready!`));
    console.log(chalk.cyan('📋 Perintah koneksi telah disalin ke clipboard:'));
    console.log(chalk.yellow(`   ${connectCommand}`));
    console.log(chalk.cyan('\n⏳ Menunggu koneksi dari Minecraft...'));
  }).catch(err => {
    console.log(chalk.yellow('\n⚠️ Tidak bisa menyalin ke clipboard, salin manual:'));
    console.log(chalk.yellow(`   ${connectCommand}`));
  });
  
  // Handle server shutdown
  process.on('SIGINT', () => {
    console.log(chalk.red('\n\n⚠️  Server dihentikan manual'));
    console.log(chalk.yellow('🛑 Menghentikan proses raid...'));
    isRunning = false;
    wss.close();
    process.exit(0);
  });
};

// Fungsi utama
const main = async () => {
  try {
    await showBanner();
    const isLoggedIn = await login();
    
    if (isLoggedIn) {
      await progressBar("Memulai Server Raid", 20);
      startWebSocketServer();
    }
  } catch (error) {
    console.error(chalk.red('\n💥 Terjadi error:'), error.message);
    console.log(chalk.yellow('🔄 Restart aplikasi jika masalah berlanjut'));
    process.exit(1);
  }
};

// Jalankan aplikasi
main();
