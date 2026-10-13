/* —— Shared config + specimen data ——
   Loaded by both the deck and the phone ballot. Names are deliberately
   NOT in here: the answer key lives in deck.js so phones can't peek. */

const CONFIG = {
  // Room name. Anyone who knows it can read it, so it's random.
  // Change it to start a completely fresh room.
  topic: 'marcom-dinos-9aebcdf59561',
  // Firebase Realtime Database URL. When set, votes go through Firebase
  // (no daily caps). Leave empty to fall back to ntfy.sh.
  firebase: 'https://marcom-dinos-default-rtdb.firebaseio.com',
  relay: 'https://ntfy.sh',
  // Used for the QR code when the deck is opened locally (file:// or localhost).
  publicUrl: 'https://zoeallgaier.github.io/marcomdinos/',
};

const ROSTER = [
  'Cesar', 'David', 'Emily', 'Halen', 'Jeff', 'Lauren',
  'Leah B.', 'Leah K.', 'Lindsay', 'Monica', 'Zoe',
];

const DINOS = [
  {
    id: 'cryolophosaurus',
    species: 'Cryolophosaurus',
    facts: [
      'Unbelievably stylish for 190 million years and counting.',
      'Top predator of an entire continent. Real Housewives of Antarctica, basically.',
      'Has a Stanley for every season bc staying hydrated in the Jurassic is important!',
    ],
  },
  {
    id: 'kamuysaurus',
    species: 'Kamuysaurus',
    facts: [
      'Named for the Ainu (Indigenous Japanese) word for deity. Accurate.',
      'Japan’s most complete dinosaur skeleton, just like her work.',
      'Died at sea, came back 72 million years later looking flawless. Very Elden Ring.',
    ],
  },
  {
    id: 'spinosaurus',
    species: 'Spinosaurus',
    facts: [
      'Has a giant sail on his back and still keeps a low profile.',
      'Rebuilt from scratch more times than any dinosaur in history. A web dev at heart.',
      'Still the new guy in the wetlands, but is adored nonetheless.',
    ],
  },
  {
    id: 'borealopelta',
    species: 'Borealopelta',
    facts: [
      'Best-preserved armored dinosaur ever found. Deadstock after 110 million years. Kept the box.',
      'Armored head to tail, lowkey protective of the whole team.',
      'Fueled by Diet Coke.',
    ],
  },
  {
    id: 'psittacosaurus',
    species: 'Psittacosaurus',
    facts: [
      'Whimsical energy!',
      'One was found fossilized shielding 34 babies. MarCom is the 34 babies.',
      'Has a beak and is not afraid to use it on incoming project requests.',
    ],
  },
  {
    id: 'maiasaura',
    species: 'Maiasaura',
    facts: [
      'The first dinosaur proven to parent its young. Leads our teams like a herd.',
      'Never once raised his voice.',
      'Brought food back to the nest for the hatchlings. Scientists assume it was Crumbl.',
    ],
  },
  {
    id: 'patagotitan',
    species: 'Patagotitan',
    facts: [
      'Name means “titan of Patagonia.” Doesn’t make a big deal about it.',
      'Spent her days wading around the lagoon eating ferns. No stress, still the main character.',
      'Lived among forests and lakes. Permanently in her folklore era.',
    ],
  },
  {
    id: 'oryctodromeus',
    species: 'Oryctodromeus',
    facts: [
      'Found curled up in her den. Probably mid-chapter in Emma M. Lion.',
      'The only dinosaur known to dig its own burrow. Cozy is a lifestyle.',
      'Basically lived in the underworld. Very Hades II.',
    ],
  },
  {
    id: 'utahraptor',
    species: 'Utahraptor',
    facts: [
      'Utah’s state dinosaur!',
      'Nine-inch claw on each foot. Never has to say anything twice.',
      'Pack hunter (but we all know she carries the whole pack).',
    ],
  },
  {
    id: 'scipionyx',
    species: 'Scipionyx',
    facts: [
      'Italy’s most famous dinosaur!',
      'Fossilized with its organs intact, so we know for a fact he’s the heart of the team.',
      'Nicknamed Ciro, which sounds like a guy who’d fix your motorcycle for free.',
    ],
  },
  {
    id: 'lythronax',
    species: 'Lythronax',
    facts: [
      'Name means “gore king.” Might have RBF but is actually nice.',
      'Tyrant of kerning. Forward-facing eyes, so she will notice.',
      'Utah local who’d rather stay cozy at home. Home is the NHMU.',
    ],
  },
];
