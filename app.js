const Worlds = require('./worlds.js') 

const s = Worlds.newSubsector()
let worlds = 0
s.forEach((hex) => { 
  worlds++
  const world = Worlds.worldStats(hex)
  console.log(world.loc, world.code, world.name)
  console.log(Worlds.worldStats(world))
  console.log(Worlds.worldDetails(world))
  console.log(Worlds.worldDetailsFromCode(world.code))
})
console.log(`${worlds} worlds\n`)
