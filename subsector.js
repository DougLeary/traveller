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
  X: "None:"
}

const atmosphereTypes = [
  "None",
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
  "Shotguns are prohibited",
  "Long bladed weapons (all blade weapons except daggers) are strictly controlled. Open possession in public is prohibited. Ownership is, however, not restricted.",
  "Possession of any weapon outside of one's home is prohibited."
]


function roll(n=1, d=6, dm=0) {
  // return the total of n rolls of a die d with modifier dm
  let total = 0
  for (let i=0; i<n; i++) {
    total += Math.floor(Math.random() * d) + 1 + dm
  }
  return total 
}

function planetSize(digit) {
  return (digit == 0) ? "Asteroid/Planetoid Complex" : `${digit}000 miles diameter`
}

function atmosphere(digit) {
  return atmosphereTypes[digit]  
}

function hydro(digit) {
  return (digit == '0') ? "no free standing water" : (digit == "A") ? "All water, no land masses" : `${digit}0%`
}

function population(digit) {
  return digit.toLocaleString()
}

function government(digit) {
  return governmentTypes[digit]
}

function lawLevel(digit) {
  return lawLevelTypes[digit]
}

function hexOf(val) {
  return val.toString(16).toUpperCase()
}
function stringify(world) {
  const loc = `${String(world.x).padStart(2,'0')}${String(world.y).padStart(2,'0')}`
  const st = `${loc}  ${world.starportType}${hexOf(world.planetarySize)}${hexOf(world.atmosphere)}${hexOf(world.hydroPercentage)}${hexOf(world.population)}${hexOf(world.government)}${hexOf(world.lawLevel)}`
  return st
}

function generateHex(x, y, dm=0) {
  // roll for worlds in hex x,y with die modifier dm 
  if (roll(1,6,dm) < 4) return null
  // world is present
  const sizeRoll = roll(2)
  const popRoll = roll(2, 6, -2)
  const population = (popRoll == 0) ? 0 : 10^Math.max(0, roll(2, 6, -2)) 
  const gov = roll(2, 6, Math.max(0,popRoll - 7))
  return {
    x: x,
    y: y,
    starportType: starports.charAt(roll(2)-2),
    planetarySize: sizeRoll,
    atmosphere: ((sizeRoll == 0) ? 0 : roll(2, 6, Math.max(0,sizeRoll-7))),
    hydroPercentage: ((sizeRoll <= 1) ? 0 : roll(2, 6, Math.max(0,sizeRoll-7))),
    population: Math.max(0,popRoll),
    government: Math.max(0,gov),
    lawLevel: Math.max(0,roll(2, 6, gov-7)),
    // planetarySize: planetSize(sizeRoll),
    // atmosphere: atmosphere((sizeRoll == 0) ? 0 : roll(2, 6, sizeRoll-7)),
    // hydroPercentage: hydro((sizeRoll <= 1) ? 0 : roll(2, 6, sizeRoll-7)),
    // population: population,
    // government: gov,
    // lawLevel: roll(2, 6, gov-7)
  }
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


module.exports = { generate, stringify }
