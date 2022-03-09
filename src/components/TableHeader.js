import React from "react";
import {
  TableHeaderRow
} from "@devexpress/dx-react-grid-material-ui";

const Header = ({ style, ...restProps }) => {
    const customStyle = {
      fontWeight: "bold",
      fontSize: "11px",
      padding: "2px",
      borderRight: '1px solid',
      borderTop: '1px solid',
      borderColor: 'rgb(224, 224, 224)',
      backgroundColor: '#E7E6E6'
    };
    return (
      <TableHeaderRow.Cell
        {...restProps}
        style={{ ...customStyle, ...style }}
      />
    );
};
  
export default Header