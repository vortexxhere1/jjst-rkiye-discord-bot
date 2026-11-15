const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gradedelete')
        .setDescription('Kullanıcının grade kaydını siler.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Kaydı silinecek kullanıcı')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const member = interaction.options.getMember('member');

        const embed = new EmbedBuilder()
            .setTitle('JJS Türkiye | Grade Kaydı Silindi')
            .setColor(0x2b2d31)
            .addFields(
                { name: 'Kullanıcı', value: `${member}`, inline: true },
                { name: 'İşlemi Yapan', value: `${interaction.user}`, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: '✅ Kullanıcının grade kaydı sistemden silindi!', embeds: [embed] });
    },
};