module.exports = {
      //[Command] !verify confirms the identity of a user, and automatically renames them and creates a team-specific channel for them if it doesn't already exist
	name: 'verify',
	description: 'Verifciation command',
	execute(message, args) {
        //We only want the command to work in the verification channel, so if it is not in the verification channel it exits with a return
    if(message.channel.id !== VerificationChannelId){ 
        return 
      }
  
      //If there are no arguments, we want it to error and let the user know that it is not valid
      if (!args.length) {
        return message.channel.send(`You didn't provide any arguments, ${message.author}! Correct usage is !verify code \n \n===`);
      }
      //If there are too many arguments, we want to let the user know as well
      else if(args.length > 1){
        return message.channel.send(`You provided too many arguments, ${message.author}! Correct usage is !verify code \n \n===`);
      }
      
      //users the verifyUser function and passes in the args of the command (Hopefully Verification Key)
      let userData = verifyUser(args[0]);
      
      //Data gets parsed and processed
      userData.then(function(returnedUserData) {
  
      //Since the return type of verifyUser is an array with various information, we have to parse it
        let firstName = returnedUserData[0] 
        let lastName = returnedUserData[1]
        let email = returnedUserData[2] //For future use probably?
        let signInStatus = returnedUserData[3] //To check if the user has already signed in, a value of "Yes" means the key has already been used previously
        let teamNumber = returnedUserData[4] //Team Number as provided by the spreadsheet
  
        //Check to see if they entered a valid verification code, verifyUser will return an array of only size 1 if it was an invalid code
        if(returnedUserData.length !== 1){
  
          //Check to see if they have already signed in with that code
          if(signInStatus === 'No'){
  
            //Finds the Verified Role Name
            let role = message.member.guild.roles.cache.find(role => role.name === `${VerificationRoleName}`); 
  
            //Set discord user to appropriate nickname
            message.member.setNickname(`${firstName} ${lastName[0]}.`); 
  
            //Send private DM to tell them they are verified (Optional)
            if (role) message.guild.members.cache.get(message.author.id).roles.add(role); //Adds the verified role in
            message.author.send(`Thank you ${firstName}, you are now verified on the Hack Your Learning Discord! \n \n===`); 
  
            //**Check to see if they have a team in the first place, if teamNumber is empty, remove their Unverified Status, verify them but don't assign team role**
            //===================================================================================================================================================
            if(!teamNumber){ 
              let Unverified = message.member.guild.roles.cache.find(role => role.name === 'Unverified');
              message.guild.members.cache.get(message.author.id).roles.remove(Unverified); //Removes Unverified and Verifies them
              return message.channel.send(`${message.author} has been verified! Welcome to the Hack Your Learning Discord :smile: \n \n===`); //exit loop and allow them access
            }
            //Check to see whether a role already exists and if not create one using the checkRole() function
            checkRole(teamNumber, message, guild); 
            //Check to see whether a channel already exists for the corresponding team and if not create one using the checkChannel() function
            checkChannel(teamNumber, message, guild); 
             //Announces to the world to welcome the person
            return message.channel.send(`${message.author} has been verified! Welcome to the Hack Your Learning Discord :smile: \n \n===`);
  
        }else{
          //This is the return error when a verification code has already been used
              return message.channel.send(`Verification code has already been used ${message.author}. Please contact an administrator for help.\n\n===`);
            }        
        }else{
          //This is the return error when a verification code is invalid
          return message.channel.send(`Verification Code Invalid ${message.author}, please try again or contact an administrator. \n \n===`); //Rejection
        }
     })
     //Delete all !verify commands when they are entered as to not spam the #verification channel
    message.delete();
	},
};