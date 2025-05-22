
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { moveToAlgebraic, ChessboardState, Move } from '@/utils/chessLogic';

interface MoveHistoryProps {
  moves: { board: ChessboardState, move: Move }[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  // Group moves into pairs for display
  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      whiteMove: moves[i]?.move ? moveToAlgebraic(moves[i].board, moves[i].move) : '',
      blackMove: moves[i + 1]?.move ? moveToAlgebraic(moves[i + 1].board, moves[i + 1].move) : ''
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Move History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60 border rounded-md p-2">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-2 w-1/4">#</th>
                <th className="p-2 w-2/5">White</th>
                <th className="p-2 w-2/5">Black</th>
              </tr>
            </thead>
            <tbody>
              {movePairs.map((pair) => (
                <tr key={pair.moveNumber} className="border-t border-gray-200">
                  <td className="p-2">{pair.moveNumber}.</td>
                  <td className="p-2">{pair.whiteMove}</td>
                  <td className="p-2">{pair.blackMove}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {moves.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No moves yet
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MoveHistory;
