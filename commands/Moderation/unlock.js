const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const {
  raiseUserPermissionsError,
  raiseBotPermissionsError,
} = require("../../functions/returnError.js");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("unlock the current channel"),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
      return raiseUserPermissionsError(interaction, "MANAGE_CHANNELS");

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    )
      return raiseBotPermissionsError(interaction, "MANAGE_CHANNELS");

    const modRole = interaction.guild.roles.cache.find((role) =>
      ["moderator", "mod", "Moderator", "Mod"].includes(role.name)
    );
    const helperRole = interaction.guild.roles.cache.find((role) =>
      ["helper", "Helper"].includes(role.name)
    );

    interaction.channel.permissionOverwrites
      .edit(interaction.guild.id, {
        SendMessages: null,
      })
      .catch((err) => {
        console.error(err);
      });
    if (!(typeof modRole === "undefined")) {
      interaction.channel.permissionOverwrites.edit(modRole, {
        SendMessages: null,
      });
    }
    if (!(typeof helperRole === "undefined")) {
      interaction.channel.permissionOverwrites.edit(helperRole, {
        SendMessages: null,
      });
    }

    interaction.reply({
      content: `:unlock: Channel unlocked!`,
      ephemeral: true,
    });
  },
  requiredPerms: requiredPerms,
};
