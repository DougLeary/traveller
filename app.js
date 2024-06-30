const Subsector = require('./subsector.js') 

const s = Subsector.generate()
let worlds = 0
s.forEach((hex) => { 
  worlds++
  const st = hex.specs
  console.log(st)
})
console.log(`${worlds} worlds\n\n`)
for (let i=0; i<10; i++) {
  console.log(Subsector.details(s[i]))
}
