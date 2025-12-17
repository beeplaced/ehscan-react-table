import React from 'react';
import { calcDateDiff, formatToDDMMYYYY } from '../tools/dateFunction';
import styles from '../elements/table.module.css';

type Props = {
  content: string;
  id: string | number;
  col: string | number;
  clickRow: (args: { id: string | number; col: string | number; type: 'default' }) => void;
};

export const TableCellDueDate: React.FC<Props> = ({ content, id, col, clickRow }) => {

  const DateContent = ({ value }: { value: string }) => {
    const valDate = value
    return valDate === '-' || !valDate
      ? '-'
      : <span className={`${styles.dateTag} ${styles[calcDateDiff(valDate)]}`}>{formatToDDMMYYYY(valDate)}</span>;
  }

  return (
    <div onClick={() => clickRow({ id, col, type: 'default' })}>
      <DateContent value={content} />
    </div>
  );
};