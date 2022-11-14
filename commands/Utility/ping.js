const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Returns the bots's latency"),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
      ephemeral: true,
    });
    await interaction.editReply(
      `Websocket heartbeat: \`${
        interaction.client.ws.ping
      }ms\`.\nRountrip Latency: \`${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms\``
    );
  },
};
