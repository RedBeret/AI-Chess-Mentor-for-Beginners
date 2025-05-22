import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Position, Move, getSuggestion, ChessboardState } from '@/utils/chessLogic';
import { Volume2, VolumeX, BookOpen, HelpCircle } from 'lucide-react';
import { 
  getRandomStrategy, 
  getStrategyByPhase, 
  // getStrategyByDifficulty, // Not directly used here anymore, but keep for chessStrategies.ts utility
  ChessPhase,
  StrategyTip
} from '@/utils/chessStrategies';
import { AIMoveResult, GameStatus } from '@/utils/chessLogic'; // Import AIMoveResult and GameStatus
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added import for Select components

interface AIMentorProps {
  board: ChessboardState;
  lastAIMoveResult: AIMoveResult | null; // Changed from lastMove and moveExplanation
  onRequestHint: () => void;
  currentPlayer: 'white' | 'black';
  showStrategyTip?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  gameStatus: GameStatus; // Add gameStatus prop
}

const AIMentor: React.FC<AIMentorProps> = ({ 
  board, 
  lastAIMoveResult, 
  onRequestHint,
  currentPlayer,
  showStrategyTip = true,
  soundEnabled,
  onToggleSound,
  gameStatus // Destructure gameStatus
}) => {
  const [currentTip, setCurrentTip] = useState<StrategyTip>(getRandomStrategy());
  const [selectedPhase, setSelectedPhase] = useState<ChessPhase>('general');
  
  // Get a new tip based on the selected game phase
  const handleNewTip = () => {
    const strategies = getStrategyByPhase(selectedPhase, 1);
    if (strategies.length > 0) {
      setCurrentTip(strategies[0]);
    } else {
      setCurrentTip(getRandomStrategy());
    }
  };
  
  // Change tip when phase selection changes or game phase might change
  useEffect(() => {
    // Potentially adjust selectedPhase based on game progress (e.g., move count)
    // For now, manual selection is kept.
    handleNewTip();
  }, [selectedPhase]);

  const getAIMoveDisplayExplanation = () => {
    if (!lastAIMoveResult) return "";
    if (lastAIMoveResult.strategyApplied) {
      return `AI applied strategy: "${lastAIMoveResult.strategyApplied.name}". Reason: ${lastAIMoveResult.reason || lastAIMoveResult.strategyApplied.description}`;
    }
    return lastAIMoveResult.reason || "AI made its move.";
  };

  const aiMoveDisplayExplanation = getAIMoveDisplayExplanation();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between lg:justify-center lg:relative">
        <CardTitle className="text-xl font-bold">Chess Mentor</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSound}
          className="lg:absolute lg:right-6"
          title={soundEnabled ? "Sound enabled" : "Sound disabled"}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Last AI move explanation */}
        {aiMoveDisplayExplanation && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <h3 className="font-semibold mb-1">AI's last move:</h3>
            <p className="text-sm">{aiMoveDisplayExplanation}</p>
          </div>
        )}

        {/* Strategy tip - only show if showStrategyTip is true */}
        {showStrategyTip && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Strategy Tip:
                </h3>
                <Select value={selectedPhase} onValueChange={(value: ChessPhase) => setSelectedPhase(value)}>
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue placeholder="Game Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="opening">Opening</SelectItem>
                    <SelectItem value="middlegame">Middle Game</SelectItem>
                    <SelectItem value="endgame">Endgame</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">{currentTip.name}</h4>
                <p className="text-sm text-muted-foreground">{currentTip.description}</p>
              </div>
              <div className="flex justify-end mt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNewTip}
                  className="text-xs h-7 px-2"
                >
                  New Tip
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Help button for the player - show only if game is ongoing and it's player's turn */}
        {currentPlayer === 'white' && (gameStatus === 'playing' || gameStatus === 'check') && (
          <div className="flex justify-center">
            <Button onClick={onRequestHint} variant="default" className="flex gap-2 items-center">
              <HelpCircle className="h-4 w-4" />
              Need a hint?
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIMentor;
