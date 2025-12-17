import React, { ReactNode } from 'react';

type TableDefCellProps = {
  content: ReactNode;
  id: string | number;
  col: string | number;
  clickRow: (args: { id: string | number; col: string | number; type: 'default' }) => void;
};

export const TableDefCell: React.FC<TableDefCellProps> = ({ content, id, col, clickRow }) => {
  return (
    <div onClick={() => clickRow({ id, col, type: 'default' })}>
      {content}
    </div>
  );
};