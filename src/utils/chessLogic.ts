// Type definitions for the chess game
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | 'P' | 'R' | 'N' | 'B' | 'Q' | 'K' | '';
export type Position = { row: number; col: number };
export type Move = { from: Position; to: Position };
export type ChessboardState = PieceType[][];
export type Player = 'white' | 'black';
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

// Initial board setup
export const initialBoard: ChessboardState = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

// Castling rights and en passant tracking
export interface GameState {
  board: ChessboardState;
  currentPlayer: Player;
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  enPassantTarget: Position | null;
  status: GameStatus;
}

// Initial game state
export const initialGameState: GameState = {
  board: initialBoard,
  currentPlayer: 'white',
  castlingRights: {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  },
  enPassantTarget: null,
  status: 'playing'
};

// Check if a position is within the bounds of the chessboard
export function isWithinBounds(position: Position): boolean {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
}

// Check if a piece belongs to a specific player
export function isPieceOfPlayer(piece: PieceType, player: Player): boolean {
  if (piece === '') return false;
  return (player === 'white' && piece === piece.toUpperCase()) || 
         (player === 'black' && piece === piece.toLowerCase());
}

// Generate possible moves for a given piece
export function getPossibleMoves(board: ChessboardState, position: Position): Position[] {
  const { row, col } = position;
  const piece = board[row][col];
  let moves: Position[] = [];

  if (piece === '') return moves;

  const isWhite = piece === piece.toUpperCase();
  const pieceType = piece.toLowerCase();

  // Pawn movement
  if (pieceType === 'p') {
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    // Move forward one square
    const oneForward = { row: row + direction, col };
    if (isWithinBounds(oneForward) && board[oneForward.row][oneForward.col] === '') {
      moves.push(oneForward);
      
      // Move forward two squares on first move
      if (row === startRow) {
        const twoForward = { row: row + 2 * direction, col };
        if (isWithinBounds(twoForward) && board[twoForward.row][twoForward.col] === '') {
          moves.push(twoForward);
        }
      }
    }

    // Capture diagonally
    const captures = [
      { row: row + direction, col: col - 1 },
      { row: row + direction, col: col + 1 }
    ];

    captures.forEach(capture => {
      if (isWithinBounds(capture)) {
        const targetPiece = board[capture.row][capture.col];
        if (targetPiece !== '' && isWhite !== (targetPiece === targetPiece.toUpperCase())) {
          moves.push(capture);
        }
      }
    });
  }

  // Knight movement
  if (pieceType === 'n') {
    const knightMoves = [
      { row: row - 2, col: col - 1 },
      { row: row - 2, col: col + 1 },
      { row: row - 1, col: col - 2 },
      { row: row - 1, col: col + 2 },
      { row: row + 1, col: col - 2 },
      { row: row + 1, col: col + 2 },
      { row: row + 2, col: col - 1 },
      { row: row + 2, col: col + 1 }
    ];

    knightMoves.forEach(move => {
      if (isWithinBounds(move)) {
        const targetPiece = board[move.row][move.col];
        if (targetPiece === '' || isWhite !== (targetPiece === targetPiece.toUpperCase())) {
          moves.push(move);
        }
      }
    });
  }

  // Rook, Bishop and Queen movement (simplified for beginners)
  if (pieceType === 'r' || pieceType === 'b' || pieceType === 'q') {
    const directions = [];
    if (pieceType === 'r' || pieceType === 'q') {
      // Horizontal and vertical directions for rook and queen
      directions.push({ rowDir: 0, colDir: 1 });  // right
      directions.push({ rowDir: 0, colDir: -1 }); // left
      directions.push({ rowDir: 1, colDir: 0 });  // down
      directions.push({ rowDir: -1, colDir: 0 }); // up
    }
    if (pieceType === 'b' || pieceType === 'q') {
      // Diagonal directions for bishop and queen
      directions.push({ rowDir: 1, colDir: 1 });   // down-right
      directions.push({ rowDir: 1, colDir: -1 });  // down-left
      directions.push({ rowDir: -1, colDir: 1 });  // up-right
      directions.push({ rowDir: -1, colDir: -1 }); // up-left
    }

    directions.forEach(dir => {
      let currentRow = row + dir.rowDir;
      let currentCol = col + dir.colDir;
      
      while (isWithinBounds({ row: currentRow, col: currentCol })) {
        const targetPiece = board[currentRow][currentCol];
        if (targetPiece === '') {
          moves.push({ row: currentRow, col: currentCol });
        } else {
          // If we hit a piece, we can only capture if it's an opponent's piece
          if (isWhite !== (targetPiece === targetPiece.toUpperCase())) {
            moves.push({ row: currentRow, col: currentCol });
          }
          break; // Stop in this direction
        }
        currentRow += dir.rowDir;
        currentCol += dir.colDir;
      }
    });
  }

  // King movement (now with castling)
  if (pieceType === 'k') {
    // Standard king moves
    const kingMoves = [
      { row: row - 1, col: col - 1 },
      { row: row - 1, col: col },
      { row: row - 1, col: col + 1 },
      { row: row, col: col - 1 },
      { row: row, col: col + 1 },
      { row: row + 1, col: col - 1 },
      { row: row + 1, col: col },
      { row: row + 1, col: col + 1 }
    ];

    kingMoves.forEach(move => {
      if (isWithinBounds(move)) {
        const targetPiece = board[move.row][move.col];
        if (targetPiece === '' || isWhite !== (targetPiece === targetPiece.toUpperCase())) {
          moves.push(move);
        }
      }
    });
  }

  return moves;
}

