const Worlds = require('./worlds.js') 

const s = Worlds.newSubsector()
let worlds = 0
s.forEach((hex) => { 
  worlds++
  const world = Worlds.worldSummary(hex)
  console.log(world.loc, world.code, world.name)
})
console.log(`${worlds} worlds\n`)
for (let i=0; i<10; i++) {
//  console.log(Worlds.worldDetails(s[i]))
  console.log(Worlds.worldDetailsFromCode(s[i].code))
}
