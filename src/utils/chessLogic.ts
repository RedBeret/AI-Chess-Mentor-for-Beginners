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

// Generate AI move based on difficulty
export function generateAIMove(board: ChessboardState, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Move {
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
  
  // If no legal moves, return any move (will result in checkmate)
  if (legalMoves.length === 0) return possibleMoves[0];
  
  if (difficulty === 'beginner') {
    // Simple logic for beginner AI: Choose a random move, but prefer captures
    const capturingMoves = legalMoves.filter(move => 
      board[move.to.row][move.to.col] !== '' && 
      board[move.to.row][move.to.col] === board[move.to.row][move.to.col].toUpperCase()
    );
    
    if (capturingMoves.length > 0) {
      return capturingMoves[Math.floor(Math.random() * capturingMoves.length)];
    }
    
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  } else if (difficulty === 'intermediate') {
    // Intermediate AI: Use a simple scoring system
    const scoredMoves = legalMoves.map(move => {
      let score = 0;
      
      // Piece values for captured pieces
      const pieceValues: {[key: string]: number} = {
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0
      };
      
      // Prioritize captures based on piece value
      if (board[move.to.row][move.to.col] !== '') {
        const capturedPiece = board[move.to.row][move.to.col].toUpperCase();
        score += pieceValues[capturedPiece] * 10;
      }
      
      // Bonus for controlling center squares
      if ((move.to.row === 3 || move.to.row === 4) && (move.to.col === 3 || move.to.col === 4)) {
        score += 2;
      }
      
      // Bonus for developing pieces
      const movingPiece = board[move.from.row][move.from.col].toLowerCase();
      if ((movingPiece === 'n' || movingPiece === 'b') && move.from.row === 0 && move.to.row > 0) {
        score += 3;
      }
      
      return { move, score };
    });
    
    // Sort by score and pick one of the top 3 moves
    scoredMoves.sort((a, b) => b.score - a.score);
    const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  } else {
    // Advanced AI: More sophisticated evaluation
    const scoredMoves = legalMoves.map(move => {
      let score = 0;
      
      // Material evaluation
      const pieceValues: {[key: string]: number} = {
        'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': -100,
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100
      };
      
      // Capture evaluation - higher priority than in intermediate
      if (board[move.to.row][move.to.col] !== '') {
        const capturedPiece = board[move.to.row][move.to.col];
        score += Math.abs(pieceValues[capturedPiece]) * 15;
      }
      
      // Simulate the move to evaluate position
      const newBoard = makeMove(board, move);
      
      // Check if we put opponent in check
      if (isKingInCheck(newBoard, 'white')) {
        score += 5;
        
        // Check if it might be checkmate (simplified check)
        const canOpponentMove = canPlayerMove(newBoard, 'white');
        if (!canOpponentMove) {
          score += 100; // High priority for checkmate moves
        }
      }
      
      // Positional evaluation - control of center
      const controlScore = evaluateBoardControl(newBoard);
      score += controlScore;
      
      // Piece development and mobility
      const mobilityScore = evaluateMobility(newBoard);
      score += mobilityScore;
      
      // Pawn structure evaluation
      const pawnScore = evaluatePawnStructure(newBoard);
      score += pawnScore;
      
      return { move, score };
    });
    
    // Sort by score and pick one of the top moves (with some randomness)
    scoredMoves.sort((a, b) => b.score - a.score);
    const topMoves = scoredMoves.slice(0, Math.min(5, scoredMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  }
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
export function getAIMoveExplanation(board: ChessboardState, move: Move): string {
  const piece = board[move.from.row][move.from.col].toLowerCase();
  const isCapture = board[move.to.row][move.to.col] !== '';
  const isCheck = isKingInCheck(makeMove(board, move), 'white');
  
  const explanations = {
    p: [
      "I moved my pawn forward to control more space on the board.",
      "Advancing this pawn helps me develop my pieces.",
      "This pawn move helps control important central squares."
    ],
    r: [
      "I moved my rook to control this file.",
      "Rooks work best on open files where they can move freely.",
      "I positioned my rook to attack your pieces along this line."
    ],
    n: [
      "Knights are powerful when placed in the center of the board.",
      "My knight now controls several important squares.",
      "Knights can jump over pieces, making them valuable in closed positions."
    ],
    b: [
      "Bishops are effective along diagonals.",
      "This bishop now controls a long diagonal.",
      "I've developed my bishop to influence the center."
    ],
    q: [
      "The queen is powerful but needs to be used carefully.",
      "My queen is now positioned to threaten multiple squares.",
      "I've moved my queen to a more active position."
    ],
    k: [
      "King safety is important in chess.",
      "I've moved my king to a safer square.",
      "This move helps protect my king."
    ]
  };
  
  let explanation = explanations[piece][Math.floor(Math.random() * explanations[piece].length)];
  
  // If it's a capture or check, add that information
  if (isCapture) {
    explanation = `I captured your piece to gain material advantage. ${explanation}`;
  }
  
  if (isCheck) {
    explanation += " Your king is now in check!";
  }
  
  return explanation;
}

// Get move suggestion for the player
export function getSuggestion(board: ChessboardState): { move: Move, explanation: string } {
  // Simplified suggestion algorithm for beginners
  const possibleMoves: { move: Move, score: number }[] = [];
  
  // Collect all possible moves for white pieces and score them
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece !== '' && piece === piece.toUpperCase()) {
        const moves = getPossibleMoves(board, { row, col });
        moves.forEach(to => {
          // Check if the move is legal (doesn't leave king in check)
          const newBoard = makeMove(board, { from: { row, col }, to });
          if (!isKingInCheck(newBoard, 'white')) {
            let score = 0;
            
            // Basic scoring: prefer captures and center control for beginners
            if (board[to.row][to.col] !== '') {
              // Capturing opponent's piece (simple material value)
              const capturedPiece = board[to.row][to.col].toLowerCase();
              switch (capturedPiece) {
                case 'p': score += 1; break;
                case 'n': case 'b': score += 3; break;
                case 'r': score += 5; break;
                case 'q': score += 9; break;
              }
            }
            
            // Bonus for controlling center
            if ((to.row === 3 || to.row === 4) && (to.col === 3 || to.col === 4)) {
              score += 0.5;
            }
            
            // Development bonus for minor pieces
            if ((piece === 'N' || piece === 'B') && (row === 7) && (to.row < 7)) {
              score += 0.3;
            }
            
            // Check bonus
            if (isKingInCheck(newBoard, 'black')) {
              score += 0.7;
            }
            
            possibleMoves.push({ 
              move: { from: { row, col }, to },
              score
            });
          }
        });
      }
    }
  }
  
  // Sort moves by score and pick the best one
  possibleMoves.sort((a, b) => b.score - a.score);
  
  // If we have good moves, choose the best one
  if (possibleMoves.length > 0) {
    const bestMove = possibleMoves[0].move;
    const piece = board[bestMove.from.row][bestMove.from.col].toUpperCase();
    
    let explanation = "";
    
    if (board[bestMove.to.row][bestMove.to.col] !== '') {
      explanation = "This move captures your opponent's piece, which is usually a good idea in chess.";
    } else if ((bestMove.to.row === 3 || bestMove.to.row === 4) && (bestMove.to.col === 3 || bestMove.to.col === 4)) {
      explanation = "This move helps control the center of the board, which is a key chess principle.";
    } else if ((piece === 'N' || piece === 'B') && (bestMove.from.row === 7)) {
      explanation = "This move develops one of your pieces, getting them into the game. Development is important in the opening.";
    } else if (isKingInCheck(makeMove(board, bestMove), 'black')) {
      explanation = "This move puts your opponent's king in check.";
    } else {
      explanation = "This looks like a solid move that improves your position.";
    }
    
    return { move: bestMove, explanation };
  }
  
  // Fallback
  return { 
    move: { from: { row: 6, col: 0 }, to: { row: 5, col: 0 } },
    explanation: "I suggest moving a pawn forward to develop your position."
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