// Get king position for a player
export function getKingPosition(board: ChessboardState, player: Player): Position | null {
  const kingPiece = player === 'white' ? 'K' : 'k';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === kingPiece) {
        return { row, col };
      }
    }
  }
  
  return null; // King not found (should not happen in a valid game)
}

// Check if a king is in check
export function isKingInCheck(board: ChessboardState, player: Player): boolean {
  const kingPos = getKingPosition(board, player);
  if (!kingPos) return false;
  
  const opponent = player === 'white' ? 'black' : 'white';
  
  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece !== '' && isPieceOfPlayer(piece, opponent)) {
        const moves = getPossibleMoves(board, { row, col });
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Make a move and return the new board state
export function makeMove(board: ChessboardState, move: Move): ChessboardState {
  const newBoard: ChessboardState = JSON.parse(JSON.stringify(board));
  const { from, to } = move;
  
  // Move the piece
  newBoard[to.row][to.col] = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = '';
  
  // Check for pawn promotion at the end of the board
  const piece = newBoard[to.row][to.col];
  if ((piece === 'P' && to.row === 0) || (piece === 'p' && to.row === 7)) {
    // Promote to queen automatically for simplicity
    newBoard[to.row][to.col] = piece === 'P' ? 'Q' : 'q';
  }
  
  return newBoard;
}

// Check game status after a move
export function checkGameStatus(board: ChessboardState, player: Player): GameStatus {
  // Check if the current player's king is in check
  const isInCheck = isKingInCheck(board, player);
  
  // Check if the player has any legal moves
  let hasLegalMoves = false;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece !== '' && isPieceOfPlayer(piece, player)) {
        const possibleMoves = getPossibleMoves(board, { row, col });
        
        // Check if any move is legal (doesn't leave king in check)
        for (const move of possibleMoves) {
          const newBoard = makeMove(board, { from: { row, col }, to: move });
          if (!isKingInCheck(newBoard, player)) {
            hasLegalMoves = true;
            break;
          }
        }
      }
      if (hasLegalMoves) break;
    }
    if (hasLegalMoves) break;
  }
  
  if (!hasLegalMoves) {
    return isInCheck ? 'checkmate' : 'stalemate';
  }
  
  return isInCheck ? 'check' : 'playing';
}

// Importing strategy types and sample strategies
import { StrategyTip, allStrategies, openingStrategies, middlegameStrategies, endgameStrategies } from './chessStrategies';

// Generate AI move based on difficulty
export interface AIMoveResult {
  move: Move;
  strategyApplied?: StrategyTip | null;
  reason?: string; 
}

