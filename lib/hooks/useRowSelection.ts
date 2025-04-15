import { RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";

type RowData<T> = T & {
  id: string;
};

export function useRowSelection<T = void>({
  data,
}: { data?: RowData<T>[] } = {}) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedRowData, setSelectedRowData] = useState<RowData<T>[]>([]);
  const selectedIds = Object.keys(rowSelection).map((key) => key);

  const handleRowSelection = (
    newState:
      | RowSelectionState
      | ((rowSelection: RowSelectionState) => RowSelectionState)
  ) => {
    const newRowSelection =
      typeof newState === "function" ? newState(rowSelection) : newState;

    setRowSelection(newState);

    if (data) {
      const newSelectedRowData = selectedRowData.filter((row) => {
        return newRowSelection[row.id];
      });
      data.forEach((row) => {
        if (newRowSelection[row.id] && !newSelectedRowData.includes(row)) {
          newSelectedRowData.push(row);
        }
      });

      setSelectedRowData(newSelectedRowData);
    }
  };

  return {
    selectedIds,
    selectedRowData,
    rowSelection,
    setRowSelection: handleRowSelection,
  };
}
