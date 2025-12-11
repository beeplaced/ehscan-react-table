import { useEffect, useState, useRef } from "react";
import TableCellSelectHeadCol from "./TableCellSelectHeadCol";
import { debounce } from "./Debounce";
import styles from './table.module.css';

type HeadSearchBarProps = {
  content: string;
  tag: string;
};

type SearchEntry = {
  tag: string;
  term: string;
};

type TableColumn = {
  tag: string;
  title?: string;
  type?: string;
  search?: boolean;
};

type SortOrder = { tag: string; dir: "asc" | "desc" };

type Props = {
  columns: TableColumn[];
  rows: any[];
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  cellComponents: Record<string, React.ComponentType<{ row: any; col: string }>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  searchTermArraySetter?: (arr: { tag: string; term: string }[]) => void;
  setSearchTermArraySetter?: (arr: { tag: string; term: string }[]) => void;
  fallback: () => React.ReactNode;
};

export const Table: React.FC<Props> = ({ columns, rows, sortOrder, setSortOrder, cellComponents, setSelectedIds, searchTermArraySetter, setSearchTermArraySetter, fallback }) => {

  const [wrapperBottom, setWrapperBottom] = useState<number | undefined>(undefined);
  const headerRef = useRef<HTMLDivElement>(null);
  const tableSearchTerms = useRef<Record<string, string>>({});
  const [openCol, setOpenCol] = useState<string | undefined>(undefined);
  const [checkAll, setCheckAll] = useState(false);

  useEffect(() => {
    if (searchTermArraySetter !== undefined) return;
    try {//Reset SearchTerm
      tableSearchTerms.current = {}
    } catch (error) {
      console.log(error)
    }
  }, [searchTermArraySetter])

  useEffect(() => {//init
    const calculateHeight = () => {
      if (headerRef.current) {
        const { bottom } = headerRef.current.getBoundingClientRect();
        setWrapperBottom(bottom)
      }
    };
    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const checkHead = (entry: boolean) => {
    if (entry === undefined) return;
    setCheckAll(!entry)
    setSelectedIds(prev => {
      let next = prev;
      if (!entry) next = [...prev, ...rows.map(r => r.id)];
      if (entry) next = prev.filter(id => !rows.some(r => r.id === id));
      return [...new Set(next)];
    });
  };

  const debouncedSave = useRef(
    debounce((entry) => {
      const doSave = async () => {
        try {
          await filterRows(entry);
        } catch (err) {
          console.error('Autosave failed:', err);
        }
      };
      doSave();
    }, 800)
  );

  const filterRows = async (entry: SearchEntry) => {
    const { tag, term } = entry;
    tableSearchTerms.current[tag] = term;
    const searchTermsArray = Object.entries(tableSearchTerms.current).map(([tag, term]) => ({
      tag,
      term: term as string
    }));

    if (setSearchTermArraySetter) setSearchTermArraySetter(searchTermsArray);
  };

  const RemoveSearchEntry = () => <svg className={styles.removesearchsvg} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48752C"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z" /></svg>

  const HeadSearchBar = ({ content, tag }: HeadSearchBarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(tableSearchTerms.current[tag] ?? "");
    const hasLabel = value.length > 0;
    const inputTag = `search_${tag.toLowerCase()}`

    useEffect(() => {
      if (inputRef.current && openCol === tag) {
        inputRef.current.focus();
      }
    }, [value]);

    const changeHeadSearch = (newValue: string) => {
      setValue(newValue);
      setOpenCol(tag);
      debouncedSave.current({ tag, term: newValue });
    };

    return (
      <div className={styles.headsearchwrapper}>
        <div className={`${styles.headsearchlable}${hasLabel ? ` ${styles.show}` : ""}`}>
          <label htmlFor={inputTag}>{content}</label>
        </div>
        <div className={`${styles.searchwrapper}${hasLabel || openCol === tag ? ` ${styles.focused}` : ""}`} >
          <input id={inputTag} ref={inputRef}
            className={styles.headsearch}
            type="text"
            value={value}
            onFocus={() => setOpenCol(tag)}
            onChange={(e) => changeHeadSearch(e.target.value)}
            placeholder={content}
            maxLength={150}
            spellCheck={false}
          />
          {value !== "" && <div onClick={() => changeHeadSearch("")}><RemoveSearchEntry /></div>}
        </div>
      </div>
    );
  };

  const HeadColSort = ({ tag }: { tag: string }) => {
    return (<>
      <div className="sort-col" onClick={() => setSortOrder({ tag, dir: sortOrder.dir === 'desc' ? 'asc' : 'desc' })} >
        {sortOrder.tag === tag && <SortButton />}
        {openCol === tag && sortOrder.tag !== tag && <EmptySort />}
      </div>
    </>)
  };

  const HeadColMain = ({ col }: { col: TableColumn }) => {
    const { tag, search, title } = col;
    const colTitle = title || tag;
    return (
      <th>
        <div className={styles.headcolcell}>
          <HeadColSort tag={tag} />
          <div className={styles.headcolcellmain}>
            {search ? <HeadSearchBar content={colTitle} tag={tag} /> : <div>{colTitle}</div>}
          </div>
        </div>
      </th>
    )
  };

  const HeadCols = () => {
    return (
      <>
        {columns.map((col, i) => {
          const { tag, type } = col;
          if (type === "checkbox") {
            return (
              <th key={`checkbox-${tag ?? i}`} className={styles.thcheckhead} style={{ "--custom-width": `32px` } as React.CSSProperties} >
                <TableCellSelectHeadCol checkHead={checkHead} checkAll={checkAll} />
              </th>
            );
          }
          return <HeadColMain key={tag ?? i} col={col} />
        })}
        <EndHeadCol />
      </>
    );
  };

  const SortButton = () => {
    switch (sortOrder.dir) {
      case 'desc': return <svg className={styles.sortsvg} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white"><path d="M480-240 240-480l56-56 144 144v-368h80v368l144-144 56 56-240 240Z" /></svg>
      default: return <svg className={styles.sortsvg} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white"><path d="M440-240v-368L296-464l-56-56 240-240 240 240-56 56-144-144v368h-80Z" /></svg>
    }
  };

  const EmptySort = () => <svg className={styles.sortsvg} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white"><path d="M480-120 300-300l58-58 122 122 122-122 58 58-180 180ZM358-598l-58-58 180-180 180 180-58 58-122-122-122 122Z" /></svg>;

  const EndHeadCol = () => <th key='endHeadCol' style={({ "--custom-width": `10px` } as React.CSSProperties)} />;

  const EndCol = () => <td key='endCol' />;

  const TableBody = () => {
    return (
      <tbody key='ext-tbody' className={`${styles.tablebody} ${styles._tbl}`}>
        {rows && rows.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`} className={styles.deftabletr}>
            {columns.map((col, ci) => {
              const type = col.type ?? "def";
              const CellComponent = cellComponents[type];
              return (
                <td key={ci} >
                  <div className={styles.exttablediv}><CellComponent row={row} col={col.tag} /></div>
                </td>
              );
            })}
            <EndCol />
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <>
      <div className={`${styles.tablewrapper} ${styles['_tbl']}`} style={{ height: `calc(100vh - ${wrapperBottom}px)` }} >
        <table className={styles.exttable}>
          <thead>
            <tr className={styles.trstickyhead}>
              <HeadCols />
            </tr>
          </thead>
          {rows && rows.length > 0 && <TableBody />}
        </table>
        {rows && rows.length === 0 && fallback()}
      </div>
    </>
  );
}