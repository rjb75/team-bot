//=============================
//Discord API credentials
//=============================

require("dotenv").config(); // to be removed when we switch over to git based keys

const fs = require('fs'); // use fs to help with handling of other files
const Discord = require("discord.js");
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

//=============================
// Points commandFiles to the commands directory
//=============================
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
  const command = require(`./commands/${file}`); // finds command files
  bot.commands.set(command.name, command); // adds a command
}

//=============================
//Bot On (This is setting the config of the bot when it is ready)
//=============================

bot.on("ready", () => {
  bot.user.setUsername("HYL Bot | [BETA]");
  console.info(`Logged in as ${bot.user.tag}!`);
  bot.user.setActivity("on node.js", {type: "PLAYING"});
});

//=============================
//When a member joins, add "Looking For Team" and "Unverified" Roles, the server should already have a "looking for team and unverified role"
//=============================
bot.on('guildMemberAdd', member => {
  
  var role = member.guild.roles.cache.find(role => role.name === 'Looking For Team'); //Adds Looking For Team upon joining
  var role2 = member.guild.roles.cache.find(role => role.name === 'Unverified'); //Adds Unverified Upon Joining
  member.roles.add(role);
  member.roles.add(role2);
    
});

//=============================
//Google Sheets API 
//=============================

const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client-secret.json');

// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('1hoTYv-70ggXe0ucVpecz0zr_Sq9ahxcFYC8dvAq3cYY');

//=============================
//System Configs
//=============================
let VerificationRoleName = "Verified"; //Change this to the name of the Verified Role
let VerificationChannelId = "802635185040261180"; //Change this to channel id of the verification channel (Where users input their commands)
const prefix = "!" //Change this to the prefix of your commands

//=============================
//User Defined Functions
//=============================

//[verifyId()] - This Function is a helper function for verifyUser and actually accesses the spreadsheet contents of a specific row based on the code and returns them to verifyUser
async function verifyId(verification_code) {
  await doc.useServiceAccountAuth({
    client_email: creds.client_email,
    private_key: creds.private_key,
  });

  await doc.loadInfo(); // loads document properties and worksheets
  
  const sheet = doc.sheetsByIndex[0]; // Grabs the first sheet in the spreadsheet
  const rows = await sheet.getRows(); // Grabs all the rows in the spreadsheet

  const targetRow = rows.filter(row => row.VerificationKey === verification_code)[0] //Gets the row that exactly matches the verification code

  //Mark as verified if not verified and a valid ID
  if(targetRow && targetRow.SignedIn === "No"){
    targetRow.SignedIn = "Yes"; //Checks in person if not already checked in, if they are already checked in, it will handle the exception later..
    await targetRow.save();
    targetRow.SignedIn = "No"; //Weird code bug I gotta fix but this fixes initial validation problem lol
  }
  return targetRow; //Return Row Object

}

//====================================================================================================

//[verifyUser()] - This function calls the verifyId helper function and parses the desirable information into an array called userData
async function verifyUser(verificationCode){

  const userData = await verifyId(verificationCode)

  if(userData){
    return [userData.FirstName, userData.LastName, userData.Email, userData.SignedIn, userData.TeamNumber] //Retrieves multiple value and stores them in array
  }else{
    return ["Nothing"] //Returns an array of 1, having some bug issues lol
  }
}

//====================================================================================================

