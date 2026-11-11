import type { ItemDef } from './types'

export const ITEMS: ItemDef[] = [
  // Food
  { id: 'food_kibble', name: 'Plain Kibble', category: 'food', description: 'Always available. Simple and filling.', price: 0, minLevel: 1, food: { hunger: 20, happiness: 1 }, unlimited: true },
  { id: 'food_fish', name: 'Fish Snack', category: 'food', description: 'A crunchy little fish.', price: 12, minLevel: 1, food: { hunger: 30, happiness: 4 } },
  { id: 'food_milk', name: 'Warm Milk', category: 'food', description: 'Cozy and creamy.', price: 15, minLevel: 1, food: { hunger: 20, happiness: 7 } },
  { id: 'food_tuna', name: 'Tuna Bowl', category: 'food', description: 'A real treat!', price: 30, minLevel: 2, food: { hunger: 45, happiness: 8 } },
  { id: 'food_cake', name: 'Birthday Cake', category: 'food', description: 'Sweet, fluffy and joyful.', price: 60, minLevel: 3, food: { hunger: 35, happiness: 16 } },
  { id: 'food_sardine', name: 'Sardine Tin', category: 'food', description: 'Small, salty and tasty.', price: 20, minLevel: 1, food: { hunger: 25, happiness: 5 } },
  { id: 'food_icecream', name: 'Kitty Ice Cream', category: 'food', description: 'Cold, sweet and silly.', price: 40, minLevel: 2, food: { hunger: 25, happiness: 14 } },
  { id: 'food_chicken', name: 'Roast Chicken', category: 'food', description: 'A proper feast.', price: 55, minLevel: 3, food: { hunger: 50, happiness: 9 } },
  { id: 'food_sushi', name: 'Salmon Sushi', category: 'food', description: 'Fancy dinner for a fancy cat.', price: 85, minLevel: 5, food: { hunger: 60, happiness: 14 } },

  // Toys (owning the toy applies the best bonus to playtime)
  { id: 'toy_yarn', name: 'Red Yarn Ball', category: 'toy', description: 'A classic.', price: 0, minLevel: 1, toyBonus: 1, starter: true },
  { id: 'toy_mouse', name: 'Squeaky Mouse', category: 'toy', description: 'Squeak squeak! +25% play joy.', price: 40, minLevel: 1, toyBonus: 1.25 },
  { id: 'toy_feather', name: 'Feather Wand', category: 'toy', description: 'Irresistible. +50% play joy.', price: 90, minLevel: 2, toyBonus: 1.5 },
  { id: 'toy_laser', name: 'Sparkle Light', category: 'toy', description: 'Chase the dot! +80% play joy.', price: 180, minLevel: 4, toyBonus: 1.8 },
  { id: 'toy_ball', name: 'Jingle Ball', category: 'toy', description: 'Jingle jingle! +35% play joy.', price: 60, minLevel: 2, toyBonus: 1.35 },
  { id: 'toy_tunnel', name: 'Play Tunnel', category: 'toy', description: 'Hide and seek! +65% play joy.', price: 140, minLevel: 3, toyBonus: 1.65 },
  { id: 'toy_robot', name: 'Robo Mouse', category: 'toy', description: 'Runs on its own! +100% play joy.', price: 260, minLevel: 6, toyBonus: 2 },

  // Accessories
  { id: 'hat_bow', name: 'Pink Bow', category: 'accessory', slot: 'hat', description: 'A sweet little bow.', price: 40, minLevel: 1 },
  { id: 'hat_party', name: 'Party Hat', category: 'accessory', slot: 'hat', description: 'Every day is a party.', price: 50, minLevel: 1 },
  { id: 'hat_crown', name: 'Tiny Crown', category: 'accessory', slot: 'hat', description: 'Royalty has arrived.', price: 250, minLevel: 5 },
  { id: 'col_red', name: 'Red Collar', category: 'accessory', slot: 'collar', description: 'Simple and stylish.', price: 30, minLevel: 1 },
  { id: 'col_bell', name: 'Bell Collar', category: 'accessory', slot: 'collar', description: 'Jingle jingle.', price: 45, minLevel: 1 },
  { id: 'col_scarf', name: 'Teal Scarf', category: 'accessory', slot: 'collar', description: 'Warm and snuggly.', price: 70, minLevel: 2 },
  { id: 'hat_flower', name: 'Flower Crown', category: 'accessory', slot: 'hat', description: 'Spring vibes.', price: 60, minLevel: 2 },
  { id: 'hat_wizard', name: 'Wizard Hat', category: 'accessory', slot: 'hat', description: 'Stardust magic.', price: 140, minLevel: 3 },
  { id: 'col_bowtie', name: 'Bow Tie', category: 'accessory', slot: 'collar', description: 'Very fancy.', price: 60, minLevel: 2 },
  { id: 'col_medal', name: 'Golden Medal', category: 'accessory', slot: 'collar', description: 'Best kitty award.', price: 200, minLevel: 5 },

  // Beds
  { id: 'bed_cushion', name: 'Cozy Cushion', category: 'bed', slot: 'bed', description: 'The starter nap spot.', price: 0, minLevel: 1, bedBonus: 0, starter: true },
  { id: 'bed_basket', name: 'Wicker Basket', category: 'bed', slot: 'bed', description: 'Naps restore +10 more energy.', price: 80, minLevel: 1, bedBonus: 10 },
  { id: 'bed_cloud', name: 'Cloud Bed', category: 'bed', slot: 'bed', description: 'Naps restore +20 more energy.', price: 200, minLevel: 3, bedBonus: 20 },
  { id: 'bed_tent', name: 'Cat Tent', category: 'bed', slot: 'bed', description: 'Naps restore +15 more energy.', price: 140, minLevel: 2, bedBonus: 15 },

  // Decorations
  { id: 'wp_cream', name: 'Cream Wallpaper', category: 'decoration', slot: 'wallpaper', description: 'Warm and calm.', price: 0, minLevel: 1, starter: true },
  { id: 'wp_pink', name: 'Strawberry Milk', category: 'decoration', slot: 'wallpaper', description: 'Soft pink with dots.', price: 60, minLevel: 1 },
  { id: 'wp_mint', name: 'Mint Stripes', category: 'decoration', slot: 'wallpaper', description: 'Fresh and breezy.', price: 60, minLevel: 1 },
  { id: 'wp_night', name: 'Starry Night', category: 'decoration', slot: 'wallpaper', description: 'Twinkling dreams.', price: 120, minLevel: 3 },
  { id: 'fl_wood', name: 'Wooden Floor', category: 'decoration', slot: 'floor', description: 'Warm planks.', price: 0, minLevel: 1, starter: true },
  { id: 'fl_carpet', name: 'Pink Carpet', category: 'decoration', slot: 'floor', description: 'Soft under paws.', price: 70, minLevel: 1 },
  { id: 'fl_checker', name: 'Checker Tiles', category: 'decoration', slot: 'floor', description: 'Retro kitchen vibes.', price: 90, minLevel: 2 },
  { id: 'win_curtain', name: 'Sunny Window', category: 'decoration', slot: 'window', description: 'Curtains and sunshine.', price: 50, minLevel: 1 },
  { id: 'win_garden', name: 'Garden View', category: 'decoration', slot: 'window', description: 'Flowers and a blue sky.', price: 100, minLevel: 2 },
  { id: 'shelf_plant', name: 'Potted Plant', category: 'decoration', slot: 'shelf', description: 'A little bit of green.', price: 40, minLevel: 1 },
  { id: 'shelf_books', name: 'Book Stack', category: 'decoration', slot: 'shelf', description: 'For a clever kitty.', price: 70, minLevel: 2 },
  { id: 'shelf_fish', name: 'Fish Bowl', category: 'decoration', slot: 'shelf', description: 'Watching, always watching.', price: 120, minLevel: 4 },  { id: 'win_night', name: 'Moonlit Window', category: 'decoration', slot: 'window', description: 'Stars and a moon.', price: 110, minLevel: 3 },
  { id: 'shelf_lamp', name: 'Mood Lamp', category: 'decoration', slot: 'shelf', description: 'Warm, soft light.', price: 80, minLevel: 2 },
  { id: 'shelf_trophy', name: 'Golden Trophy', category: 'decoration', slot: 'shelf', description: 'Proud kitty, proud owner.', price: 150, minLevel: 4 },
]

const BY_ID = new Map(ITEMS.map((i) => [i.id, i]))
export const getItem = (id: string): ItemDef | undefined => BY_ID.get(id)
export const STARTER_ITEMS = ITEMS.filter((i) => i.starter)
export const SHOP_ITEMS = ITEMS.filter((i) => !i.unlimited && !i.starter)

export const CATEGORY_LABELS: Record<ItemDef['category'], string> = {
  food: 'Food',
  toy: 'Toys',
  accessory: 'Style',
  decoration: 'Decor',
  bed: 'Beds',
}
