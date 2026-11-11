# My Little Kitty

A cozy browser virtual-pet game. React + TypeScript + Vite + Tailwind + Framer Motion + Zustand.

```
npm install
npm run dev     # play
npm test        # unit tests: game rules, saves, quests, mini-game
npm run build
```

- `src/game/` – pure game rules (config, items, quests, mechanics, save, mini-game). No React.
- `src/store/useGame.ts` – Zustand store; autosaves to LocalStorage (`mylittlekitty.save`, schema v1).
- `src/components/` – UI. Cat and room art are original SVG in `components/cat/` and can be swapped for final artwork.
- Tuning: all balance values live in `src/game/config.ts`.

## Languages & help

The game is available in English and Hungarian (EN/HU switch at the top, remembered between visits). The Help button explains how to care for the kitty and how to earn coins and XP. Texts live in `src/i18n/`.

## Care features
- **Litter box**: fills over time and with meals; clean it with the Litter button or by tapping the box. A messy box only slows Joy regeneration, never harms the cat.
- **Kitty wishes**: the cat asks for something specific; fulfilling it gives bonus XP, coins and affection.
- **Snooze**: pauses stat decay while you are away.
- 46 items, 5 daily quests (16 templates), 16 achievements.