export function generateAIMove(board: ChessboardState, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): AIMoveResult {
  const possibleMoves: Move[] = [];
  
  // Collect all possible moves for black pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece !== '' && piece === piece.toLowerCase()) {
        const moves = getPossibleMoves(board, { row, col });
        moves.forEach(to => {
          possibleMoves.push({ 
            from: { row, col },
            to
          });
        });
      }
    }
  }
  
  // Filter moves that don't leave the king in check
  const legalMoves = possibleMoves.filter(move => {
    const newBoard = makeMove(board, move);
    return !isKingInCheck(newBoard, 'black');
  });

  if (legalMoves.length === 0) {
    // Should ideally not happen if game status is checked correctly before calling
    return { move: possibleMoves[0] || { from: {row:0,col:0}, to: {row:0,col:0} }, reason: "No legal moves available." };
  }

  let bestMove: Move = legalMoves[0];
  let strategyApplied: StrategyTip | null = null;
  let reason: string = "Making a general move.";

  if (difficulty === 'beginner') {
    const capturingMoves = legalMoves.filter(move =>
      board[move.to.row][move.to.col] !== '' &&
      board[move.to.row][move.to.col] === board[move.to.row][move.to.col].toUpperCase()
    );

    if (capturingMoves.length > 0) {
      bestMove = capturingMoves[Math.floor(Math.random() * capturingMoves.length)];
      reason = "Capturing an opponent's piece.";
      // Potentially link to a general capture strategy if one exists
    } else {
      bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      reason = "Making a random available move.";
    }
  } else if (difficulty === 'intermediate') {
    const scoredMoves = legalMoves.map(move => {
      let score = 0;
      let currentReason = "";
      let currentStrategy: StrategyTip | null = null;

      const pieceValues: {[key: string]: number} = { 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0 };
      const movingPieceType = board[move.from.row][move.from.col].toLowerCase();

      if (board[move.to.row][move.to.col] !== '') {
        const capturedPiece = board[move.to.row][move.to.col].toUpperCase();
        score += pieceValues[capturedPiece] * 10;
        currentReason = "Capturing a piece.";
      }

      if ((move.to.row === 3 || move.to.row === 4) && (move.to.col === 3 || move.to.col === 4)) {
        score += 2;
        currentReason = currentReason ? currentReason + " and controlling the center." : "Controlling the center.";
        currentStrategy = openingStrategies.find(s => s.id === 'opening-center') || null;
      }
      
      // Check for castling (simplified: king moves two squares)
      if (movingPieceType === 'k' && Math.abs(move.to.col - move.from.col) === 2) {
        score += 4; // Bonus for castling
        currentReason = "Castling for king safety.";
        currentStrategy = openingStrategies.find(s => s.id === 'opening-castle') || null;
      }

      if ((movingPieceType === 'n' || movingPieceType === 'b') && move.from.row === 0 && move.to.row > 0) { // Black's pieces start at row 0 and 1
        score += 3;
        currentReason = currentReason ? currentReason + " and developing a piece." : "Developing a piece.";
        if (!currentStrategy) currentStrategy = openingStrategies.find(s => s.id === 'opening-develop') || null;
      }
      
      // Add a small bonus for checks
      const tempBoardCheck = makeMove(board, move);
      if (isKingInCheck(tempBoardCheck, 'white')) {
        score += 1;
        currentReason = currentReason ? currentReason + " and delivering a check." : "Delivering a check.";
      }

      return { move, score, reason: currentReason, strategy: currentStrategy };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    const topChoice = scoredMoves[0];
    bestMove = topChoice.move;
    reason = topChoice.reason || "Applying a tactical or positional improvement.";
    strategyApplied = topChoice.strategy;

  } else { // Advanced
    // More sophisticated evaluation (can be expanded significantly)
    const scoredMoves = legalMoves.map(move => {
      let score = 0;
      let currentReason = "";
      let currentStrategy: StrategyTip | null = null;
      const pieceValues: {[key: string]: number} = { 'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': -100, 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100 };
      const movingPieceType = board[move.from.row][move.from.col].toLowerCase();

      if (board[move.to.row][move.to.col] !== '') {
        const capturedPiece = board[move.to.row][move.to.col];
        score += Math.abs(pieceValues[capturedPiece]) * 15;
        currentReason = "Capturing a valuable piece.";
      }

      const newBoard = makeMove(board, move);
      if (isKingInCheck(newBoard, 'white')) {
        score += 5;
        currentReason = currentReason ? currentReason + " and putting the opponent in check." : "Putting the opponent in check.";
        if (!canPlayerMove(newBoard, 'white')) {
          score += 1000; // Checkmate is the goal
          currentReason = "Aiming for checkmate!";
        }
      }
      
      // Castling for black (king at (0,4))
      if (movingPieceType === 'k' && move.from.row === 0 && move.from.col === 4 && Math.abs(move.to.col - move.from.col) === 2) {
        score += 8; // Higher bonus for castling in advanced
        currentReason = "Castling for king safety.";
        currentStrategy = openingStrategies.find(s => s.id === 'opening-castle') || null;
      }

      score += evaluateBoardControl(newBoard); // Prefers black control
      if (evaluateBoardControl(newBoard) > 0 && !currentStrategy) {
         currentStrategy = allStrategies.find(s => s.id === 'opening-center' || s.id === 'middlegame-activity');
         if(currentStrategy && !currentReason) currentReason = "Improving piece activity and control.";
      }
      score += evaluateMobility(newBoard); // Prefers black mobility
      score += evaluatePawnStructure(newBoard); // Prefers good black pawn structure
      if (evaluatePawnStructure(newBoard) > 0 && !currentStrategy) {
        currentStrategy = allStrategies.find(s => s.id === 'middlegame-pawnstructure' || s.id === 'endgame-passed-pawns');
        if(currentStrategy && !currentReason) currentReason = "Improving pawn structure.";
      }


      return { move, score, reason: currentReason, strategy: currentStrategy };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    const topChoice = scoredMoves[0];
    bestMove = topChoice.move;
    reason = topChoice.reason || "Making a strategically sound move.";
    strategyApplied = topChoice.strategy;
  }
  return { move: bestMove, strategyApplied, reason };
}

// Helper for advanced AI: Check if a player can make any legal move
function canPlayerMove(board: ChessboardState, player: Player): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece !== '' && isPieceOfPlayer(piece, player)) {
        const moves = getPossibleMoves(board, { row, col });
        for (const move of moves) {
          const newBoard = makeMove(board, { from: { row, col }, to: move });
          if (!isKingInCheck(newBoard, player)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// Helper for advanced AI: Evaluate control of the board
function evaluateBoardControl(board: ChessboardState): number {
  let score = 0;
  
  // Center squares have higher value
  const centerSquares = [
    { row: 3, col: 3 }, { row: 3, col: 4 },
    { row: 4, col: 3 }, { row: 4, col: 4 }
  ];
  
  // Extended center
  const extendedCenterSquares = [
    { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
    { row: 3, col: 2 }, { row: 3, col: 5 },
    { row: 4, col: 2 }, { row: 4, col: 5 },
    { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }
  ];
  
  // Check control of key squares
  for (const square of centerSquares) {
    const piece = board[square.row][square.col];
    if (piece !== '') {
      if (piece === piece.toLowerCase()) {
        score += 3; // Black controls center
      } else {
        score -= 3; // White controls center
      }
    }
  }
  
  for (const square of extendedCenterSquares) {
    const piece = board[square.row][square.col];
    if (piece !== '') {
      if (piece === piece.toLowerCase()) {
        score += 1; // Black controls extended center
      } else {
        score -= 1; // White controls extended center
      }
    }
  }
  
  return score;
}

// Helper for advanced AI: Evaluate piece mobility
function evaluateMobility(board: ChessboardState): number {
  let score = 0;
  let whiteMoves = 0;
  let blackMoves = 0;
  
  // Count possible moves for each piece
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece !== '') {
        const moves = getPossibleMoves(board, { row, col });
        if (piece === piece.toLowerCase()) {
          blackMoves += moves.length;
        } else {
          whiteMoves += moves.length;
        }
      }
    }
  }
  
  // Black gets a positive score for mobility advantage
  score += (blackMoves - whiteMoves) * 0.1;
  return score;
}

// Helper for advanced AI: Evaluate pawn structure
function evaluatePawnStructure(board: ChessboardState): number {
  let score = 0;
  
  // Count isolated and doubled pawns (these are weak)
  const whitePawnColumns = Array(8).fill(0);
  const blackPawnColumns = Array(8).fill(0);
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === 'P') {
        whitePawnColumns[col]++;
      } else if (board[row][col] === 'p') {
        blackPawnColumns[col]++;
      }
    }
  }
  
  // Score doubled pawns (same column)
  for (let col = 0; col < 8; col++) {
    if (whitePawnColumns[col] > 1) score += 0.5; // White doubled pawns (good for black)
    if (blackPawnColumns[col] > 1) score -= 0.5; // Black doubled pawns (bad for black)
  }
  
  // Score isolated pawns (no pawn on adjacent files)
  for (let col = 0; col < 8; col++) {
    const leftCol = col > 0 ? whitePawnColumns[col - 1] : 0;
    const rightCol = col < 7 ? whitePawnColumns[col + 1] : 0;
    if (whitePawnColumns[col] > 0 && leftCol === 0 && rightCol === 0) {
      score += 0.5; // White isolated pawn (good for black)
    }
    
    const blackLeftCol = col > 0 ? blackPawnColumns[col - 1] : 0;
    const blackRightCol = col < 7 ? blackPawnColumns[col + 1] : 0;
    if (blackPawnColumns[col] > 0 && blackLeftCol === 0 && blackRightCol === 0) {
      score -= 0.5; // Black isolated pawn (bad for black)
    }
  }
  
  // Evaluate passed pawns (no opposing pawns in front or on adjacent files)
  for (let col = 0; col < 8; col++) {
    // Check for white passed pawns
    for (let row = 1; row < 7; row++) {
      if (board[row][col] === 'P') {
        let isPassed = true;
        for (let r = row - 1; r >= 0; r--) {
          for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
            if (board[r][c] === 'p') {
              isPassed = false;
              break;
            }
          }
          if (!isPassed) break;
        }
        if (isPassed) score -= 1; // White passed pawn (bad for black)
      }
    }
    
    // Check for black passed pawns
    for (let row = 1; row < 7; row++) {
      if (board[row][col] === 'p') {
        let isPassed = true;
        for (let r = row + 1; r < 8; r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
            if (board[r][c] === 'P') {
              isPassed = false;
              break;
            }
          }
          if (!isPassed) break;
        }
        if (isPassed) score += 1; // Black passed pawn (good for black)
      }
    }
  }
  
  return score;
}

