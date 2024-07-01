// Discord Bot TravvyMcTraveller
const worlds = require('./worlds')

const context = {
  subsector: worlds.newSubsector()      // TODO: load from data
}

const loginToken = "MTI1NzIzOTU1NDM5ODc0ODgwMg.GdOBP4.qklAod-Ai7nv8AUI4JfEMUGCF6jkZEkWgngJJo" 

const { Client, GatewayIntentBits } = require('discord.js')
const fetchAll = require('discord-fetch-all')

const client = new Client({
	intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent
]})

client.once('ready', () => {
  // executes once on startup; do setup stuff
  console.log('TravvyMcTraveller bot connected to Discord')
})

function getParams(msg, command) {
  return msg.substring(command.length+1)
}

function initSubsector(message) {
  // generate a subsector
  const msg = ''

  message.channel.send(msg)
}

function doBeta(message) {
  // demo
  const msg = `command: "beta", params: "${getParams(message.content, 'beta')}"`
  console.log(msg)
  message.channel.send(msg)
}

function clearTest(message) {
  // useful tool for bot testing;
  // for safety it only works if the channel name is "testing"
  if (message.channel.name != "testing") return
  
  // asynchronously delete all messages in the channel
  fetchAll.messages(message.channel, {
      reverseArray: true, // Reverse the returned array so last msgs will be deleted first
      userOnly: false, // Only return messages by users
      botOnly: false, // Only return messages by bots
      pinnedOnly: false, // Only returned pinned messages
  }).then(
      (messages) => {
          console.log("Found",messages.length," messages");
          var count = 0;
          for (msg of messages) {
            msg.delete();
            count++;
          }
          console.log(`Deleting ${count} messages.`);
      },
      () => {
          console.log("No messages available");
      }
  );
}

const commandPrefix = '!' 
const commands = [
  {command: "init", handler: initSubsector},
  {command: "cleartest", handler: clearTest}
]

client.on('messageCreate', message => {
  // handle discord commands
  // console.log(`${client.user} says: ${message}`)
  if (!message.content.startsWith(commandPrefix)) return

  const msg = message.content.substring(1)
  const tokens = msg.split(' ')
  if (tokens.length == 0) return   // command missing 

  const cmd = tokens[0].toLowerCase()
  for (const item of commands) {
    if (item.command == cmd) {
      item.handler(message)
      break
    }
  }
})

client.login(loginToken)    // login to discord
