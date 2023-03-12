import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Sends a random meme from r/memes")
    .setDMPermission(true),
  async execute(interaction: ChatInputCommandInteraction) {
    const data = await fetch(`https://www.reddit.com/r/memes/random/.json`).then(async (res) => {
      return res.json();
    });

    const title = data[0].data.children[0].data.title;
    const image = data[0].data.children[0].data.url;
    const author = data[0].data.children[0].data.author;

    const replyEmbed = new EmbedBuilder()
      .setTitle(title)
      .setURL(`https://reddit.com/r/memes`)
      .setImage(image)
      .setFooter({ text: `Posted by u/${author}` })
      .setColor(Color.DiscordSuccess)
      .setTimestamp();

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  },
  requiredBotPerms,
  requiredUserPerms,
};
