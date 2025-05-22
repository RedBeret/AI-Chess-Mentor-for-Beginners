
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
  toAlgebraic
} from '@/utils/chessLogic';

const Index = () => {
  // Game state
  const [board, setBoard] = useState<ChessboardState>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [selectedMove, setSelectedMove] = useState<{ from: Position, possibleMoves: Position[] } | null>(null);
  const [moveHistory, setMoveHistory] = useState<{ board: ChessboardState, move: Move }[]>([]);
  const [lastAIMove, setLastAIMove] = useState<Move | null>(null);
  const [moveExplanation, setMoveExplanation] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
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
    if (currentPlayer !== 'white' || gameOver) return;
    
    // Check if it's a capture move
    const isCapture = board[move.to.row][move.to.col] !== '';
    
    // Execute move
    const newBoard = makeMove(board, move);
    setBoard(newBoard);
    // Record move in history
    setMoveHistory([...moveHistory, { board, move }]);
    // Switch to AI's turn
    setCurrentPlayer('black');

    // Clear selected move info
    setSelectedMove(null);
    
    // Play appropriate sound
    playSound(isCapture);
    
    toast.success("Move made! Now it's the AI's turn.");

    // AI will respond after a short delay
    setTimeout(() => makeAIMove(newBoard), 1000);
  };

  // AI makes a move
  const makeAIMove = (currentBoard: ChessboardState) => {
    try {
      const aiMove = generateAIMove(currentBoard);
      const explanation = getAIMoveExplanation(currentBoard, aiMove);
      
      // Check if it's a capture move
      const isCapture = currentBoard[aiMove.to.row][aiMove.to.col] !== '';
      
      const newBoard = makeMove(currentBoard, aiMove);
      
      setBoard(newBoard);
      setMoveHistory([...moveHistory, { board: currentBoard, move: aiMove }]);
      setLastAIMove(aiMove);
      setMoveExplanation(explanation);
      setCurrentPlayer('white');
      
      // Play appropriate sound
      playSound(isCapture);
      
      toast.info("AI has made its move. Your turn!");
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
    const suggestion = getSuggestion(board);
    const from = toAlgebraic(suggestion.move.from);
    const to = toAlgebraic(suggestion.move.to);
    
    toast.info(`Try moving from ${from} to ${to}. ${suggestion.explanation}`);
  };

  // Start a new game
  const handleNewGame = () => {
    setBoard(initialBoard);
    setCurrentPlayer('white');
    setSelectedMove(null);
    setMoveHistory([]);
    setLastAIMove(null);
    setMoveExplanation('');
    setGameOver(false);
    toast.success("New game started! You're playing as white.");
  };

  // Get highlighted squares based on the last AI move
  const getHighlightedSquares = (): Position[] => {
    if (!lastAIMove) return [];
    return [lastAIMove.from, lastAIMove.to];
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
              />
              
              {/* AI Mentor placed directly under the chessboard */}
              <div className="w-full mt-4">
                <AIMentor 
                  board={board}
                  lastMove={lastAIMove}
                  moveExplanation={moveExplanation}
                  onRequestHint={handleRequestHint}
                  currentPlayer={currentPlayer}
                  showStrategyTip={!isMobile}
                  soundEnabled={soundEnabled}
                  onToggleSound={handleToggleSound}
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
              {gameOver ? "Game Over" : `Current player: ${currentPlayer === 'white' ? 'You (White)' : 'AI (Black)'}`}
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
