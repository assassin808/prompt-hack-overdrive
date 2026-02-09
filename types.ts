
export type Screen = 'menu' | 'level_select' | 'battle' | 'shop' | 'sandbox' | 'tutorial' | 'victory' | 'game_over';

export enum Category {
  SOCIAL = 'Social Engineering',
  ROLE = 'Role Confusion',
  LOGIC = 'Logic Exploits',
  CONTEXT = 'Context Manipulation',
  ENCODE = 'Encoding Tricks'
}

export interface Payload {
  id: string;
  name: string;
  category: Category;
  cost: number;
  power: number;
  template: string;
  description: string;
  source: string;
  realExample?: string;
}

export interface Level {
  id: number;
  name: string;
  secret: string;
  guardianPrompt: string;
  tokenBudget: number;
  difficulty: number;
  intel: string;
  weakness: string;
  rewards: {
    gems: number;
    tokens: number;
  };
}

export interface Turn {
  num: number;
  playerPrompt: string;
  guardianResponse: string;
  tokenCost: number;
  verdict: Verdict;
}

export interface Verdict {
  result: 'full_breach' | 'partial_breach' | 'defended';
  confidence: number;
  reasoning: string;
  extractedInfo: string;
}

export interface GameState {
  currentScreen: Screen;
  gems: number;
  totalTokens: number;
  remainingTokens: number;
  currentLevel: Level | null;
  unlockedLevels: number[];
  purchasedPayloads: string[];
  equippedPayloads: string[];
  battleHistory: Turn[];
  isSandbox: boolean;
  maxTokensPerRequest: number; // New field for user-defined quota
}
