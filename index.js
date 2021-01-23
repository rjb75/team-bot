require("dotenv").config(); // to be removed when we switch over to git based keys

const Discord = require("discord.js");
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.on("ready", () => {
  console.info("Logged in as {bot.user.tag}!");
});

bot.login(TOKEN);

//Google Sheets API

const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client-secret.json');

// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('1hoTYv-70ggXe0ucVpecz0zr_Sq9ahxcFYC8dvAq3cYY');

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: creds.client_email,
    private_key: creds.private_key,
  });

  await doc.loadInfo(); // loads document properties and worksheets
  console.log(doc.title);

  const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
  console.log(sheet.title);
  console.log(sheet.rowCount);

}

accessSpreadsheet();

//Command prefix
const prefix = "!"

//Random Commands that Samson has done
bot.on('message', message => {
	if (message.content === '!teams') {

    if(teams.teams.length === 0){
      //Checks to see if there are any teams
      message.channel.send("There are currently no teams registered in the system :avocado:")
    }else{
      //Sends out an embed for each team
      for(let i = 0; i < teams.teams.length; i++){
        //iterate through each team and make an embed
        const teamMemberEmbed = createEmbed(teams.teams[i]);
        //Publish team stats
        message.channel.send(teamMemberEmbed);
      }
    }
  }
  //Dab Function: Dabs on the server when someone requests it
  else if(message.content === "!dab"){

    message.channel.send("Get Dabbed On :smile:");
  
  //Help Function: Returns commands to user
  }else if (message.content === "!help"){

    message.channel.send("Get your own help bro :angry:");
  }else if (message.content === "!createTeam"){
  //Create Team Function: Creates 1 team and automatically assigns team ID based on team index
    teams.createTeam();
    message.channel.send(`Created Team #${teams.teamIndex}`);
  }
});

//Team Embed Generator
function createEmbed(Team){

  const teamMemberEmbed = new Discord.MessageEmbed()
      .setColor('#FF08F0')
      .setTitle(`Team #${Team.teamId + 1} (ID: ${Team.teamId})`)
      .setAuthor('HYL Team Management Bot', 'https://i.pinimg.com/originals/7b/cf/da/7bcfda3e4a0943c35a89f12fae1cefb5.jpg', 'https://hackyourlearning.ca/')
      .setDescription('=============================')
      .setTimestamp()
      .setFooter('Generated by HackYourLearning Bot', 'https://fcbk.su/_data/stickers/bugcat_capoo/bugcat_capoo_12.png');
  //Prints out team members in each team
  for(let i = 0; i < Team.teamMembers.length; i++){
    teamMemberEmbed.addField(`${Team.teamMembers[i].Name} (${Team.teamMembers[i].DiscordTag})`, `${Team.teamMembers[i].Email}`);
  }
  return teamMemberEmbed;

}

//Team Class Code
class User {
  constructor() {
    this.DiscordName = "";
    this.DiscordTag = "";
    this.DiscordId = "";
    this.Name = "";
    this.Email = "";
  } 
}

class Team extends User{
  constructor(id){
    super();
    this.teamId = id;
    this.teamMembers = [];
  }
}

class TeamList extends Team{

  constructor(ListName){
    super();
    this.teamIndex = 0;
    this.listName = ListName;
    //Object to store all the teams in
    this.teams = [];
  }

  //Creates amount of teams based on number of teams from DB
  createTeams(numberOfTeams){
    for(let i = 0; i < numberOfTeams; i++){
      //Creates a team
      this.teamIndex++;
      let team = new Team(this.teamIndex)
      this.teams.push(team);
    }
  }
  //Adds one team to the teams list
  createTeam(){
    let newTeam = new Team(this.teamIndex)
    this.teams.push(newTeam);
    this.teamIndex++;
  }

  //Returns all teams
  listAllTeams(){
    if (this.teams.length == 0){
        console.log("There are no teams in this list");
    }else{
        return this.teams;
    }
    
  }

}

//Functions at the bottom
let teams = new TeamList("Hackathon Participants");