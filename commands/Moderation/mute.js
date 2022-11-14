const InfractionsSchema = require("../../models/InfractionsModel");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Puts a user in timeout for a certain amount of time")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("member to mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason to mute")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription(
          "duration of the mute in hours (default set to 12 hours)"
        )
        .setAutocomplete(true)
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");
    let duration = interaction.options.getInteger("duration");

    if (duration === null) {
      duration = 12;
    }

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(duration * 60 * 1000 * 60, reason);

    let data = await InfractionsSchema.findOne({
      GuildId: interaction.guild.id,
      UserId: user.id,
    });

    if (data) {
      data.Punishments.unshift({
        PunishType: "MUTE",
        Reason: reason,
      });
      data.save();
    } else if (!data) {
      let newData = new InfractionsSchema({
        GuildId: interaction.guild.id,
        UserId: user.id,
        Punishments: [
          {
            PunishType: "MUTE",
            Reason: reason,
          },
        ],
      });
      newData.save();
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(0xff8355)
      .setTitle("User muted")
      .setDescription(
        `Target: ${user}\nReason: ${reason}\nDuration: ${duration} hours`
      )
      .setTimestamp();

    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
