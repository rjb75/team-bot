require("dotenv").config(); // to be removed when we switch over to git based keys

const Discord = require("discord.js");
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.on("ready", () => {
  console.info("Logged in as {bot.user.tag}!");
});

bot.login(TOKEN);


//Team Class Code
class User {
  constructor() {
    this.DiscordNames;
    this.DiscordTags;
    this.DiscordIds;
    this.Names;
    this.Emails;
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
    this.listName = ListName;
    //Object to store all the teams in
    this.teams = [];
  }

  //Creates amount of teams based on number of teams
  createTeams(numberOfTeams){
    for(let i = 0; i < numberOfTeams; i++){
      //Creates a team
      let team = new Team()
      this.teams.push(team);
    }
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
teams.createTeams(10);
teams.listAllTeams();