//[checkRole()] - This is a dynamic function that inputs the TeamNumber, message object, and guild object in order to determine whether the dynamic role exists, if it does it will add the role and if not, it will create one
async function checkRole(TeamNumber, message, guild){
  //
  let checkRole = await message.member.guild.roles.cache.find(role => role.name === `Team${TeamNumber}`); //Attempts to finds the dynamic team role
  let Unverified = await message.member.guild.roles.cache.find(role => role.name === 'Unverified'); //Finds the Unverified Role
  let TeamStatus = await message.member.guild.roles.cache.find(role => role.name === 'Looking For Team'); //Finds the Looking For Team role
  if (checkRole){ 
    //If the dynamic role was already generated previously, do not create a new one and give the existing one to user
    message.guild.members.cache.get(message.author.id).roles.remove(TeamStatus); //Removes Looking For Team
    message.guild.members.cache.get(message.author.id).roles.remove(Unverified); //Removes unverified role
    return message.guild.members.cache.get(message.author.id).roles.add(checkRole); //If role exists assign them the role
    console
  }else{
    //If the dynamic role does not exist, create the role otherwise
    await guild.roles.create({
      data: {
        name: `Team${TeamNumber}`,
        color: 'BLUE', //Someone figure out how to make this random colours lol
      },
      reason: '',
    })
      .then() //Exceptions to handle promises, aka Javascript shtuff
      .catch(); //Exceptions to handle promises, aka Javascript shtuff
      checkRole = await message.member.guild.roles.cache.find(role => role.name === `Team${TeamNumber}`); //Reassigns checkRole to the newly created roll
      message.guild.members.cache.get(message.author.id).roles.remove(TeamStatus); //Removes Looking For Team
      message.guild.members.cache.get(message.author.id).roles.remove(Unverified);  //Removes unverified role
      return message.guild.members.cache.get(message.author.id).roles.add(checkRole); //Now that the role exists, assign it to the person
  } 

}

//====================================================================================================

//[checkRole()] - This is a dynamic function determines whether a new channel is required for a team or auto assigns if it already exists
async function checkChannel(teamNumber, message, guild){
  let server = message.guild; //Reference server to message.guild
  let category = await server.channels.cache.find(c => c.name == `Team-${teamNumber}` && c.type == "category"), //See if there is any category already labeled "Team<DynamicNumber>"
  channel = await server.channels.cache.find(c => c.name == `workroom-${teamNumber}` && c.type == "text"); ////See if there is any channel in that category labeled "Workroom-<DynamicNumber>"

  if (category && channel) { //Check to see if the channels exist

    //If it is true, this means that there is already a channel and that they should have access to it by default since we assigned a role earlier on

  }else{
    //This means that the channel must be created in the category
    let checkRole = await message.member.guild.roles.cache.find(role => role.name === `Team${teamNumber}`);
    //Create Category, Channels and Assign Roles

    await message.guild.channels.create(`Team-${teamNumber}`, { 
      type: 'category',
      permissionOverwrites: [
        {
          id: guild.id, // shortcut for @everyone role ID
          deny: 'VIEW_CHANNEL' //Deny View to everyone
        },
        {
          id: checkRole.id,
          allow: 'VIEW_CHANNEL' //Accept View to just that dynamic role
        }
      ]
     }).then(c => {
    }).catch();

    category = await server.channels.cache.find(c => c.name == `Team-${teamNumber}` && c.type == "category"); //

    await message.guild.channels.create(`workroom-${teamNumber}`, { 
      type: 'text',
      permissionOverwrites: [
        {
          id: guild.id, // shortcut for @everyone role ID
          deny: 'VIEW_CHANNEL'
        },
        {
          id: checkRole.id,
          allow: 'VIEW_CHANNEL'
        }
      ]
     }).then(c => {
      c.setParent(category.id).catch();
      
    }).catch();

    await message.guild.channels.create(`workroom-${teamNumber}`, { 
      type: 'voice',
      permissionOverwrites: [
        {
          id: guild.id, // shortcut for @everyone role ID
          deny: 'VIEW_CHANNEL'
        },
        {
          id: checkRole.id,
          allow: 'VIEW_CHANNEL'
        }
      ]
     }).then(c => {
      c.setParent(category.id);

    }).catch();
  }

}


//=============================
//Command/Message Handler -> Instance created when there is a new message or command input
//=============================
bot.on('message', message => {

  let guild = message.guild; //Reference guild as message.guild

  if (!message.content.startsWith(prefix) || message.author.bot) { //This code checks to see if any text has the command prefix or if it is a bot triggering the command
    return //If it doesn't have a ! don't try to process it
  } 

  //Argument and command handler, for example "!dab @Samson", the command would be "dab" and argument would be "@Samson"
  const args = message.content.slice(prefix.length).trim().split(' '); //Just parses spaces
  const command = args.shift().toLowerCase();

  if(!bot.commands.has(command)) return;

  try {
    bot.commands.get(command).execute(message, args);
  } catch(error) {
    console.log(error);
    //Delete the message if it is an invalid command
    message.delete();
    return message.author.send(`Invalid Command on HackYourLearning Server, use !help for the list of commands.`); //If no command is recognized, return error message

  } 
});

