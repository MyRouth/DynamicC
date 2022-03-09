import React, { useContext } from "react";
import RemoveIcon from '@material-ui/icons/Delete';
import { VirtualTable } from "@devexpress/dx-react-grid-material-ui";
import { ActionContext } from "../App";

const Cell = ({ column, row, style, ...restProps }) => {
  const mystyle = { color: "#5897E7" };
  const { removeRow } = useContext(ActionContext);

  if (!row.nonEditable && Number.isInteger((+row.lvl_crush)) && column.name === 'btn') {
    return (
      <VirtualTable.Cell
        {...restProps}
        style={{ ...mystyle, ...style, fontSize: "11px", padding: "1px", borderRight: '1px solid', borderColor: 'rgb(224, 224, 224)' }}
      >
        <button
          title='Remove'
          style={{ cursor: 'pointer', padding: '0px', border: 'none', background: 'none', color: 'red' }}
          onClick={() => removeRow(row)}
        >
          <RemoveIcon />
        </button>
      </VirtualTable.Cell>
    )
  }

  if (!row.nonEditable && !row.items && column.name === 'item_WH_cost_per') {
    return (
      <VirtualTable.Cell
        {...restProps}
        style={{ ...mystyle, ...style, fontSize: "11px", padding: "1px", borderRight: '1px solid', borderColor: 'rgb(224, 224, 224)' }}
      />
    );
  }

  if (row.nonEditable && !(row.isLastMaterial && column.name === 'item_WH_cost_per')) {
    return (
      <VirtualTable.Cell
        {...restProps}
        style={{ ...style, fontSize: "11px", padding: "1px", borderRight: '1px solid', borderColor: 'rgb(224, 224, 224)', backgroundColor: '#A8A8A8' }}
      />
    );
  }

  if (/internal_cost|cost|material|total_cost/.test(column.name) && !(row.isLastMaterial && column.name === 'item_WH_cost_per')) {
    return (
      <VirtualTable.Cell
        {...restProps}
        style={{ ...style, fontSize: "11px", padding: "1px", borderRight: '1px solid', borderColor: 'rgb(224, 224, 224)' }}
      />
    );
  }

  return (
    <VirtualTable.Cell
      {...restProps}
      style={{ ...mystyle, ...style, fontSize: "11px", padding: "1px", borderRight: '1px solid', borderColor: 'rgb(224, 224, 224)' }}
    />
  );
};

export default Cell