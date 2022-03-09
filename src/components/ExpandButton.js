import React from "react";
import {
  TableTreeColumn
} from "@devexpress/dx-react-grid-material-ui";

const ExpandButtonComponent = ({ column, style, ...restProps }) => {
  return (
    <TableTreeColumn.ExpandButton
      {...restProps}
      style={{
        ...style,
        color: "red",
        marginRight: "0px",
        padding: "0px",
        width: "10px",
      }}
    />
  );
};

export default ExpandButtonComponent;