
import React, { useEffect, useState } from 'react';
import ChessPiece from './ChessPiece';
import { 
  ChessboardState, 
  Position, 
  Move, 
  makeMove, 
  getPossibleMoves, 
  isPieceOfPlayer,
  generateAIMove,
  toAlgebraic,
  moveToAlgebraic
} from '@/utils/chessLogic';

interface ChessboardProps {
  board: ChessboardState;
  onMove: (move: Move) => void;
  onMoveRequest: (moveRequest: { from: Position, possibleMoves: Position[] }) => void;
  highlightedSquares?: Position[];
  currentPlayer: 'white' | 'black';
}

const Chessboard: React.FC<ChessboardProps> = ({ 
  board, 
  onMove, 
  onMoveRequest,
  highlightedSquares = [],
  currentPlayer
}) => {
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);

  // Clear selection when player changes
  useEffect(() => {
    setSelectedPiece(null);
    setPossibleMoves([]);
  }, [currentPlayer]);

  const handleSquareClick = (row: number, col: number) => {
    // If no piece is selected, select piece if it belongs to current player
    if (!selectedPiece) {
      const piece = board[row][col];
      if (piece !== '' && isPieceOfPlayer(piece, currentPlayer)) {
        const newPossibleMoves = getPossibleMoves(board, { row, col });
        setSelectedPiece({ row, col });
        setPossibleMoves(newPossibleMoves);
        onMoveRequest({ from: { row, col }, possibleMoves: newPossibleMoves });
      }
    } else {
      // If there's a selected piece, attempt to move it
      const moveToExecute = possibleMoves.find(move => move.row === row && move.col === col);
      if (moveToExecute) {
        onMove({ from: selectedPiece, to: { row, col } });
      } 
      // Deselect the piece regardless
      setSelectedPiece(null);
      setPossibleMoves([]);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
    // Only allow dragging pieces that belong to current player
    const piece = board[row][col];
    if (piece !== '' && isPieceOfPlayer(piece, currentPlayer)) {
      e.dataTransfer.setData('text/plain', `${row},${col}`);
      setSelectedPiece({ row, col });
      const newPossibleMoves = getPossibleMoves(board, { row, col });
      setPossibleMoves(newPossibleMoves);
      onMoveRequest({ from: { row, col }, possibleMoves: newPossibleMoves });
      
      // Set a ghost image for drag
      const dragIcon = document.createElement('div');
      dragIcon.textContent = piece;
      dragIcon.style.opacity = '0';
      document.body.appendChild(dragIcon);
      e.dataTransfer.setDragImage(dragIcon, 0, 0);
      setTimeout(() => document.body.removeChild(dragIcon), 0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Needed to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
    e.preventDefault();
    
    if (selectedPiece) {
      const moveToExecute = possibleMoves.find(move => move.row === row && move.col === col);
      if (moveToExecute) {
        onMove({ from: selectedPiece, to: { row, col } });
      }
      // Reset states
      setSelectedPiece(null);
      setPossibleMoves([]);
    }
  };

  const isHighlighted = (row: number, col: number): boolean => {
    return highlightedSquares.some(pos => pos.row === row && pos.col === col);
  };

  const isPossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(move => move.row === row && move.col === col);
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedPiece !== null && selectedPiece.row === row && selectedPiece.col === col;
  };

  const renderSquare = (row: number, col: number) => {
    const piece = board[row][col];
    const isLightSquare = (row + col) % 2 === 0;
    const squareColor = isLightSquare ? 'bg-chess-light-square' : 'bg-chess-dark-square';
    
    let highlightClass = '';
    if (isHighlighted(row, col)) {
      highlightClass = 'bg-chess-highlight';
    } else if (isPossibleMove(row, col)) {
      highlightClass = 'bg-chess-possible-move';
    } else if (isSelected(row, col)) {
      highlightClass = 'bg-chess-selected';
    }

    const coordinate = toAlgebraic({ row, col });

    return (
      <div 
        key={`${row}-${col}`}
        className={`relative w-full h-full ${squareColor} ${highlightClass}`}
        onClick={() => handleSquareClick(row, col)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, row, col)}
      >
        {/* Square coordinate label */}
        <div className="absolute top-0.5 left-0.5 text-xs opacity-60 pointer-events-none z-10">
          {coordinate}
        </div>
        
        <div 
          className="w-full h-full"
          draggable={piece !== '' && isPieceOfPlayer(piece, currentPlayer)}
          onDragStart={(e) => handleDragStart(e, row, col)}
        >
          <ChessPiece 
            piece={piece} 
            isSelected={isSelected(row, col)}
          />
        </div>
      </div>
    );
  };

  // Render the ranks (row numbers, 1-8)
  const renderRanks = () => {
    return Array(8).fill(null).map((_, i) => (
      <div key={`rank-${i}`} className="flex items-center justify-center h-10 w-6 text-sm font-medium">
        {8 - i}
      </div>
    ));
  };

  // Render the files (column letters, a-h)
  const renderFiles = () => {
    return Array(8).fill(null).map((_, i) => (
      <div key={`file-${i}`} className="flex items-center justify-center h-6 w-10 text-sm font-medium">
        {String.fromCharCode(97 + i)}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <div className="w-6"></div> {/* Spacer for rank labels */}
        <div className="flex">
          {renderFiles()}
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col">
          {renderRanks()}
        </div>
        <div className="grid grid-cols-8 grid-rows-8 w-80 h-80 sm:w-96 sm:h-96 border-2 border-gray-800">
          {Array(8).fill(null).map((_, row) =>
            Array(8).fill(null).map((_, col) => renderSquare(row, col))
          )}
        </div>
      </div>
    </div>
  );
};

export default Chessboard;
