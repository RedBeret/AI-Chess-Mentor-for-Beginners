import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { ChessboardState, getSuggestion, toAlgebraic } from '@/utils/chessLogic';
import { Volume2, VolumeX, BookOpen, HelpCircle, Loader2 } from 'lucide-react';
import {
  getRandomStrategy,
  getStrategyByPhase,
  ChessPhase,
  StrategyTip
} from '@/utils/chessStrategies';
import { AIMoveResult, GameStatus } from '@/utils/chessLogic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMoveCoaching, getHintCoaching, CoachResponse } from '@/lib/mentor';
import { getApiKey, hasApiKey } from '@/lib/storage';
import ApiKeyBanner, { ApiKeyStatus } from './ApiKeyBanner';

interface AIMentorProps {
  board: ChessboardState;
  boardBeforeAIMove: ChessboardState | null;
  lastAIMoveResult: AIMoveResult | null;
  onRequestHint: () => void;
  currentPlayer: 'white' | 'black';
  showStrategyTip?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  gameStatus: GameStatus;
  moveCount: number;
}

// Auto-detect game phase based on total half-moves played
function detectPhase(moveCount: number): ChessPhase {
  if (moveCount < 10) return 'opening';
  if (moveCount < 30) return 'middlegame';
  return 'endgame';
}

const AIMentor: React.FC<AIMentorProps> = ({
  board,
  boardBeforeAIMove,
  lastAIMoveResult,
  onRequestHint,
  currentPlayer,
  showStrategyTip = true,
  soundEnabled,
  onToggleSound,
  gameStatus,
  moveCount,
}) => {
  const autoPhase = detectPhase(moveCount);
  const [currentTip, setCurrentTip] = useState<StrategyTip>(getRandomStrategy());
  const [selectedPhase, setSelectedPhase] = useState<ChessPhase>(autoPhase);

  // Sync selected phase with auto-detected phase when it changes
  useEffect(() => {
    setSelectedPhase(autoPhase);
  }, [autoPhase]);

  // AI coaching state
  const [apiKeyPresent, setApiKeyPresent] = useState<boolean>(hasApiKey());
  const [coaching, setCoaching] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [hintText, setHintText] = useState<string>('');
  const [hintLoading, setHintLoading] = useState(false);

  const handleNewTip = () => {
    const strategies = getStrategyByPhase(selectedPhase, 1);
    setCurrentTip(strategies.length > 0 ? strategies[0] : getRandomStrategy());
  };

  useEffect(() => {
    handleNewTip();
  }, [selectedPhase]);

  // Fetch coaching whenever the AI makes a new move
  useEffect(() => {
    if (!lastAIMoveResult || !boardBeforeAIMove) return;
    if (!apiKeyPresent) {
      setCoaching(null);
      return;
    }

    let cancelled = false;
    setCoachLoading(true);
    setCoaching(null);
    setHintText('');

    getMoveCoaching(board, boardBeforeAIMove, lastAIMoveResult, gameStatus, getApiKey())
      .then(result => {
        if (!cancelled) setCoaching(result);
      })
      .catch(() => {
        if (!cancelled) setCoaching(null);
      })
      .finally(() => {
        if (!cancelled) setCoachLoading(false);
      });

    return () => { cancelled = true; };
  }, [lastAIMoveResult]);

  const handleHintClick = async () => {
    if (!apiKeyPresent) {
      onRequestHint(); // falls back to algorithmic toast
      return;
    }
    setHintLoading(true);
    setHintText('');
    try {
      const text = await getHintCoaching(board, gameStatus, getApiKey());
      setHintText(text);
    } catch {
      onRequestHint(); // fall back to toast on error
    } finally {
      setHintLoading(false);
    }
  };

  // Fallback: static explanation from the chess engine
  const staticExplanation = (() => {
    if (!lastAIMoveResult) return '';
    if (lastAIMoveResult.strategyApplied) {
      return `AI applied: "${lastAIMoveResult.strategyApplied.name}" — ${lastAIMoveResult.reason ?? lastAIMoveResult.strategyApplied.description}`;
    }
    return lastAIMoveResult.reason ?? 'AI made its move.';
  })();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between lg:justify-center lg:relative pb-2">
        <CardTitle className="text-xl font-bold">Chess Mentor</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSound}
          className="lg:absolute lg:right-6"
          title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* API key banner / status – hidden once the game is in progress */}
        {moveCount === 0 && (
          <ApiKeyBanner hasKey={apiKeyPresent} onKeyChange={() => setApiKeyPresent(hasApiKey())} />
        )}
        {apiKeyPresent && (
          <div className="flex justify-end">
            <ApiKeyStatus onKeyChange={() => setApiKeyPresent(hasApiKey())} />
          </div>
        )}

        {/* AI move coaching */}
        {(coachLoading || coaching || staticExplanation) && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <h3 className="font-semibold mb-1 text-sm">AI's last move:</h3>
            {coachLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing move...
              </div>
            ) : coaching ? (
              <div className="space-y-1">
                <p className="text-sm">{coaching.comment}</p>
                {coaching.advice && coaching.advice !== coaching.comment && (
                  <p className="text-sm text-muted-foreground">{coaching.advice}</p>
                )}
              </div>
            ) : (
              <p className="text-sm">{staticExplanation}</p>
            )}
          </div>
        )}

        {/* AI hint or fallback */}
        {hintText && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-semibold mb-1 text-sm">Hint:</h3>
            <p className="text-sm">{hintText}</p>
          </div>
        )}

        {/* Strategy tip panel */}
        {showStrategyTip && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4" />
                  Strategy Tip:
                </h3>
                <Select value={selectedPhase} onValueChange={(v: ChessPhase) => setSelectedPhase(v)}>
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
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleNewTip} className="text-xs h-7 px-2">
                  New Tip
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hint button */}
        {currentPlayer === 'white' && (gameStatus === 'playing' || gameStatus === 'check') && (
          <div className="flex justify-center">
            <Button onClick={handleHintClick} variant="default" className="flex gap-2 items-center" disabled={hintLoading}>
              {hintLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
              {hintLoading ? 'Thinking...' : 'Need a hint?'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIMentor;
