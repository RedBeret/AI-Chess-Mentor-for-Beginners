
import React from 'react';
import { PieceType } from '@/utils/chessLogic';

interface ChessPieceProps {
  piece: PieceType;
  isSelected?: boolean;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece, isSelected }) => {
  if (piece === '') return null;

  // Determine the piece color
  const isWhite = piece === piece.toUpperCase();
  const pieceType = piece.toLowerCase();

  // Unicode chess pieces
  const pieceSymbols: { [key: string]: string } = {
    'k': '♚', // king
    'q': '♛', // queen
    'r': '♜', // rook
    'b': '♝', // bishop
    'n': '♞', // knight
    'p': '♟', // pawn
  };

  return (
    <div 
      className={`
        w-full h-full flex items-center justify-center
        transition-all duration-300 ease-in-out
        ${isSelected ? 'animate-piece-move scale-110' : 'hover:scale-105'}
        cursor-grab active:cursor-grabbing
      `}
      draggable={true}
      data-piece={piece}
    >
      <span 
        className={`text-4xl ${isWhite ? 'text-white' : 'text-black'} transform transition-transform duration-300`}
      >
        {pieceSymbols[pieceType]}
      </span>
    </div>
  );
};

export default ChessPiece;
