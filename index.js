require("dotenv").config(); // to be removed when we switch over to git based keys

const Discord = require("discord.js");
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.on("ready", () => {
  console.info("Logged in as {bot.user.tag}!");
});

bot.login(TOKEN);
