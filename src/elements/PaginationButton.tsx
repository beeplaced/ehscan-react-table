import React, { useRef } from 'react';
import PaginationRipple from './PaginationRipple';
import styles from '../table.module.css';

interface PaginationButtonProps {
  index?: string | number;
  txt?: string | number;
  isActive?: boolean;
  disabled?: boolean;
  action?: () => void;
  display?: boolean;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({ index, txt, disabled, isActive, action, display }) => {

  const buttonRef = useRef<HTMLDivElement | null>(null);
  const handleRipple = PaginationRipple();

  const handleButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (display === false) return;
    handleRipple(event, buttonRef);
    if (!disabled && action) action();
  };

  const PrevBtn = () => {
    return (<>
      <svg className={styles.pagbtnsvg} width="24px" height="24px" fill="white" version="1.1" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
        <path d="m632-80-400-400 400-400 71 71-329 329 329 329z" />
      </svg>
    </>)
  }

  const NextBtn = () => {
    return (<>
      <svg className={styles.pagbtnsvg} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg>
    </>)
  }

  return (
    <div ref={buttonRef} key={index}
      className={`${styles.paginationbutton} ${isActive ? styles.paginationbuttonactive : ""} ${display === false ? styles.paginationbuttonhide : ""}`}
      onClick={(e) => handleButtonClick(e)}>
      {index === 'prev' && <PrevBtn />}
      {index === 'next' && <NextBtn />}
      {txt && <div className="_txt">{txt}</div>}
    </div>
  );
};

export default PaginationButton;