// Get move explanation for a given move
export function getAIMoveExplanation(board: ChessboardState, aiMoveData: AIMoveResult): string {
  const { move, strategyApplied, reason } = aiMoveData;
  const piece = board[move.from.row][move.from.col].toLowerCase();
  const isCapture = board[move.to.row][move.to.col] !== '';
  const tempBoard = makeMove(board, move); // Create a temporary board *after* the AI's move
  const isCheck = isKingInCheck(tempBoard, 'white'); // Check if the AI's move puts white in check

  let explanation = "";

  if (strategyApplied) {
    explanation = `I'm applying the strategy: "${strategyApplied.name}". ${strategyApplied.description.substring(0, 100)}${strategyApplied.description.length > 100 ? '...' : ''}`;
  } else if (reason) {
    explanation = `My reasoning: ${reason}`;
  } else {
    // Fallback to older generic explanations if no specific reason/strategy
    const genericExplanations: {[key: string]: string[]} = {
      p: ["Moving my pawn to control space.", "Advancing this pawn for development."],
      r: ["Positioning my rook on an open file.", "Activating my rook."],
      n: ["Moving my knight to a more central or active square.", "My knight is looking for outposts."],
      b: ["My bishop is now controlling this diagonal.", "Developing my bishop."],
      q: ["The queen is being brought into a more active role.", "My queen is now threatening multiple squares."],
      k: ["Ensuring my king's safety.", "My king is part of the endgame plan."]
    };
    explanation = genericExplanations[piece]?.[Math.floor(Math.random() * (genericExplanations[piece]?.length || 1))] || "I've made my move.";
  }

  if (isCapture && !explanation.toLowerCase().includes("capture") && !explanation.toLowerCase().includes(strategyApplied?.name.toLowerCase() || "capture")) {
    explanation += " This also involves a capture.";
  }
  if (isCheck) {
    explanation += " Your king is now in check!";
  }

  return explanation.trim();
}

