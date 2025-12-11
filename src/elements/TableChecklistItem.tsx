import React, { useRef } from 'react';
import PaginationRipple from './PaginationRipple';
import styles from '../style/table.module.css';

type Props = {
  checked: boolean;
};

const TableChecklistItem: React.FC<Props> = ({ checked }) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const handleRipple = PaginationRipple();
  const toggleCheck = async (event: React.MouseEvent<HTMLDivElement>) => {
    handleRipple(event, buttonRef);
  };

  const CheckBoxItemSquare = ({ selected }: { selected: boolean }) => {
    return (<>
      <svg width="60" height="60" version="1.1" viewBox="0 -960 2400 2400" xmlns="http://www.w3.org/2000/svg">
        <path className={styles.cbcircle} d="m1200-692.58c-767.96 0-932.58 164.63-932.58 932.58 0 767.98 164.63 932.58 932.58 932.58 767.98 0 932.58-164.63 932.58-932.58 0-767.96-164.63-932.58-932.58-932.58z" fill="white" />
        {selected && <path className={styles.cbpath} d="m1566.4-147.66c-33.43-0.026-66.888 12.734-92.524 38.331l-421.88 421.25-125.8-126.04c-51.193-51.272-133.7-51.348-184.97-0.1555-51.272 51.193-51.348 133.7-0.15551 184.97l218.09 218.48c38.437 38.497 94.554 48.106 141.82 28.846 15.829-6.3918 30.738-15.985 43.618-28.846l514.09-513.39c51.272-51.193 51.348-133.7 0.1554-184.97-25.596-25.636-59.014-38.46-92.446-38.486z" fill="#666" />}
      </svg>
    </>)
  }

  return (<>
    <div ref={buttonRef} className={styles.checkboxtable}
      onClick={(e) => toggleCheck(e)}>
      <CheckBoxItemSquare selected={checked} />
    </div>
  </>)
};

export default TableChecklistItem;