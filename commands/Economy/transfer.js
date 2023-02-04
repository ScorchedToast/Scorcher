const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const EconomySchema = require("../../models/EconomyModel");
const fs = require("fs");

const requiredBotPerms = {
  type: "flags",
  key: [],
};

const requiredUserPerms = {
  type: "flags",
  key: [],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer Bobbucks or items to another user")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bobbucks")
        .setDescription("Transfer Bobbucks to another user")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of Bobbucks to transfer")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(99999)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to transfer Bobbucks to")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("item")
        .setDescription("Transfer an item to another user")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The name of the item to transfer")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to transfer the item to")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user");

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "bobbucks") {
      const amount = interaction.options.getInteger("amount");
      if (target.id === interaction.user.id) {
        return interaction.reply({
          content: ":wrench: Unable to transfer bobbucks to yourself",
          ephemeral: true,
        });
      }
      if (target.bot) {
        return interaction.reply({
          content: ":wrench: Unable to transfer bobbucks to a bot",
          ephemeral: true,
        });
      }

      const userData = await EconomySchema.findOne({
        UserId: interaction.user.id,
      });
      let targetData = await EconomySchema.findOne({
        UserId: target.id,
      });

      if (!userData || userData.Wallet < amount) {
        return interaction.reply({
          content: ":wrench: You don't have this much bobbucks in your wallet",
          ephemeral: true,
        });
      }

      if (targetData) {
        userData.Wallet -= amount;
        userData.NetWorth -= amount;
        await userData.save();
        targetData.Wallet += amount;
        targetData.NetWorth += amount;
        await targetData.save();
      } else {
        targetData = new EconomySchema({
          UserId: target.id,
          Wallet: amount,
          Bank: 0,
          NetWorth: amount,
        });
        await targetData.save();
        userData.Wallet -= amount;
        userData.NetWorth -= amount;
        await userData.save();
      }
      return interaction.reply({
        content: `💰 Successfully transferred ₳${amount} bobbucks to ${target.tag}`,
        ephemeral: true,
      });
    } else if (subcommand === "item") {
      const itemName = interaction.options.getString("item");

      const itemsJSON = JSON.parse(fs.readFileSync("./docs/items.json"));

      const item = itemsJSON.find((i) => i.name === itemName);
      if (!item) {
        return interaction.reply({
          content: `:wrench: Unable to find item of \`${itemName}\``,
          ephemeral: true,
        });
      }

      const userData = await EconomySchema.findOne({
        UserId: interaction.user.id,
      });

      const userItem = userData.Inventory.find((i) => i.name === itemName);
      if (!userItem) {
        return interaction.reply({
          content: ":wrench: You don't own this item",
          ephemeral: true,
        });
      }

      let targetData = await EconomySchema.findOne({
        UserId: target.id,
      });

      if (targetData) {
        const itemId = item.id;

        const itemIndex = targetData.Inventory.findIndex(
          (item) => item.id === itemId
        );

        if (itemIndex !== -1) {
          let item = targetData.Inventory[itemIndex];
          item.amount++;
          targetData.Inventory[itemIndex] = item;
        } else {
          targetData.Inventory.push(itemName);
        }
      } else {
        targetData = new EconomySchema({
          UserId: target.id,
          Wallet: 0,
          Bank: 0,
          NetWorth: 0,
          Inventory: [
            {
              name: item.name,
              description: item.description,
              type: item.type,
              sellable: item.sellable,
              buyable: item.buyable,
              useable: item.useable,
              price: item.price,
              id: item.id,
              amount: 1,
            },
          ],
        });
      }
      targetData.save();
      userData.Inventory.splice(userData.Inventory.indexOf(itemName), 1);
      userData.save();

      return interaction.reply({
        content: `:gift: Successfully transferred \`${itemName}\` to ${target.tag}`,
        ephemeral: true,
      });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
