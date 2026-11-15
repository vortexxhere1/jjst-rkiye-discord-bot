const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

// Sabit ID'ler
const TICKET_CHANNEL_ID = '1567559609483272263';
const TICKET_LOG_CHANNEL_ID = '1567559668836991136';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketsetup')
        .setDescription('JJS Türkiye ticket (destek) panelini kurar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.guild.channels.cache.get(TICKET_CHANNEL_ID);
        if (!channel) {
            return interaction.editReply({ content: '❌ Belirtilen ticket kanal ID\'si sunucuda bulunamadı!' });
        }

        const embed = new EmbedBuilder()
            .setTitle('JJS Türkiye | Destek Merkezi')
            .setDescription('Sunucumuzla ilgili bir sorun yaşarsanız, destek talebi oluşturmak için aşağıdaki menüden ilgili kategoriyi seçebilirsiniz.')
            .setColor(0x2b2d31)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_menu')
                .setPlaceholder('Destek kategorisi seçin...')
                .addOptions([
                    {
                        label: 'Genel Destek',
                        description: 'Genel sorularınız ve yardımlar için.',
                        value: 'ticket_general',
                        emoji: '🎫'
                    },
                    {
                        label: 'Yetkili Başvurusu',
                        description: 'Ekibimize katılmak için başvuru yapın.',
                        value: 'ticket_staff',
                        emoji: '🛡️'
                    },
                    {
                        label: 'Ban Appeal (İtiraz)',
                        description: 'Aldığınız cezalar veya banlar için itiraz talebi.',
                        value: 'ticket_ban_appeal',
                        emoji: '⚖️'
                    },
                    {
                        label: 'Şikayet & Öneri',
                        description: 'Görüşlerinizi ve şikayetlerinizi bildirin.',
                        value: 'ticket_report',
                        emoji: '📢'
                    }
                ])
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply({ content: `✅ Ticket paneli başarıyla <#${TICKET_CHANNEL_ID}> kanalına gönderildi!` });
    },
};