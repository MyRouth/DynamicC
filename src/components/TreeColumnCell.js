import React from "react";
import {
  TableTreeColumn
} from "@devexpress/dx-react-grid-material-ui";

const TreeColumnCell = ({ column, style, ...restProps }) => {
  return (
    <TableTreeColumn.Cell
      {...restProps}
      style={{ ...style, paddingLeft: "20px", paddingRight: "2px", borderRight: '1px solid', borderColor: 'rgb(224, 224, 224)', fontSize: '11px' }}
    />
  );
};

export default TreeColumnCell