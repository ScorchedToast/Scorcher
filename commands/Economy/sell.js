const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const fs = require("fs");

const requiredPerms = {
  type: "flags",
  key: [PermissionFlagsBits.SendMessages],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item from your inventory")
    .addIntegerOption((option) =>
      option
        .setName("item")
        .setDescription("The item to sell")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to sell")
        .setRequired(false)
    ),
  async execute(interaction) {
    const item = interaction.options.getInteger("item");
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
    const object = data.Inventory.find((object) => object.num === item);
    if (!object) {
      return interaction.reply({
        content: "🚫 You do not the have the item you are trying to sell",
        ephemeral: true,
      });
    } else {
      fs.readFile("./docs/shopitems.json", (err, shopItemsData) => {
        if (err) throw err;
        const shopItems = JSON.parse(shopItemsData);

        if (item > shopItems.length) {
          return interaction.reply({
            content: "🚫 That item does not exist",
            ephemeral: true,
          });
        } else {
          if (object.amount < amount) {
            return interaction.reply({
              content: "🚫 You do not have enough of that item",
              ephemeral: true,
            });
          } else {
            const price = object.price;
            const total = price * amount;

            object.amount -= amount;
            if (object.amount === 0) {
              data.Inventory.splice(data.Inventory.indexOf(object), 1);
            }

            data.Inventory = data.Inventory.filter(
              (object) => object.amount > 0
            );
            data.Wallet += total;
            data.save();

            const sellEmbed = new EmbedBuilder()
              .setTitle("Sell")
              .setDescription(
                `You sold ${amount} ${shopItems[item - 1].name} for ₳${total}`
              )
              .setColor(0x00ff00);

            return interaction.reply({
              embeds: [sellEmbed],
            });
          }
        }
      });
    }
  },
  requiredPerms: requiredPerms,
};
