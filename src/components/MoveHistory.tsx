import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChessboardState, Move } from '@/utils/chessLogic';

export interface MoveHistoryProps {
  moves: { board: ChessboardState, move: Move, algebraic: string }[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest move whenever history updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moves.length]);

  // Group into pairs: [white, black?]
  const movePairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i].algebraic,
      black: moves[i + 1]?.algebraic,
    });
  }

  return (
    <Card className="h-full max-h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Move History</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        {moves.length === 0 ? (
          <p className="text-center text-muted-foreground p-4">No moves yet.</p>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              {movePairs.map(pair => (
                <div key={pair.num} className="grid grid-cols-[2rem_1fr_1fr] items-center gap-1 text-sm">
                  <span className="text-muted-foreground text-xs font-mono">{pair.num}.</span>
                  <span className="px-2 py-0.5 rounded bg-muted/50 font-mono">{pair.white}</span>
                  {pair.black ? (
                    <span className="px-2 py-0.5 rounded bg-muted/30 font-mono text-muted-foreground">{pair.black}</span>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default MoveHistory;
