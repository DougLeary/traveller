const Names = require('../DMTools/names.js')
const namesPath = __dirname + '/names.json'
Names.load(namesPath)

const starports = 'AAABBCCDEEX'   // for roll results 2..12
const starportFeatures = { 
  rf: "Refined fuel",
  uf: "Unrefined fuel",
  am: "Annual maintenance overhaul",
  rr: "Reasonable repair facilities",
  ss: "Shipyard capable of starship and non-starship construction",
  sn: "Shipyard capable of non-starship construction",
  nb: "Naval base",
  sb: "Scout base",
  ls: "Landing site only"
}
const starportTypes = {
  // for nb# and sb# the # is the 2d6 roll required for the base to be present 
  A: "Excellent:rf,am,ss;nb?8,sb?10",
  B: "Good:rf,am,sn;nb?8,sb?9",
  C: "Routine:uf,rr;sb?8",
  D: "Poor:uf;sb?7",
  E: "Frontier:ls",
  X: "No:"
}

const scoutBaseRoll = {
  A: 10,
  B: 9,
  C: 8,
  D: 7
}

const atmosphereTypes = [
  "No",
  "Trace",
  "Very thin, tainted",
  "Very thin",
  "Thin, tainted",
  "Thin",
  "Standard",
  "Standard, tainted",
  "Dense",
  "Dense, tainted",
  "Exotic",
  "Corrosive",
  "Insidious"
]

const governmentTypes = [
  "No government structure",
  "Company/Corporation",
  "Participating Democracy",
  "Self-perpetuating Oligarchy",
  "Representative Democracy",
  "Feudal Technocracy",
  "Captive Government",
  "Balkanization",
  "Civil Service Bureaucracy",
  "Impersonal Bureaucracy",
  "Charismatic Dictator",
  "Non-Charismatic Leader",
  "Charismatic Oligarchy",
  "Religious Dictatorship"
]

const lawLevelTypes = [
  "No laws affecting weapons possession or ownership",
  "Certain weapons are prohibited, including specifically 1) body pistols that are undetectable by standard detectors, 2) explosive weapons such as bombs or grenade, and 3) poison gas.",
  "Portable energy weapons such as laser rifles or carbines are prohibited. Ships gunnery is not affected.",
  "Weapons of a strict military nature (such as machine guns or automatic rifles, though not submachine guns) are prohibited.",
  "Light assault weapons (such as submachine guns) are prohibited.",
  "Personal concealable firearms (such as pistols and revolvers) are prohibited).",
  "Most firearms (all except shotguns) are prohibited. The carrying of any type of weapon openly is discouraged.",
  "Shotguns are prohibited.",
  "Long bladed weapons (all blade weapons except daggers) are strictly controlled. Open possession in public is prohibited. Ownership is, however, not restricted.",
  "Possession of any weapon outside of one's home is prohibited."
]

const techMatrix = {
  port: {A:6, B:4, C:2, X:-4},
  size: {0:2, 1:2, 2:1, 3:1, 4:1},
  atmo: {0:1, 1:1, 2:1, 3:1, A:1, B:1, C:1, D:1, E:1},
  hydro: {9:1, A:2}, 
  pop: {1:1, 2:1, 3:1, 4:1, 5:1, 9:2, A:4},
  gov: {0:1, 5:1, D:-2}
}

function roll(n=2, d=6) {
  // simple die roller; returns the total of n rolls of a die d, default 2d6
  let total = 0
  for (let i=0; i<n; i++) {
    total += Math.floor(Math.random() * d) + 1
  }
  return total
}

function planetSize(value) {
  return (value == 0) ? "Asteroid/Planetoid Complex" : `${value}000 miles diameter`
}

function hydro(value) {
  return (value == '0') ? "No free standing water" : `${value}0% water`
}

function exactPopulation(value) {
  if (value == 0) return 0

  // generate a population between 10^value and one power lower
  const pop = Math.floor(10**(value - Math.random()))
  return pop.toLocaleString()
}

function lawLevel(value) {
  return lawLevelTypes[value]
}

function government(value) {
  const text = governmentTypes[value]
  return (value == 0) ? text : `Governed by ${text}`
}

function hexOf(value) {
  return value.toString(16).toUpperCase()
}

function worldSummary(world) {
  const loc = `${String(world.x).padStart(2,'0')}${String(world.y).padStart(2,'0')}`
  const code = `${world.starportType}${hexOf(world.size)}${hexOf(world.atmosphere)}${hexOf(world.hydroPercent)}` 
    + `${hexOf(world.popLevel)}${hexOf(world.government)}${world.lawLevel} ${hexOf(world.techLevel)} ${world.bases}`
  return {loc: loc, code: code, name: world.name}
}

