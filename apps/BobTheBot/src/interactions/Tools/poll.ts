import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.AddReactions] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [PermissionFlagsBits.ManageMessages] as const,
};

const command = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Start a poll")
  .addStringOption((option) =>
    option.setName("message").setDescription("message to display on the poll").setRequired(true)
  );

for (let i = 1; i <= 9; i++) {
  command.addStringOption((option) =>
    option
      .setName(`option${i}`)
      .setDescription(`Add a poll option (min 2 max 9)`)
      .setRequired(i <= 2 ? true : false)
  );
}

command.setDefaultMemberPermissions(...requiredUserPerms.key).setDMPermission(false);

module.exports = {
  data: command,
  cooldownTime: 20 * 1000,
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const message = interaction.options.getString("message");
    const option1 = interaction.options.getString("option1");
    const option2 = interaction.options.getString("option2");
    const option3 = interaction.options.getString("option3");
    const option4 = interaction.options.getString("option4");
    const option5 = interaction.options.getString("option5");
    const option6 = interaction.options.getString("option6");
    const option7 = interaction.options.getString("option7");
    const option8 = interaction.options.getString("option8");
    const option9 = interaction.options.getString("option9");
    const options = [option1, option2, option3, option4, option5, option6, option7, option8, option9];
    const optionsFiltered = options.filter((option) => option !== null);

    const pollEmbed = new EmbedBuilder()
      .setColor(interaction.guild.members.me?.displayHexColor ?? Color.DiscordPrimary)
      .setTitle(`${message}`)
      .addFields(
        {
          name: `Option 1`,
          value: `${option1} :one:`,
          inline: true,
        },
        {
          name: `Option 2`,
          value: `${option2} :two:`,
          inline: true,
        },
        {
          name: `Option 3`,
          value: `${option3} :three:`,
          inline: true,
        },
        {
          name: `Option 4`,
          value: `${option4} :four:`,
          inline: true,
        },
        {
          name: `Option 5`,

          value: `${option5} :five:`,
          inline: true,
        },
        {
          name: `Option 6`,
          value: `${option6} :six:`,
          inline: true,
        },
        {
          name: `Option 7`,
          value: `${option7} :seven:`,
          inline: true,
        },
        {
          name: `Option 8`,
          value: `${option8} :eight:`,
          inline: true,
        },
        {
          name: `Option 9`,
          value: `${option9} :nine:`,
          inline: true,
        }
      )
      .setTimestamp();

    for (let i = 9; i > optionsFiltered.length; i--) {
      pollEmbed.spliceFields(-1, 1);
    }

    const reactions = ["", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

    const interactionMessage = await interaction.reply({
      embeds: [pollEmbed],
      fetchReply: true,
    });
    for (let i = 1; i <= optionsFiltered.length; i++) {
      if (reactions[i]) interactionMessage.react(reactions[i]!);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
