import { Product } from './types';

export const DEFAULT_AVATAR_URL = "https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/avatars/default.png";
export const SUPABASE_ASSETS_BASE = "https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/";


export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Ancient Red Dragon",
    category: "D&D",
    scale: "Gargantuan",
    price: 85.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c",
    badge: "New Arrival",
    description: "Born of the primordial fires of the First Mountain, this Ancient Red Dragon stands as a testament to destruction. Its scales, harder than adamantite, shimmer with the heat of a thousand forged suns. This model features intricate detailing on the wings and a dynamic pose that captures the moment before a breath weapon attack. Perfect for the climax of any high-level campaign."
  },
  {
    id: '2',
    name: "The Eye Tyrant",
    category: "D&D",
    scale: "Large",
    price: 42.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
    description: "A paranoid aberration floating in the darkness of the Deep Down. Its central eye creates an anti-magic cone, while its eyestalks rain death upon adventurers foolish enough to enter its lair. Sculpted with manic attention to detail, each eye-stalk is distinct, and the central maw is wide enough to consume a halfling whole."
  },
  {
    id: '3',
    name: "Astral Marine",
    category: "Warhammer",
    scale: "Medium",
    price: 15.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
    badge: "Best Seller",
    description: "Genetically enhanced for the void wars, the Astral Marine is the Emperor's shield against cosmic horrors. Clad in ceramite power armor, this model wields a heavy bolter and carries the sigils of the Eternal Crusade. Comes with three interchangeable helmet options."
  },
  {
    id: '4',
    name: "Oathbound Paladin",
    category: "D&D",
    scale: "Medium",
    price: 12.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E",
    description: "Sworn to the Order of the Golden Sun, this Paladin serves as a beacon of hope in the encroaching darkness. The model captures the flowing motion of a divine smite, with holy scriptures engraved into the armor plates. Shield and sword are separate parts for easy painting."
  },
  {
    id: '5',
    name: "Dwarven Forge Lord",
    category: "D&D",
    scale: "Medium",
    price: 14.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c",
    description: "Master of the Anvil and Keeper of the Runes. The Forge Lord commands the respect of the mountain clans. This miniature features a magnificent braided beard, a rune-etched warhammer, and heavy plate armor adorned with clan geometric patterns."
  },
  {
    id: '6',
    name: "Cyber-Ronin 2099",
    category: "Sci-Fi",
    scale: "Medium",
    price: 18.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
    description: "A mercenary from the neon-soaked streets of Neo-Tokyo. Half-flesh, half-chrome, this Ronin wields a mono-molecular katana capable of slicing through tank armor. The model includes translucent resin parts for the energy blade and cybernetic eyes."
  },
  {
    id: '7',
    name: "Lich King's Avatar",
    category: "D&D",
    scale: "Large",
    price: 35.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
    description: "The physical manifestation of the Undying One. Floating above a base of swirling tormented souls, the Avatar commands the legions of the dead. The tattered robes and ancient crown are sculpted to show centuries of decay and power."
  },
  {
    id: '8',
    name: "Forest Guardian",
    category: "Anime",
    scale: "Large",
    price: 28.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E",
    description: "Protector of the Spirit Grove, this creature is a fusion of nature and magic. Inspired by classic animation, the Forest Guardian stands ready to defend the wilds. The model features intricate fur textures and includes a small forest spirit companion."
  },
  {
    id: '9',
    name: "Orc Warlord",
    category: "Movies",
    scale: "Medium",
    price: 16.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
    description: "Might makes right. This Warlord has united the clans under one banner—his. Clad in scavenged plate and wielding a massive battleaxe, this model exudes raw power and aggression. A perfect commander for your horde armies."
  },
  // Added Products for Pagination Testing
  {
    id: '10',
    name: "Celestial Archon",
    category: "D&D",
    scale: "Large",
    price: 38.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E",
    description: "A being of pure light and justice. The Archon's wings are sculpted with individual feathers, and its flaming sword casts a glow on the battlefield."
  },
  {
    id: '11',
    name: "Deep Sea Kraken",
    category: "Movies",
    scale: "Gargantuan",
    price: 90.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
    description: "Terror of the high seas. This massive model features writhing tentacles that can be positioned to grip ship models or unfortunate sailors."
  },
  {
    id: '12',
    name: "Goblin Tinkerer",
    category: "Warhammer",
    scale: "Small",
    price: 10.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
    description: "Crazy inventions and explosives are his trade. This small but detailed model is covered in gears, goggles, and unstable potions."
  },
  {
    id: '13',
    name: "Elven Ranger",
    category: "D&D",
    scale: "Medium",
    price: 12.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c",
    description: "Silent as the wind. This ranger is posed drawing a bow, with a cloak that blends into the forest floor."
  },
  {
    id: '14',
    name: "Chaos Brute",
    category: "Warhammer",
    scale: "Large",
    price: 32.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
    description: "Twisted by dark energies, this brute is a mass of muscle and spikes. A terrifying frontline breaker for chaos armies."
  },
  {
    id: '15',
    name: "Mecha-Dragon",
    category: "Sci-Fi",
    scale: "Gargantuan",
    price: 75.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
    description: "Biology meets technology. This dragon has been augmented with jet thrusters and laser cannons."
  },
  {
    id: '16',
    name: "Vampire Lord",
    category: "D&D",
    scale: "Medium",
    price: 15.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E",
    description: "Elegant and deadly. The Vampire Lord stands with a chalice of blood, wearing armor that dates back to an ancient empire."
  },
  {
    id: '17',
    name: "Space Explorer",
    category: "Sci-Fi",
    scale: "Medium",
    price: 12.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
    description: "Ready for the unknown. This explorer carries a scanner and a plasma pistol, wearing a suit designed for hostile atmospheres."
  },
  {
    id: '18',
    name: "Iron Golem",
    category: "D&D",
    scale: "Large",
    price: 28.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c",
    description: "Unstoppable guardian. Crafted from heavy iron plates, this golem is immune to most magic and hits like a battering ram."
  },
  {
    id: '19',
    name: "Succubus Queen",
    category: "Anime",
    scale: "Medium",
    price: 16.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
    description: "Beautiful and dangerous. She wields a whip of fire and has large bat-like wings."
  }
];