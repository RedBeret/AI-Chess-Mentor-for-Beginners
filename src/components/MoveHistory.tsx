import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { moveToAlgebraic, ChessboardState, Move } from '@/utils/chessLogic';

export interface MoveHistoryProps {
  moves: { board: ChessboardState, move: Move, algebraic: string }[]; // Added algebraic to moves type
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  return (
    <Card className="h-full max-h-[calc(100vh-200px)] flex flex-col">
      <CardHeader>
        <CardTitle>Move History</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-0">
        {moves.length === 0 ? (
          <p className="text-center text-muted-foreground p-4">No moves yet.</p>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {moves.map((entry, index) => (
                <div key={index} className="text-sm p-2 rounded-md bg-muted/50">
                  {`${Math.floor(index / 2) + 1}. ${index % 2 === 0 ? 'White' : 'Black'}: ${entry.algebraic}`}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default MoveHistory;
