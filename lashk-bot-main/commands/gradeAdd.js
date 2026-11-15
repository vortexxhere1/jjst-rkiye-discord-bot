const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gradeadd')
        .setDescription('Sisteme yeni bir grade kaydı ekler.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Kayıt açılacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grade')
                .setDescription('Atanacak derece')
                .setRequired(true)
                .addChoices(
                    { name: 'Special Grade', value: 'Special Grade' },
                    { name: 'Grade 1', value: 'Grade 1' },
                    { name: 'Grade 2', value: 'Grade 2' },
                    { name: 'Grade 3', value: 'Grade 3' },
                    { name: 'Grade 4', value: 'Grade 4' },
                    { name: 'Grade 5', value: 'Grade 5' }
                ))
        .addStringOption(option =>
            option.setName('modifier')
                .setDescription('Modifier seviyesi')
                .setRequired(true)
                .addChoices(
                    { name: 'Low', value: 'Low' },
                    { name: 'Mid', value: 'Mid' },
                    { name: 'High', value: 'High' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const member = interaction.options.getMember('member');
        const grade = interaction.options.getString('grade');
        const modifier = interaction.options.getString('modifier');

        // Burada veri tabanına kayıt işlemi yapılabilir (MongoDB vb.)
        const embed = new EmbedBuilder()
            .setTitle('JJS Türkiye | Grade Kaydı Eklendi')
            .setColor(0x2b2d31)
            .addFields(
                { name: 'Kullanıcı', value: `${member}`, inline: true },
                { name: 'Derece', value: grade, inline: true },
                { name: 'Modifier', value: modifier, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: '✅ Grade kaydı başarıyla oluşturuldu!', embeds: [embed] });
    },
};