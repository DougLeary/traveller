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
  A: "Excellent:rf,am,ss,nb8,sb10",
  B: "Good:rf,am,sn,nb8,sb9",
  C: "Routine:uf,rr,sb8",
  D: "Poor:uf,sb7",
  E: "Frontier:ls",
  X: "No:"
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
  "No laws affecting weapons possesson or ownership",
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

function roll(n=1, d=6, dm=0) {
  // return the total of n rolls of a die d with modifier dm
  let total = 0
  for (let i=0; i<n; i++) {
    total += Math.floor(Math.random() * d) + 1
  }
  return total + dm
}

function planetSize(value) {
  return (value == 0) ? "Asteroid/Planetoid Complex" : `${value}000 miles diameter`
}

function atmosphere(value) {
  return atmosphereTypes[value]  
}

function hydro(value) {
  return (value == '0') ? "No free standing water" : `${value}0% water`
}

function getExactPopulation(value) {
  if (value == 0) return 0

  // generate a population between 10^value and one power lower
  const pop = Math.floor(10**(value - Math.random()))
  return pop.toLocaleString()
}

function government(value) {
  return governmentTypes[value]
}

function lawLevel(value) {
  return lawLevelTypes[value]
}

function facilities(value) {
  const [port, feat] = starportTypes[value].split(":")
  const features = feat.split(",")
  const items = []
  features.map((feat) => { items.push(`  ${starportFeatures[feat]}`)})
  return `${port} starport. ${feat}\n${items.join('\n')}`
}

function hexOf(value) {
  return value.toString(16).toUpperCase()
}
function stringify(world) {
  const loc = `${String(world.x).padStart(2,'0')}${String(world.y).padStart(2,'0')}`
  const st = `${loc}  ${world.starportType}${hexOf(world.size)}${hexOf(world.atmosphere)}${hexOf(world.hydroPercent)}` 
    + `${hexOf(world.popLevel)}${hexOf(world.government)}${world.lawLevel} ${hexOf(world.techLevel)}  ${world.name}`
  return st
}

function details(world) {
  const st = `${stringify(world)}\n${planetSize(world.size)}, ${hydro(world.hydroPercent)}`
    + `\n${atmosphere(world.atmosphere)} atmosphere`
    + `\n${facilities(world.starportType)}`
    + `\nPopulation ${world.population}`
    + `\nGoverned by ${government(world.government)}\nTech Level: ${world.techLevel}\n${lawLevel(world.lawLevel)}\n`
  return st
}

function getTechLevel(world) {
  let dm = techMatrix.port[world.starportType] || 0
    + techMatrix.size[world.sizeRoll] || 0
    + techMatrix.atmo[world.atmosphere] || 0
    + techMatrix.hydro[world.hydroPercent] || 0
    + techMatrix.pop[world.population] || 0
    + techMatrix.gov[world.government] || 0
  return Math.max(0, roll(1, 6, dm))
}

function generateHex(x, y, dm=0) {
  // roll for worlds in hex x,y with die modifier dm 
  if (roll(1,6,dm) < 4) return null
  // world is present

  const world = {
    x: x,
    y: y,
    name: Names.getName('world'),
    starportType: starports.charAt(roll(2)-2),
    size: roll(2,6,-2),
    popLevel: roll(2,6,-2)
  }
  world.atmosphere = (world.size == 0) ? 0 : roll(2, 6, Math.max(0,world.size-7))
  world.hydroPercent = (world.size <= 1) ? 0 : roll(2, 6, Math.min(10,Math.max(0,world.size-7)))
  world.population = getExactPopulation(world.popLevel)
  world.government = Math.max(0, roll(2, 6, world.popLevel-7))
  world.lawLevel = Math.min(Math.max(0, roll(2, 6, world.government-7)), 9)
  world.techLevel = getTechLevel(world)
  world.specs = stringify(world)
  return world
}

function generate(dm=0) {
  // generate hexes using die modifier dm
  const arr = []
  let count = 0
  for (let x=1; x < 9; x++) {
    for (let y=1; y < 11; y++) {
      const hex = generateHex(x, y, dm)
      if (hex) {
        count++
        arr.push(hex)
      }
    }
  }
  return arr
}


module.exports = { generate, stringify, details, roll }
