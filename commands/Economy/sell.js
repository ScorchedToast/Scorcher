const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const fs = require("fs");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item from your inventory")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bulk")
        .setDescription("Sell multiple items from your inventory")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The item you want to sell")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option

            .setName("amount")
            .setDescription("The amount of items you want to sell")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("single")
        .setDescription("Sell a single item from your inventory")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The item you want to sell")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    const amount = interaction.options.getInteger("amount") ?? 1;

    const data = await EconomySchema.findOne({
      userId: interaction.user.id,
    });

    if (!data) {
      return interaction.reply({
        content: "🚫 You do not the have the item you are trying to sell",
        ephemeral: true,
      });
    }
    const object = data.Inventory.find(
      (object) => object.id === item.toLowerCase().replace(/\s+/g, "")
    );
    if (!object) {
      return interaction.reply({
        content: "🚫 You do not the have the item you are trying to sell",
        ephemeral: true,
      });
    }
    if (object.amount < amount) {
      return interaction.reply({
        content: "🚫 You do not have enough of the item you are trying to sell",
        ephemeral: true,
      });
    }

    fs.readFile("./docs/items.json", (err, itemsData) => {
      if (err) throw err;
      const itemsJSON = JSON.parse(itemsData);

      const itemObject = itemsJSON.find((item) => item.id === object.id);

      if (object.amount === amount) {
        data.Inventory.splice(data.Inventory.indexOf(object), 1);
      } else {
        object.amount -= amount;
      }

      data.Wallet += itemObject.price * amount;
      data.save();

      const embed = new EmbedBuilder()
        .setTitle("Item Sold")
        .setDescription(
          `You sold ${amount} ${itemObject.name} for ${
            itemObject.price * amount
          } coins`
        )
        .setColor("#00FF00")
        .setTimestamp();

      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    });
  },
  requiredBotPerms: requiredBotPerms,
};
