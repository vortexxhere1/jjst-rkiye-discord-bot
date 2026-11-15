const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const GRADES = {
    "Special Grade": "1567183667405783180",
    "Grade 1": "1567183668055904286",
    "Grade 2": "1567183668903026760",
    "Grade 3": "1567183669242626078",
    "Grade 4": "1567184044230451311",
    "Grade 5": "1567184044788293732",
};

const MODIFIERS = {
    "Low": "1567184972538708099",
    "Mid": "1567184046239514704",
    "High": "1567184045367099464",
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('graderesult')
        .setDescription('Bir üyenin test sonucunu girerek derece ve modifier rollerini verir.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Derecesi verilecek kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grade')
                .setDescription('Kullanıcının ana derecesi')
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
                .setDescription('Kullanıcının derece seviyesi (Low/Mid/High)')
                .setRequired(true)
                .addChoices(
                    { name: 'Low', value: 'Low' },
                    { name: 'Mid', value: 'Mid' },
                    { name: 'High', value: 'High' }
                ))
        .addStringOption(option =>
            option.setName('note')
                .setDescription('Test hakkında opsiyonel not')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const member = interaction.options.getMember('member');
        const gradeChoice = interaction.options.getString('grade');
        const modifierChoice = interaction.options.getString('modifier');
        const note = interaction.options.getString('note') || 'Belirtilmedi';

        const gradeRoleId = GRADES[gradeChoice];
        const modifierRoleId = MODIFIERS[modifierChoice];

        const gradeRole = interaction.guild.roles.cache.get(gradeRoleId);
        const modifierRole = interaction.guild.roles.cache.get(modifierRoleId);

        if (!gradeRole || !modifierRole) {
            return interaction.editReply({ content: '❌ Belirtilen roller sunucuda bulunamadı veya ID\'ler hatalı!' });
        }

        try {
            await member.roles.add([gradeRole, modifierRole]);
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: '❌ Botun bu rolleri vermeye yetkisi yok (Rol sıralaması veya yetki hatası)!' });
        }

        const embed = new EmbedBuilder()
            .setTitle('JJS Türkiye | Grade Result')
            .setColor(0x2b2d31)
            .addFields(
                { name: 'Değerlendirilen Üye', value: `${member}`, inline: true },
                { name: 'Değerlendiren Yetkili', value: `${interaction.user}`, inline: true },
                { name: 'Atanan Derece', value: `${gradeRole}`, inline: false },
                { name: 'Modifier', value: `${modifierRole}`, inline: true },
                { name: 'Not', value: note, inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ content: '✅ Test sonucu başarıyla işlendi ve roller verildi!', embeds: [embed] });
    },
};