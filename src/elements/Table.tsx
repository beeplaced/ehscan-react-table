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
  width?: number;
  small?: boolean;
  important?: boolean;
};

type SortOrder = { tag: string; dir: "asc" | "desc" };

type MeasureCol = {
  col: string;
  min: number;
};

type Props = {
  columns: TableColumn[];
  rows: any[];
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  cellComponents: Record<string, React.ComponentType<{ row: any; col: string, small?: boolean }>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  searchTermArraySetter?: (arr: { tag: string; term: string }[]) => void;
  setSearchTermArraySetter?: (arr: { tag: string; term: string }[]) => void;
  fallback: () => React.ReactNode;
  nearBottom: boolean;
  setNearBottom: (nearBottom: boolean) => void;
  changeColumns: (args: any) => void;
  measureCols: MeasureCol[];
  displayImportant?: boolean;
};

export const Table: React.FC<Props> = ({
  columns,
  rows,
  sortOrder,
  setSortOrder,
  cellComponents,
  setSelectedIds,
  searchTermArraySetter,
  setSearchTermArraySetter,
  fallback,
  nearBottom,
  setNearBottom,
  changeColumns,
  measureCols,
  displayImportant
}) => {
  const [wrapperBottom, setWrapperBottom] = useState<number | undefined>(undefined);
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const scrollRef = useRef<HTMLTableSectionElement>(null);
  const tableSearchTerms = useRef<Record<string, string>>({});
  const [openCol, setOpenCol] = useState<string | undefined>(undefined);
  const [checkAll, setCheckAll] = useState(false);
  const colRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const measureColElements = measureCols.map(a => a.col)

  useEffect(() => {
    if (searchTermArraySetter !== undefined) return;
    try {
      tableSearchTerms.current = {}
    } catch (error) {
      console.log(error)
    }
  }, [searchTermArraySetter]);

  useEffect(() => {
    const resizeFn = () => {

      if (colRefs?.current) {
        Object.keys(colRefs.current).forEach(key => {
          const el = colRefs.current[key];
          if (!el) return;
          const { width } = el.getBoundingClientRect();
          const min = measureCols.find(c => c.col === key)?.min || 50;
          if (width < min) {
            changeColumns({ col: key, small: true });
            return;
          }
          changeColumns({ col: key, small: false });
        });
      }

      if (headerRef.current) {
        const { bottom } = headerRef.current.getBoundingClientRect();
        setWrapperBottom(bottom - 20);
      }
    };

    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const reachBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
      if (reachBottom && !nearBottom) setNearBottom(true)
    };

    resizeFn(); //init

    const scrollEl = scrollRef.current;
    if (scrollEl) scrollEl.addEventListener("scroll", handleScroll);

    window.addEventListener("resize", resizeFn);

    return () => {
      window.removeEventListener("resize", resizeFn);
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
    };
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
          console.error('debounce failed:', err);
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

  const HeadColMainLit: Record<string, (tag?: string) => React.ReactNode> = {
    def: (tag) => tag ?? "",
    duedate: () => (
      <svg width="40" height="40" version="1.1" viewBox="0 -960 1600 1600" xmlns="http://www.w3.org/2000/svg">
        <path className="table-header-icons" d="m381.72-908.36c-112.37 0-203.83 90.835-203.83 202.42v157.03h-68.359c-31.606 1.731-56.094 24.21-56.094 51.328 0 27.118 24.487 49.407 56.094 51.484h68.359v577.03h-68.359c-32.304 1.1539-57.891 25.058-57.891 53.906 0 28.964 25.587 52.674 57.891 53.828h68.359v147.27a203.93 202.52 0 0 0 203.83 202.42h224.06l56.719-98.359h-288.28c-53.103 0-96.406-42.893-96.406-95.859v-155.47h58.047c31.723-1.9617 56.328-25.441 56.328-53.828 0-28.502-24.606-51.945-56.328-53.906h-58.047v-577.11h58.047c33.117 0 60.118-22.978 60.234-51.25 1e-4 -28.272-27.001-51.328-60.234-51.328h-57.969v-165.47a96.679 96.009 0 0 1 96.484-95.859v0.15624h977.58a96.795 96.124 0 0 1 96.406 95.781v921.72l100 166.88v-1080.4c-1e-4 -111.59-91.347-202.42-203.83-202.42h-962.81zm251.25 359.61c-30.444 1.5001-54.781 22.239-56.641 48.203a47.294 46.966 0 0 0 15 37.188 64.259 63.814 0 0 0 41.641 17.266h514.06v-0.07813c33.233 0 60.042-22.978 60.391-51.25 0-28.272-27.274-51.328-60.391-51.328h-514.06zm-2.8125 338.28c-29.849 0-53.906 24.057-53.906 53.906s24.057 53.828 53.906 53.828h318.59c29.849 1e-5 53.828-23.979 53.828-53.828s-23.979-53.906-53.828-53.906h-318.59zm0 343.36c-29.849 0-53.906 24.057-53.906 53.906 0 29.849 24.057 53.906 53.906 53.906h139.53c29.849 0 53.828-24.057 53.828-53.906 1e-5 -29.85-23.979-53.906-53.828-53.906h-139.53zm96.016 357.11-56.797 98.359h102.73l59.922-98.359h-105.86z" />
        <path className="table-header-icons-overdue" d="m1134-177.42c-15.754 0-31.544 7.7956-40.547 23.438l-415.94 720.39c-18.005 31.284 4.5368 70.234 40.547 70.234h831.8c36.01 0 58.552-38.951 40.547-70.234l-415.94-720.39c-9.0026-15.642-24.714-23.438-40.469-23.438zm0 184.53c47.713 0 86.406 44.129 86.406 98.594 0 166.1-38.693 300.7-86.406 300.7-47.714 0-86.484-134.61-86.484-300.7 0-54.465 38.771-98.594 86.484-98.594zm0 451.95a60.542 60.542 0 0 1 60.547 60.547 60.542 60.542 0 0 1-60.547 60.547 60.542 60.542 0 0 1-60.547-60.547 60.542 60.542 0 0 1 60.547-60.547z" fill="#999" />
      </svg>
    ),
  };

  const HeadColMain = ({ col }: { col: TableColumn }) => {
    const { tag, search, title, width } = col;
    const colTitle = title !== undefined ? title : tag;
    const thWidth = width !== undefined ? `${width}px` : "30px";
    return (
      <th ref={measureColElements.includes(tag) ? (el) => { colRefs.current[tag] = el; } : undefined}
        style={{ "--custom-width": thWidth } as React.CSSProperties} >
        <div className={styles.headcolcell}>
          <HeadColSort tag={tag} />
          <div className={styles.headcolcellmain}>
            {search
              ? <HeadSearchBar content={colTitle} tag={tag} />
              : <div onClick={() => setOpenCol(tag)}>{HeadColMainLit[colTitle]?.(colTitle) ?? colTitle}</div>}
          </div>
        </div>
      </th>
    )
  };

  const HeadCols = () => {
    return (
      <>
        {columns
        .filter(col => !displayImportant || col.important)
        .map((col, i) => {
          const { tag, type, width } = col;
          const thWidth = width !== undefined ? `${width}px` : "8px";
          if (type === "checkbox") {
            return (
              <th key={`checkbox-${tag ?? i}`} className={styles.thcheckhead} style={{ "--custom-width": thWidth, padding: "5px" } as React.CSSProperties} >
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
            {columns
            .filter(col => !displayImportant || col.important)
            .map((col, ci) => {
              const type = col.type ?? "def";
              const CellComponent = cellComponents[type];
              return (
                <td key={ci} >
                  <div className={styles.exttablediv}><CellComponent row={row} col={col.tag} small={col.small} /></div>
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
      <div className={`${styles.tablewrapper} ${styles['_tbl']}`} style={{ maxHeight: `calc(100vh - ${wrapperBottom}px)` }}
        ref={scrollRef}>
        <table className={styles.exttable}>
          <thead ref={headerRef}>
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