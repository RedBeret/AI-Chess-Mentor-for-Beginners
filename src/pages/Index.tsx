import React, { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import Chessboard from '@/components/Chessboard';
import AIMentor from '@/components/AIMentor';
import MoveHistory from '@/components/MoveHistory';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  initialBoard, 
  ChessboardState, 
  Move, 
  Position, 
  makeMove,
  generateAIMove,
  getAIMoveExplanation,
  getSuggestion,
  toAlgebraic,
  AIMoveResult, // Import AIMoveResult
  checkGameStatus,
  GameStatus
} from '@/utils/chessLogic';

const Index = () => {
  // Game state
  const [board, setBoard] = useState<ChessboardState>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [selectedMove, setSelectedMove] = useState<{ from: Position, possibleMoves: Position[] } | null>(null);
  const [moveHistory, setMoveHistory] = useState<{ board: ChessboardState, move: Move, algebraic: string }[]>([]); // Added algebraic to history
  const [lastAIMoveResult, setLastAIMoveResult] = useState<AIMoveResult | null>(null); // Store full AIMoveResult
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const isMobile = useIsMobile();
  
  // Sound references
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const captureSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio elements
  useEffect(() => {
    moveSoundRef.current = new Audio('/sounds/move.mp3');
    captureSoundRef.current = new Audio('/sounds/capture.mp3');
    
    return () => {
      // Clean up audio resources
      moveSoundRef.current = null;
      captureSoundRef.current = null;
    };
  }, []);
  
  // Sound player function
  const playSound = (isCapture: boolean = false) => {
    if (!soundEnabled) return;
    
    try {
      if (isCapture && captureSoundRef.current) {
        captureSoundRef.current.currentTime = 0;
        captureSoundRef.current.play();
      } else if (moveSoundRef.current) {
        moveSoundRef.current.currentTime = 0;
        moveSoundRef.current.play();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  // Toggle sound function
  const handleToggleSound = () => {
    setSoundEnabled(prev => !prev);
    toast.success(soundEnabled ? "Sound disabled" : "Sound enabled");
  };

  // Handle player move
  const handlePlayerMove = (move: Move) => {
    if (currentPlayer !== 'white' || gameStatus !== 'playing') return;

    const isCapture = board[move.to.row][move.to.col] !== '';
    const newBoard = makeMove(board, move);
    const algebraicMove = toAlgebraic(move.from) + '-' + toAlgebraic(move.to); // Basic algebraic notation

    setBoard(newBoard);
    setMoveHistory([...moveHistory, { board, move, algebraic: algebraicMove }]);
    playSound(isCapture);

    const currentStatus = checkGameStatus(newBoard, 'black'); // Check status for black (AI)
    setGameStatus(currentStatus);

    if (currentStatus === 'playing' || currentStatus === 'check') {
      setCurrentPlayer('black');
      setSelectedMove(null);
      toast.success("Move made! Now it's the AI's turn.");
      setTimeout(() => makeAIMove(newBoard), 1000);
    } else {
      // Handle checkmate/stalemate/draw by player
      setSelectedMove(null);
      toast.info(`Game Over: ${currentStatus}`);
    }
  };

  // AI makes a move
  const makeAIMove = (currentBoard: ChessboardState) => {
    if (gameStatus !== 'playing' && gameStatus !== 'check') return; // AI shouldn't move if game is over

    try {
      const aiMoveResult = generateAIMove(currentBoard, 'intermediate'); // Using intermediate for better strategy display
      const explanation = getAIMoveExplanation(currentBoard, aiMoveResult);
      const isCapture = currentBoard[aiMoveResult.move.to.row][aiMoveResult.move.to.col] !== '';
      const newBoard = makeMove(currentBoard, aiMoveResult.move);
      const algebraicMove = toAlgebraic(aiMoveResult.move.from) + '-' + toAlgebraic(aiMoveResult.move.to);

      setBoard(newBoard);
      setMoveHistory([...moveHistory, { board: currentBoard, move: aiMoveResult.move, algebraic: algebraicMove }]);
      setLastAIMoveResult(aiMoveResult); // Store the full result
      // setMoveExplanation(explanation); // This is now handled by AIMentor directly via lastAIMoveResult
      playSound(isCapture);

      const currentStatus = checkGameStatus(newBoard, 'white'); // Check status for white (Player)
      setGameStatus(currentStatus);

      if (currentStatus === 'playing' || currentStatus === 'check') {
        setCurrentPlayer('white');
        toast.info("AI has made its move. Your turn!");
      } else {
        toast.info(`Game Over: ${currentStatus}`);
      }

    } catch (error) {
      console.error("Error making AI move:", error);
      toast.error("There was an error with the AI move. Starting a new game.");
      handleNewGame();
    }
  };

  // Track move selections for highlighting
  const handleMoveRequest = (moveRequest: { from: Position, possibleMoves: Position[] }) => {
    setSelectedMove(moveRequest);
  };

  // Request a hint from the AI mentor
  const handleRequestHint = () => {
    if (gameStatus !== 'playing' && gameStatus !== 'check') {
        toast.info("Game is over, no hints available.");
        return;
    }
    const suggestion = getSuggestion(board);
    const from = toAlgebraic(suggestion.move.from);
    const to = toAlgebraic(suggestion.move.to);
    
    let hintMessage = `Hint: Try moving from ${from} to ${to}.`;
    if (suggestion.explanation) {
      hintMessage += ` ${suggestion.explanation}`;
    }
    toast.info(hintMessage, { duration: 8000 }); // Longer duration for hints
  };

  // Start a new game
  const handleNewGame = () => {
    setBoard(initialBoard);
    setCurrentPlayer('white');
    setSelectedMove(null);
    setMoveHistory([]);
    setLastAIMoveResult(null); // Reset AI move result
    // setMoveExplanation(''); // No longer needed here
    setGameStatus('playing'); // Reset game status
    toast.success("New game started! You're playing as white.");
  };

  // Get highlighted squares based on the last AI move
  const getHighlightedSquares = (): Position[] => {
    if (!lastAIMoveResult?.move) return [];
    return [lastAIMoveResult.move.from, lastAIMoveResult.move.to];
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Chess Mentor</h1>
        <Button onClick={handleNewGame} size={isMobile ? "sm" : "lg"}>New Game</Button>
      </header>

      <main className="container py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Move History */}
            <div className="lg:col-span-1 order-3 lg:order-1">
              <MoveHistory moves={moveHistory} />
            </div>

            {/* Center column - Chessboard followed by AI Mentor on mobile */}
            <div className="lg:col-span-1 order-1 lg:order-2 flex flex-col items-center">
              <Chessboard 
                board={board}
                onMove={handlePlayerMove}
                onMoveRequest={handleMoveRequest}
                highlightedSquares={getHighlightedSquares()}
                currentPlayer={currentPlayer}
                disabled={gameStatus !== 'playing' && gameStatus !== 'check'} // Disable board if game over
              />
              
              {/* AI Mentor placed directly under the chessboard */}
              <div className="w-full mt-4">
                <AIMentor 
                  board={board}
                  lastAIMoveResult={lastAIMoveResult} // Pass the full AIMoveResult
                  // moveExplanation={moveExplanation} // Remove this, AIMentor will derive it
                  onRequestHint={handleRequestHint}
                  currentPlayer={currentPlayer}
                  showStrategyTip={!isMobile}
                  soundEnabled={soundEnabled}
                  onToggleSound={handleToggleSound}
                  gameStatus={gameStatus} // Pass game status
                />
              </div>
            </div>

            {/* Right column - Empty on desktop */}
            <div className="hidden lg:block lg:col-span-1 order-2 lg:order-3">
              {/* This column is intentionally left empty for layout balance */}
            </div>
          </div>

          {/* Game status */}
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold">
              {gameStatus !== 'playing' && gameStatus !== 'check' ? 
                `Game Over: ${gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1)}` : 
                `Current player: ${currentPlayer === 'white' ? 'You (White)' : 'AI (Black)'}`}
              {gameStatus === 'check' && ` (${currentPlayer === 'white' ? 'Your' : "AI's"} king is in check!)`}
            </h2>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-4 px-6 text-center text-sm text-muted-foreground">
        <p>Chess Mentor - A beginner-friendly chess application with AI guidance</p>
      </footer>
    </div>
  );
};

export default Index;
