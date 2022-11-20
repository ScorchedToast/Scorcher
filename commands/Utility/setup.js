const { SlashCommandBuilder } = require("@discordjs/builders");
const GuildSchema = require("../../models/GuildModel");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Set up the bot for your server"),
  async execute(interaction) {
    let data = await GuildSchema.findOne({
      GuildId: interaction.guild.id,
    });

    let GuildLogChannelResponse;

    if (data) {
      GuildLogChannelResponse = `<#${data.GuildLogChannel}>`;
    }

    if (!data) {
      GuildLogChannelResponse = "Not set";
      data = new GuildSchema({
        GuildId: interaction.guild.id,
        GuildLogChannel: "Not set",
      });
      data.save();
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(0xffbd67)
      .setTitle(`Current server data`)
      .addFields(
        {
          name: `Guild ID`,
          value: `${data.GuildId}`,
          inline: true,
        },
        {
          name: `Guild log channel`,
          value: `${GuildLogChannelResponse}`,
          inline: true,
        }
      )
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId("full-setup")
      .setLabel("Full Setup")
      .setStyle(ButtonStyle.Primary);

    interaction.reply({
      embeds: [replyEmbed],
      components: [new ActionRowBuilder().addComponents(button)],
    });
  },
};
