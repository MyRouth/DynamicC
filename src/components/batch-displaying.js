import React from "react";
import {
  Plugin,
  Template,
  TemplatePlaceholder
} from "@devexpress/dx-react-core";
import { TableHeaderRow } from "@devexpress/dx-react-grid-material-ui";

export const BatchDisplaying = ({ changes }) => {
  return (
    <Plugin name="BatchDisplaying">
      <Template
        name="tableCell"
        predicate={({ tableRow }) => tableRow.type !== TableHeaderRow.ROW_TYPE}
      >
        {(params) => {
          const { tableRow, tableColumn } = params;
          const { rowId } = tableRow;
          if (tableColumn.column) {
            const { name: columnName } = tableColumn.column;

            if (changes[rowId] && changes[rowId].hasOwnProperty(columnName)) {
              return (
                <TemplatePlaceholder
                  params={{
                    ...params,
                    style: { ...params.style, backgroundColor: "purple", opacity: '0.7', color: 'white' }
                  }}
                />
              );
            }
          }
          return <TemplatePlaceholder params={{ ...params }} />;
        }}
      </Template>
    </Plugin>
  );
};
