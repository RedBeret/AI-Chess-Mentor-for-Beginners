
// Chess strategy system with categorized tips and explanations

export type ChessPhase = 'opening' | 'middlegame' | 'endgame' | 'general';

export interface StrategyTip {
  id: string;
  name: string;
  description: string;
  phase: ChessPhase;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

// Core opening strategies
export const openingStrategies: StrategyTip[] = [
  {
    id: 'opening-center',
    name: "Control the Center",
    description: "Try to control the central squares (d4, d5, e4, e5) with your pawns and pieces. The center is crucial for mobility and attacking options.",
    phase: 'opening',
    difficultyLevel: 'beginner'
  },
  {
    id: 'opening-develop',
    name: "Develop Your Pieces",
    description: "Move your knights and bishops out early to prepare for attack and defense. Aim to have all minor pieces developed before making major attacks.",
    phase: 'opening',
    difficultyLevel: 'beginner'
  },
  {
    id: 'opening-castle',
    name: "Castle Early",
    description: "Move your king to safety by castling as soon as possible, ideally within the first 6-10 moves.",
    phase: 'opening',
    difficultyLevel: 'beginner'
  },
  {
    id: 'opening-tempo',
    name: "Don't Waste Tempo",
    description: "Avoid moving the same piece multiple times in the opening. Each move should contribute to development or control.",
    phase: 'opening',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'opening-queen',
    name: "Don't Bring Queen Out Early",
    description: "Avoid moving your queen out too early as it can become a target for enemy pieces and waste valuable development time.",
    phase: 'opening',
    difficultyLevel: 'intermediate'
  },
];

// Middle game strategies
export const middlegameStrategies: StrategyTip[] = [
  {
    id: 'middlegame-activity',
    name: "Maximize Piece Activity",
    description: "Position your pieces where they control the most squares and coordinate well with other pieces.",
    phase: 'middlegame',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'middlegame-pawnstructure',
    name: "Pawn Structure",
    description: "Pay attention to your pawn structure. Avoid isolated or doubled pawns when possible, and look for opportunities to create passed pawns.",
    phase: 'middlegame',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'middlegame-weakpoints',
    name: "Exploit Weak Squares",
    description: "Identify and occupy weak squares in your opponent's position - especially those that cannot be defended by pawns.",
    phase: 'middlegame',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'middlegame-outposts',
    name: "Knight Outposts",
    description: "Knights are powerful when placed in central positions protected by pawns, especially when they can't be attacked by enemy pawns.",
    phase: 'middlegame',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'middlegame-bishops',
    name: "Bishop Pairs",
    description: "Try to keep both of your bishops, as they work well together covering different colored squares. The bishop pair is especially strong in open positions.",
    phase: 'middlegame',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'middlegame-open-files',
    name: "Rooks on Open Files",
    description: "Place your rooks on files (columns) with no pawns to maximize their effectiveness and potentially penetrate to the seventh rank.",
    phase: 'middlegame',
    difficultyLevel: 'intermediate'
  },
];

// Endgame strategies
export const endgameStrategies: StrategyTip[] = [
  {
    id: 'endgame-king',
    name: "Activate Your King",
    description: "In the endgame, your king becomes a strong piece. Bring it to the center or toward the action when safe to do so.",
    phase: 'endgame',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'endgame-passed-pawns',
    name: "Create Passed Pawns",
    description: "A passed pawn (one with no opposing pawns in front of it or on adjacent files) can become a queen and win the game.",
    phase: 'endgame',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'endgame-opposition',
    name: "Use the Opposition",
    description: "When kings face each other, the player who doesn't have to move often has the advantage (the opposition).",
    phase: 'endgame',
    difficultyLevel: 'advanced'
  },
  {
    id: 'endgame-zugzwang',
    name: "Create Zugzwang",
    description: "Force your opponent into a position where any move will worsen their position. This is particularly effective in endgames.",
    phase: 'endgame',
    difficultyLevel: 'advanced'
  },
];

// General advice that applies to all phases
export const generalStrategies: StrategyTip[] = [
  {
    id: 'general-threats',
    name: "Respond to Threats",
    description: "Always check what your opponent is threatening with their last move and respond appropriately.",
    phase: 'general',
    difficultyLevel: 'beginner'
  },
  {
    id: 'general-captures',
    name: "Analyze All Captures",
    description: "Before moving, consider all possible captures and exchanges to ensure you're not missing tactical opportunities.",
    phase: 'general',
    difficultyLevel: 'beginner'
  },
  {
    id: 'general-checks',
    name: "Consider All Checks",
    description: "Checks force your opponent to respond in limited ways. Always look for checking opportunities that can disrupt their plans.",
    phase: 'general',
    difficultyLevel: 'beginner'
  },
  {
    id: 'general-think-ahead',
    name: "Think Ahead",
    description: "Try to anticipate what your opponent will do after your move, and have a plan ready.",
    phase: 'general',
    difficultyLevel: 'beginner'
  },
  {
    id: 'general-forks',
    name: "Watch for Forks",
    description: "Be on the lookout for opportunities where one piece can attack two or more of your opponent's pieces simultaneously.",
    phase: 'general',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'general-pins',
    name: "Create Pins",
    description: "A pin restricts an enemy piece's movement because moving would expose a more valuable piece behind it.",
    phase: 'general',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'general-skewers',
    name: "Look for Skewers",
    description: "A skewer is like a pin in reverse - it attacks a valuable piece that, when moved, exposes a less valuable piece behind it.",
    phase: 'general',
    difficultyLevel: 'intermediate'
  },
  {
    id: 'general-material',
    name: "Count Material",
    description: "Regularly assess the material balance. A typical value system is: pawn=1, knight/bishop=3, rook=5, queen=9.",
    phase: 'general',
    difficultyLevel: 'beginner'
  },
];

// Combine all strategies into one array
export const allStrategies: StrategyTip[] = [
  ...openingStrategies,
  ...middlegameStrategies,
  ...endgameStrategies,
  ...generalStrategies
];

// Function to get strategy tips by phase
export function getStrategyByPhase(phase: ChessPhase, count: number = 3): StrategyTip[] {
  const strategies = phase === 'general' ? generalStrategies : 
                     phase === 'opening' ? openingStrategies :
                     phase === 'middlegame' ? middlegameStrategies : 
                     endgameStrategies;
  
  // Shuffle and return the requested number of strategies
  return shuffleArray(strategies).slice(0, count);
}

// Function to get strategies by difficulty level
export function getStrategyByDifficulty(level: 'beginner' | 'intermediate' | 'advanced', count: number = 3): StrategyTip[] {
  const filteredStrategies = allStrategies.filter(strategy => strategy.difficultyLevel === level);
  return shuffleArray(filteredStrategies).slice(0, count);
}

// Function to get a random strategy
export function getRandomStrategy(): StrategyTip {
  return allStrategies[Math.floor(Math.random() * allStrategies.length)];
}

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
