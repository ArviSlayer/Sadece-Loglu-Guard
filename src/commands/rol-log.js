const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js")
const db = require("croxydb")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rol-log")
    .setDescription("Rol Silinmesi Durumunda Belirtilen Kanala Mesaj Atar")
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator)
    .addChannelOption(o=> o.setName("kanal").setDescription("LOG Kanal Belirtmelisin").setRequired(true)),

    run: async (client, interaction) => {
const channel = interaction.options.getChannel("kanal")
db.set(`rollog_${interaction.guild.id}`, channel.id)
return interaction.reply("**[ArviS#0011]** Kanal Ayarlandı: (<#"+channel.id+">)")}
};
