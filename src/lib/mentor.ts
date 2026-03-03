// AI coaching — converts board state + move context into beginner-friendly advice
// dangerouslyAllowBrowser: client-side only, user-provided key stored in localStorage

import Anthropic from '@anthropic-ai/sdk';
import { ChessboardState, Move, GameStatus, AIMoveResult } from '@/utils/chessLogic';

const PIECE_NAMES: Record<string, string> = {
  p: 'black pawn', r: 'black rook', n: 'black knight',
  b: 'black bishop', q: 'black queen', k: 'black king',
  P: 'white pawn', R: 'white rook', N: 'white knight',
  B: 'white bishop', Q: 'white queen', K: 'white king',
};

const FILES = 'abcdefgh';
const RANKS = '87654321';

function squareName(row: number, col: number): string {
  return FILES[col] + RANKS[row];
}

// Produce a text-based board description the model can read
function describeBoard(board: ChessboardState): string {
  const lines: string[] = [];
  for (let row = 0; row < 8; row++) {
    const rank = 8 - row;
    const cells: string[] = [];
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      cells.push(p ? `${squareName(row, col)}:${PIECE_NAMES[p] ?? p}` : '');
    }
    lines.push(`Rank ${rank}: ` + cells.filter(Boolean).join(', '));
  }
  return lines.join('\n');
}

function describeMove(move: Move, board: ChessboardState): string {
  const piece = board[move.from.row][move.from.col];
  const from = squareName(move.from.row, move.from.col);
  const to = squareName(move.to.row, move.to.col);
  const captured = board[move.to.row][move.to.col];
  const pieceName = PIECE_NAMES[piece] ?? piece;
  const capturePart = captured ? `, capturing ${PIECE_NAMES[captured] ?? captured}` : '';
  return `${pieceName} from ${from} to ${to}${capturePart}`;
}

export interface CoachResponse {
  comment: string;   // short plain-english reaction to the AI move
  advice: string;    // what white (the player) should focus on now
}

// Called after the AI (black) moves — explains the move and coaches the player
export async function getMoveCoaching(
  boardAfterMove: ChessboardState,
  boardBeforeMove: ChessboardState,
  aiMoveResult: AIMoveResult,
  gameStatus: GameStatus,
  apiKey: string,
): Promise<CoachResponse> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const moveDesc = describeMove(aiMoveResult.move, boardBeforeMove);
  const strategyNote = aiMoveResult.strategyApplied
    ? `The AI was applying the strategy "${aiMoveResult.strategyApplied.name}".`
    : aiMoveResult.reason
      ? `The AI's reason: ${aiMoveResult.reason}`
      : '';
  const statusNote = gameStatus === 'check' ? 'White is currently in check.' : '';

  const prompt = `You are a patient chess coach helping a beginner improve.

The AI (playing black) just moved: ${moveDesc}.
${strategyNote}
${statusNote}

Current board state (pieces and their squares):
${describeBoard(boardAfterMove)}

In 2-3 short sentences:
1. Explain why the AI made this move in plain language.
2. Give white (the player) one concrete thing to focus on right now.

Keep it encouraging, avoid jargon, no bullet points, no markdown.`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content.find(b => b.type === 'text')?.text ?? '';
  // Split into two parts at the sentence boundary (rough heuristic)
  const sentences = text.split(/(?<=\.)\s+/);
  const comment = sentences.slice(0, Math.ceil(sentences.length / 2)).join(' ').trim();
  const advice = sentences.slice(Math.ceil(sentences.length / 2)).join(' ').trim() || comment;

  return { comment, advice };
}

// Called when the player clicks "Need a hint?"
export async function getHintCoaching(
  board: ChessboardState,
  gameStatus: GameStatus,
  apiKey: string,
): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `You are a patient chess coach helping a beginner. It is white's turn.

Current board state:
${describeBoard(board)}

Status: ${gameStatus === 'check' ? 'White king is in check!' : 'Normal play.'}

Give the player one specific, actionable hint in 1-2 sentences. Name the piece and square.
No spoilers on exact moves — guide their thinking. No jargon, no bullet points, no markdown.`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [{ role: 'user', content: prompt }],
  });

  return msg.content.find(b => b.type === 'text')?.text?.trim() ?? 'Think about controlling the center and developing your pieces.';
}
