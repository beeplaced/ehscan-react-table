import React, { ReactNode } from 'react';

type TableDefCellProps = {
  content: ReactNode;
  id: string | number;
  col: string | number;
  small?: boolean;
  clickRow: (args: { id: string | number; col: string | number; type: 'default' }) => void;
};

export const TableDefCell: React.FC<TableDefCellProps> = ({ content, id, col, small, clickRow }) => {
  return (
    <div onClick={() => clickRow({ id, col, type: 'default' })}>
      {small ? 'Small' : ''} {content}
    </div>
  );
};