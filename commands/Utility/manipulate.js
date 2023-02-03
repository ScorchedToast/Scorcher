const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { roleColor } = require("../../utils/roleColor");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manipulate")
    .setDescription("Manipulates text")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reverse")
        .setDescription("Reverse text")
        .addStringOption((option) =>
          option
            .setName("input")
            .setDescription("Text to reverse")
            .setRequired(true)
            .setMaxLength(1024)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ascii")
        .setDescription("Convert text to ASCII")
        .addStringOption((option) =>
          option
            .setName("input")
            .setDescription("Text to convert")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("vowel")
        .setDescription("Remove vowels from text")
        .addStringOption((option) =>
          option
            .setName("input")
            .setDescription("Text to remove vowels from")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("1337")
        .setDescription("Convert text to 1337 (leet)")
        .addStringOption((option) =>
          option
            .setName("input")
            .setDescription("Text to convert")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const text = interaction.options.getString("input");

    switch (subcommand) {
      case "reverse":
        return interaction.reply({
          content: `${text.split("").reverse().join("")}`,
          ephemeral: true,
        });
      case "ascii":
        return interaction.reply({
          content: `${text
            .split("")
            .map((c) => c.charCodeAt(0))
            .join(" ")}`,
          ephemeral: true,
        });
      case "vowel":
        return interaction.reply({
          content: `${text.replace(/[aeiou]/gi, "")}`,
          ephemeral: true,
        });
      case "1337":
        const embed = new EmbedBuilder()
          .addFields(
            {
              name: "1337 C0NV3R73R",
              value: `\`\`\`fix\nINPUT = ${text}\`\`\``,
              inline: false,
            },
            {
              name: "\u200b",
              value: `\`\`\`fix\n0U7PU7 = ${text
                .replace(/a/gi, "4")
                .replace(/e/gi, "3")
                .replace(/i/gi, "1")
                .replace(/o/gi, "0")
                .replace(/s/gi, "5")
                .replace(/t/gi, "7")}\`\`\``,
              inline: false,
            }
          )
          .setColor(roleColor(interaction));

        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      default:
        return interaction.reply({
          content: "Unknown subcommand",
          ephemeral: true,
        });
    }
  },
  requiredPerms: requiredPerms,
};
