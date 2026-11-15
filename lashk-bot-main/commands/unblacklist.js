const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const BLACKLIST_ROLE_ID = '1568285958183592058';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblacklist')
        .setDescription('Belirtilen kullanıcının blacklist (kara liste) rolünü kaldırır.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Blacklist rolü kaldırılacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Blacklistin kaldırılma sebebi')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const member = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason') || 'Belirtilmedi';

        const role = interaction.guild.roles.cache.get(BLACKLIST_ROLE_ID);

        if (!role) {
            return interaction.editReply({ content: '❌ Blacklist rolü sunucuda bulunamadı veya ID hatalı!' });
        }

        if (!member.roles.cache.has(BLACKLIST_ROLE_ID)) {
            return interaction.editReply({ content: '❌ Bu kullanıcı zaten blacklistte değil!' });
        }

        try {
            await member.roles.remove(role);
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: '❌ Rol kaldırılırken bir hata oluştu (Yetki veya sıralama sorunu)!' });
        }

        const embed = new EmbedBuilder()
            .setTitle('JJS Türkiye | Blacklist Kaldırıldı')
            .setColor(0x2b2d31)
            .addFields(
                { name: 'Affedilen Üye', value: `${member}`, inline: true },
                { name: 'Yetkili', value: `${interaction.user}`, inline: true },
                { name: 'Sebep', value: reason, inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ content: '✅ Kullanıcının blacklist rolü başarıyla kaldırıldı!', embeds: [embed] });
    },
};