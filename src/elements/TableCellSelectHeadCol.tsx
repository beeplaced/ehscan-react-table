import ChecklistItemSquare from "./TableChecklistItem";

type Props = {
  checkAll: boolean
  checkHead: (args: boolean) => void;
};

const TableCellSelectHeadCol: React.FC<Props> = ({ checkHead, checkAll }) => {

  return (
      <div onClick={(event: React.MouseEvent<HTMLDivElement>) => { 
        event.stopPropagation(); 
        if (checkAll !== undefined )checkHead(checkAll); 
        }}>
        <ChecklistItemSquare checked={checkAll} />
      </div>
  );
};

export default TableCellSelectHeadCol;