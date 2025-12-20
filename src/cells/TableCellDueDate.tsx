import React from 'react';
import { calcDateDiff, formatToDDMMYYYY } from '../tools/dateFunction';
import styles from '../elements/table.module.css';

type Props = {
  content: string;
  id: string | number;
  col: string | number;
  small?: boolean;
  clickRow: (args: { id: string | number; col: string | number; type: 'default' }) => void;
};

export const TableCellDueDate: React.FC<Props> = ({ content, id, col, small, clickRow }) => {

  const DateContent = ({ value }: { value: string }) => {
    const valDate = value
    return valDate === '-' || !valDate
      ? '-'
      : <span className={`${styles.dateTag} ${styles[calcDateDiff(valDate)]}${small ? ` ${styles.dateTagSmall}` : ''}`}>{small ? '' : formatToDDMMYYYY(valDate)}</span>;
  }

  return (
    <div onClick={() => clickRow({ id, col, type: 'default' })} style={{ width: "100%", textAlign: "center" }} >
      <DateContent value={content} />
    </div>
  );
};