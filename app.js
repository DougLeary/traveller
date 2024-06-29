const Subsector = require('./subsector.js') 

const s = Subsector.generate()
let worlds = 0
s.forEach((hex) => { 
  worlds++
  const st = Subsector.stringify(hex)
  console.log(st)
  if (st.length > 13) console.dir(hex)
})
console.log(`${worlds} worlds`)