// Get move suggestion for the player
export function getSuggestion(board: ChessboardState): { move: Move, explanation: string, strategyApplied?: StrategyTip | null } {
  // Simplified suggestion algorithm for beginners
  const possibleMoves: { move: Move, score: number, reason?: string, strategy?: StrategyTip | null }[] = [];
  
  // Collect all possible moves for white pieces and score them
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece !== '' && piece === piece.toUpperCase()) { // White's pieces
        const moves = getPossibleMoves(board, { row, col });
        moves.forEach(to => {
          const tempBoard = makeMove(board, { from: { row, col }, to });
          if (!isKingInCheck(tempBoard, 'white')) { // Legal move for white
            let score = 0;
            let reason = "";
            let strategy: StrategyTip | null = null;
            const movingPieceType = piece.toLowerCase();

            // Scoring logic similar to AI's intermediate
            if (board[to.row][to.col] !== '') { // Is it a capture?
              const capturedPiece = board[to.row][to.col].toLowerCase();
              const pieceValues: {[key: string]: number} = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };
              score += (pieceValues[capturedPiece] || 0) * 10;
              reason = "Capturing an opponent's piece is often a good idea.";
            }

            if ((to.row === 3 || to.row === 4) && (to.col === 3 || to.col === 4)) { // Center control
              score += 2;
              reason = reason ? reason + " This also helps control the center." : "This move helps control the center.";
              strategy = openingStrategies.find(s => s.id === 'opening-center') || null;
            }
            
            // Castling for white (king at (7,4))
            if (movingPieceType === 'k' && row === 7 && col === 4 && Math.abs(to.col - col) === 2) {
                score += 4; // Bonus for castling
                reason = "Castling gets your king to safety and develops a rook.";
                strategy = openingStrategies.find(s => s.id === 'opening-castle') || null;
            }


            if ((movingPieceType === 'n' || movingPieceType === 'b') && (row === 7 || row === 6)) { // Minor piece development from starting rows
              if ( (movingPieceType === 'n' && !(row === 7 && (col === 1 || col === 6))) || (movingPieceType === 'b' && !(row === 7 && (col === 2 || col === 5))) ) {
                 // Allow if not on starting square already, or if it is, ensure it's a valid development
              } else if (row === 7 && to.row < 7) { // Moved from starting rank
                score += 3;
                reason = reason ? reason + " It also develops a piece." : "Developing a piece is key in the opening.";
                if (!strategy) strategy = openingStrategies.find(s => s.id === 'opening-develop') || null;
              }
            }

            if (isKingInCheck(tempBoard, 'black')) { // Check opponent
              score += 5; // Bonus for check
              reason = reason ? reason + " Plus, it puts your opponent in check!" : "This move puts your opponent's king in check!";
            }

            possibleMoves.push({ move: { from: { row, col }, to }, score, reason, strategy });
          }
        });
      }
    }
  }

  possibleMoves.sort((a, b) => b.score - a.score);

  if (possibleMoves.length > 0) {
    const bestChoice = possibleMoves[0];
    let finalExplanation = bestChoice.reason || "This looks like a solid move.";
    if (bestChoice.strategy) {
      finalExplanation = `Consider this move. ${bestChoice.reason ? bestChoice.reason + " " : ""}It aligns with the strategy: "${bestChoice.strategy.name}".`;
    }
    if (isKingInCheck(makeMove(board, bestChoice.move), 'black') && !finalExplanation.includes("check")) {
        finalExplanation += " It also delivers a check to the opponent's king.";
    }


    return { move: bestChoice.move, explanation: finalExplanation.trim(), strategyApplied: bestChoice.strategy };
  }

  // Fallback suggestion
  return {
    move: { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } }, // e.g., e2-e4
    explanation: "Try moving a central pawn forward to open lines and control the center. (Strategy: Control the Center)",
    strategyApplied: openingStrategies.find(s => s.id === 'opening-center') || null
  };
}

// Convert position to algebraic notation (e.g., e4)
export function toAlgebraic(position: Position): string {
  const files = 'abcdefgh';
  const ranks = '87654321';
  return files[position.col] + ranks[position.row];
}

// Convert move to algebraic notation (e.g., e2-e4 or exd5)
export function moveToAlgebraic(board: ChessboardState, move: Move): string {
  const from = toAlgebraic(move.from);
  const to = toAlgebraic(move.to);
  const piece = board[move.from.row][move.from.col];
  
  // Simplified notation without special cases for beginners
  return from + '-' + to;
}
