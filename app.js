const Worlds = require('./worlds.js') 

const s = Worlds.newSubsector()
let worlds = 0
s.forEach((hex) => { 
  worlds++
  const st = hex.specs
  console.log(st)
})
console.log(`${worlds} worlds\n`)
// for (let i=0; i<10; i++) {
//   console.log(Worlds.details(s[i]))
// }
