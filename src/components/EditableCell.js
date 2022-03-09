import React from "react";

import {
  TableInlineCellEditing
} from "@devexpress/dx-react-grid-material-ui";

const EditableCell = ({ row, style, editingEnabled, ...restProps }) => {
  const isEditable = ((!row.nonEditable && !row.items && restProps.column.name === 'item_WH_cost_per') || (row.isLastMaterial && restProps.column.name === 'item_WH_cost_per') || (!row.nonEditable && editingEnabled))
  return (
    <TableInlineCellEditing.Cell
      {...restProps}
      editingEnabled={isEditable}
      style={{
        ...style,
        fontSize: "11px",
        padding: "0px",
        borderRight: '1px solid', borderColor: 'rgb(224, 224, 224)',
        color: 'red'
      }}
    />
  );
};

export default EditableCell