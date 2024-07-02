// Discord Bot TravvyMcTraveller
const secret = require('./secret')
const Worlds = require('./worlds')

const context = {
  subsector: Worlds.newSubsector()      // TODO: load from data
}

const commandPrefix = '!tr' 

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
  console.log('TravvyMcTraveller connected to Discord')
})

function getParams(cmd, msg) {
  return msg.content.substring(cmd.length + commandPrefix.length + 1).trim()
}

function doCommand(cmd, message) {
  // example command handler;
  // cmd = command word, message = entire discord message containing the command;
  // to get parameters get the rest of message.content after prefix+cmd
  const params = getParams(cmd, message)
  const msg = `cmd: ${cmd}, params: ${params}`
  console.log(msg)
  message.channel.send(msg)
}

function infoFromCode(cmd, message) {
  // command should be followed by a standard condensed world code, example: B4897A9 5 N
  // spaces are not necessary and are ignored
  const param = getParams(cmd, message)
  const msg = Worlds.worldDetailsFromCode(param)
  console.log(msg)
  message.channel.send(msg)
}

function newSubsector(cmd, message) {
  // generate a subsector
  const msg = 'generating subsector'
  message.channel.send(msg)
}

function clearChannel(cmd, message) {
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

const commands = [
  {command: "test", handler: doCommand},
  {command: "generate", handler: newSubsector},
  {command: "code", handler: infoFromCode},
  {command: "clear", handler: clearChannel}
]

client.on('messageCreate', message => {
  // handle discord commands
  // console.log(`${client.user} says: ${message}`)
  if (!message.content.startsWith(commandPrefix)) return

  const msg = message.content.substring(commandPrefix.length).trim()
  for (const cmd of commands) {
    if (msg.startsWith(`${cmd.command} `)) {
      message.channel.send(`Command: ${cmd.command}`)
      cmd.handler(cmd.command, message)
      break
    }
  }
})

client.login(secret.loginToken)    // login to discord
