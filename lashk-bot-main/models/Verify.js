const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const axios = require('axios');
const { PendingVerify, VerifiedUser } = require('../models/Verify');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Roblox doğrulama sistemi yönetimi.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Kanalda sabit doğrulama paneli oluşturur. (Yönetici)')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({ content: '❌ Bu komutu kullanmak için Yönetici yetkin olmalı!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('🎮 ROBLOX DOĞRULAMA SİSTEMİ')
                .setColor('#00a2ff')
                .setDescription(
                    'Sunucumuzda özel roller alabilmek ve hesabını doğrulamak için aşağıdaki **"Doğrula"** butonuna tıkla!\n\n' +
                    '📌 Açılan pencereye Roblox kullanıcı adını yazarak adımları takip edebilirsin.'
                )
                .setFooter({ text: 'JJS Türkiye • Güvenli Doğrulama Sistemi' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_verify_modal')
                    .setLabel('✅ Doğrula')
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.reply({ content: '✅ Doğrulama paneli bu kanala gönderiliyor...', ephemeral: true });
            return interaction.channel.send({ embeds: [embed], components: [row] });
        }
    },

    // Butona basıldığında açılacak Modal (Form)
    async handleButton(interaction) {
        if (interaction.customId === 'btn_open_verify_modal') {
            const discordUserId = interaction.user.id;

            const isAlreadyVerified = await VerifiedUser.findOne({ userId: discordUserId });
            if (isAlreadyVerified) {
                return interaction.reply({
                    content: `❌ Zaten **${isAlreadyVerified.robloxUsername}** olarak doğrulanmış bir hesabın var!`,
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId('verify_modal')
                .setTitle('Roblox Doğrulama');

            const robloxInput = new TextInputBuilder()
                .setCustomId('roblox_username_input')
                .setLabel('Roblox Kullanıcı Adın')
                .setPlaceholder('Örn: ProPlayer123')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(robloxInput));
            return interaction.showModal(modal);
        }
    },

    // Modal doldurulup gönderildiğinde çalışacak kısım
    async handleModal(interaction) {
        if (interaction.customId === 'verify_modal') {
            await interaction.deferReply({ ephemeral: true });

            const robloxUsername = interaction.fields.getTextInputValue('roblox_username_input');
            const discordUserId = interaction.user.id;

            try {
                const userSearchRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
                    usernames: [robloxUsername],
                    excludeBannedUsers: true
                });

                if (!userSearchRes.data.data || userSearchRes.data.data.length === 0) {
                    return interaction.editReply({
                        content: `❌ **${robloxUsername}** adında bir Roblox hesabı bulunamadı!`
                    });
                }

                const robloxUser = userSearchRes.data.data[0];
                const robloxId = robloxUser.id;
                const actualRobloxName = robloxUser.name;

                const safeWords = ['apple', 'ball', 'blue', 'cat', 'desk', 'pen', 'tree', 'sea', 'star', 'book', 'game', 'robot'];
                const word1 = safeWords[Math.floor(Math.random() * safeWords.length)];
                const word2 = safeWords[Math.floor(Math.random() * safeWords.length)];
                const randomNum = Math.floor(Math.random() * 900) + 100;
                const randomCode = `${word1}-${word2}-${randomNum}`;

                await PendingVerify.findOneAndUpdate(
                    { userId: discordUserId },
                    { robloxUsername: actualRobloxName, robloxId, code: randomCode },
                    { upsert: true, new: true }
                );

                const embed = new EmbedBuilder()
                    .setTitle('🎮 ROBLOX HESAP DOĞRULAMA')
                    .setColor('#00a2ff')
                    .setDescription(
                        `### 1️⃣ Profiline Git:\n` +
                        `🔗 **[Buraya Tıklayarak Profilini Aç](https://www.roblox.com/users/${robloxId}/profile)**\n\n` +
                        `### 2️⃣ Kodu Hakkında (About) Kısmına Ekle:\n` +
                        `Aşağıdaki kodu Roblox profilinin **Hakkında** bölümüne yapıştır:\n\n` +
                        `# \`\`\`${randomCode}\`\`\`\n` +
                        `### 3️⃣ Tamamlama:\n` +
                        `Kodu ekledikten sonra aşağıdaki **"Onayla ve Bitir"** butonuna tıkla!`
                    )
                    .setFooter({ text: '⏰ Bu kod 10 dakika geçerlidir.' });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_verify_check')
                        .setLabel('✅ Onayla ve Bitir')
                        .setStyle(ButtonStyle.Success)
                );

                return interaction.editReply({ embeds: [embed], components: [row] });

            } catch (error) {
                console.error('Verify Modal Error:', error);
                return interaction.editReply({
                    content: '❌ Roblox API ile iletişim kurulurken bir hata oluştu.'
                });
            }
        }
    }
};