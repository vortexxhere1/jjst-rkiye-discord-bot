const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[UYARI] ${filePath} dosyasındaki komutta 'data' veya 'execute' eksik.`);
    }
}

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const rest = new REST().setToken(TOKEN);

(async () => {
    try {
        console.log(`🚀 Toplam ${commands.length} adet komut Discord'a yükleniyor...`);

        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ BAŞARILI! ${data.length} adet komut yüklendi!`);
    } catch (error) {
        console.error(error);
    }
})();