function getFacilities(value) {
  // for value "A" starportTypes["A"]: "Excellent:rf,am,ss;nb?8,sb?10"
  // here we parse the string to get the services and roll for the starbases
  const [port, code] = starportTypes[value].split(":")
  const specParts = code.split(";")
  const services = specParts[0].split(",") || []
  const items = []
  services.map((item) => { 
    items.push(`  ${starportFeatures[item]}`)
  })
  return [port, items]
}
function worldDetailsFromCode(worldCode) {
  let code = worldCode.replaceAll(' ','')
  const [port, fac] = getFacilities(code.charAt(0))
  const det = `\n${planetSize(code.charAt(1))}, ${hydro(code.charAt(2))}`
    + `\n${atmosphereTypes[code.charAt(3)]} atmosphere`
    + `\nPopulation ${Math.floor(10**(parseInt(code.charAt(4)))).toLocaleString()}${(code.charAt(4) != '0') ? ' or less' : ''}`
    + `\n${port} starport:\n${fac.join('\n')}`
    + ('N2'.includes(code.charAt(8)) ? `\n  ${starportFeatures.nb}` : "")
    + ('S2'.includes(code.charAt(8)) ? `\n  ${starportFeatures.sb}${!fac.includes('rf') ? ", refined fuel available for scout ships" : ""}` : "")
    + `\n${government(code.charAt(5))}\nTech Level: ${code.charAt(7)}\n${lawLevel(code.charAt(6))}\n`

  return det
}

function worldDetails(world) {
  const [port, fac] = getFacilities(world.starportType)
  const summary = worldSummary(world)
  const st = `${summary.loc}  ${world.code}  ${world.name}`
  + `\n${planetSize(world.size)}, ${hydro(world.hydroPercent)}`
  + `\n${atmosphereTypes[world.atmosphere]} atmosphere`
  + `\nPopulation ${world.population}`
  + `\n${port} starport:\n${fac.join('\n')}`
  + ('N2'.includes(world.bases) ? `\n  ${starportFeatures.nb}` : "")
  + ('S2'.includes(world.bases) ? `\n  ${starportFeatures.sb}${!fac.includes('rf') ? ", refined fuel available for scout ships" : ""}` : "")
  + `\n${government(world.government)}\nTech Level: ${world.techLevel}\n${lawLevel(world.lawLevel)}\n`

  return st
}

function getTechLevel(world) {
  let dm = techMatrix.port[world.starportType] || 0
    + techMatrix.size[world.sizeRoll] || 0
    + techMatrix.atmo[world.atmosphere] || 0
    + techMatrix.hydro[world.hydroPercent] || 0
    + techMatrix.pop[world.population] || 0
    + techMatrix.gov[world.government] || 0
  return Math.max(0, roll(1) + dm)
}

function getBases(world) {
  const codes = starportTypes[world.starportType].split(":")[1]?.split(";")[1]?.split(",") || []
  let nb = false
  let sb = false
  for (let i=0; i< codes.length; i++) {
    if (codes[i].startsWith('nb')) {
      nb = (roll() >= codes[i].split('?')[1])
    } else if (codes[i].startsWith('sb')) {
      sb = (roll() >= codes[i].split('?')[1])
    }
  }
  return (nb && sb) ? '2' : (nb) ? 'N' : (sb) ? 'S' : ' '
}

function newWorldName(subsector) {
  // generate a world name not already used in this subsector 
  let name = Names.getName('world')
  let unique = true
  for (world in subsector) {
    if (world.name == name) {
      unique = false
      break
    }
  }
  return unique ? name : newWorldName(subsector)
}

function newHex(subsector, x, y, dm=0) {
  // roll for worlds in hex x,y with die modifier dm 
  if (roll(1) + dm < 4) return null
  // world is present

  const world = {
    x: x,
    y: y,
    name: newWorldName(subsector),
    starportType: starports.charAt(roll()-2),
    size: roll()-2,
    popLevel: roll()-2
  }
//  world.navalBase = ('AB'.includes(world.starportType) && roll() >= 8) ? true : false
//  world.scoutBase = ('ABCD'.includes(world.starportType) && roll() >= 10 - 'ABCD'.indexOf(world.starportType)) ? true : false
  world.atmosphere = (world.size == 0) ? 0 : roll() + Math.max(0,world.size-7)
  world.hydroPercent = (world.size <= 1) ? 0 : roll() + Math.min(10,Math.max(0,world.size-7))
  world.population = exactPopulation(world.popLevel)
  world.government = Math.max(0, roll() + world.popLevel-7)
  world.lawLevel = Math.min(Math.max(0, roll() + world.government-7), 9)
  world.techLevel = getTechLevel(world)
  world.bases = getBases(world)
  world.code = worldSummary(world).code

  return world
}

function newSubsector(dm=0) {
  // generate hexes using die modifier dm
  const arr = []
  let count = 0
  for (let x=1; x < 9; x++) {
    for (let y=1; y < 11; y++) {
      const hex = newHex(arr, x, y, dm)
      if (hex) {
        count++
        arr.push(hex)
      }
    }
  }
  return arr
}


module.exports = { newSubsector, newHex, worldSummary, worldDetails, worldDetailsFromCode, roll }
