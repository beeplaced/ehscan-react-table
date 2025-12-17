import TableChecklistItem from "../elements/TableChecklistItem";

type SelectProps = {
  rowIndex: number;
  checked?: boolean;
};

type Props = {
  rowIndex: number;
  checked?: boolean;
  selectRow: (args: SelectProps, shift: boolean) => void;
};

export const TableCellSelect: React.FC<Props> = ({ rowIndex, checked, selectRow }) => {

  const checkClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const shift = event.shiftKey;
    selectRow({ rowIndex, checked: !checked }, shift);
  };

  return (<>
      <div onClick={(e) => { e.stopPropagation(); checkClick(e); }}>
        <TableChecklistItem checked={checked ?? false} />
      </div>
      </>
  );
};