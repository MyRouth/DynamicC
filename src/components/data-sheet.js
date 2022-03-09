import React, { useState, useEffect } from "react";
import { Paper, Button, TextField } from "@material-ui/core";
import {
  TreeDataState,
  CustomTreeData,
  EditingState,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  VirtualTable,
  TableHeaderRow,
  TableTreeColumn,
  TableFixedColumns,
  TableInlineCellEditing,
  TableColumnResizing
} from "@devexpress/dx-react-grid-material-ui";

import "../App.css";
import Header from "./TableHeader";
import Cell from "./TableCell";
import ExpandButtonComponent from "./ExpandButton";
import EditableCell from "./EditableCell";
import TreeColumnCell from "./TreeColumnCell";
import { BatchDisplaying } from "./batch-displaying";

const getChildRows = (row, rootRows) => (row ? row.items : rootRows);
const getRowId = row => row.id;

export function DataSheet(props) {
  const [isAddRow, setIsAddRow] = useState(false);

  const [itemNumber, setItemNumber] = useState("");

  const [columns] = useState([
    { name: "btn", title: " " },
    { name: "lvl_crush", title: "Seq" },
    { name: "item_ref", title: "Part Number" },
    { name: "item_ref_desc", title: "Description" },
    { name: "item_ref_ebq", title: "EBQ" },
    { name: "uom", title: "UOM" },
    { name: "qty", title: "QTY" },
    { name: "item_WH_cost_per", title: "Cost/UOM" },
    { name: "material", title: "Material" },
    { name: "op_sequence", title: "Op" },
    { name: "subcontract_operation", title: "Subcontract Operation" },
    { name: "sub_costs", title: "Sub. Costs" },
    { name: "internal_operation", title: "Internal Operation" },
    { name: "op_setup_hours", title: "Setup (Hrs)" },
    { name: "op_run_hours", title: "Run (Hrs)" },
    { name: "internal_op_costs", title: "Internal Costs" },
    { name: "total_cost", title: "Total Cost" }
  ]);

  const [defaultColumnWidths] = useState([
    { columnName: "btn", width: 32 },
    { columnName: "lvl_crush", width: 100 },
    { columnName: "item_ref", width: 80 },
    { columnName: "item_ref_desc", width: 300 },
    { columnName: "item_ref_ebq", width: 50 },
    { columnName: "uom", width: 50 },
    { columnName: "qty", width: 50 },
    { columnName: "item_WH_cost_per", width: 70 },
    { columnName: "material", width: 80 },
    { columnName: "op_sequence", width: 50, },
    { columnName: "subcontract_operation", width: 80 },
    { columnName: "sub_costs", width: 80 },
    { columnName: "internal_operation", width: 120 },
    { columnName: "op_setup_hours", width: 70 },
    { columnName: "op_run_hours", width: 60 },
    { columnName: "internal_op_costs", width: 80 },
    { columnName: "total_cost", width: 80 }
  ]);

  const [tableColumnExtensions] = useState([
    { columnName: "btn", align: "center" },
    { columnName: "lvl_crush", align: "center" },
    { columnName: "item_ref", width: 80 },
    { columnName: "item_ref_desc", width: 280 },
    { columnName: "item_ref_ebq", align: "center", width: 50 },
    { columnName: "uom", width: 50, align: "center" },
    { columnName: "qty", width: 50, align: "center" },
    { columnName: "item_WH_cost_per", align: "center" },
    { columnName: "material", align: "center" },
    { columnName: "op_sequence", align: "center", width: 50, },
    { columnName: "subcontract_operation" },
    { columnName: "sub_costs", align: "center" },
    { columnName: "internal_operation" },
    { columnName: "op_setup_hours", align: "right" },
    { columnName: "op_run_hours", align: "right" },
    { columnName: "internal_op_costs", align: "right" },
    { columnName: "total_cost", align: "right" },
  ]);

  const [leftColumns] = useState([
    "btn",
    "lvl_crush",
    "item_ref",
    "item_ref_desc",
    "item_ref_ebq",
  ]);

  const [editingStateColumnExtensions] = useState([
    { columnName: "item_WH_cost_per", editingEnabled: false },
    { columnName: "material", editingEnabled: false },
    { columnName: "internal_op_costs", editingEnabled: false },
    { columnName: "total_cost", editingEnabled: false },
  ]);

  const [changes, setChanges] = useState({});

  const commitChanges = ({ changed }) => {
    let changedRows;
    if (changed) {
      const changedRowId = Object.keys(changed)[0];
      if (changed[changedRowId]) {
        const changedProperty = Object.keys(changed[changedRowId])[0];
        const modifiedElm = props.getById(props.rows, changedRowId);
        modifiedElm[changedProperty] = changed[changedRowId][changedProperty];
        if (changedProperty === 'item_ref_ebq') {
          props.calculateAll(modifiedElm);
        } else {
          props.calculateValues(modifiedElm, true);
        }
        props.updateBaseFields();

        changedRows = props.rows.map((row) =>
          changed[row.id] ? { ...row, ...changed[row.id] } : row
        );

        props.setNewTotal(props.rows[0].item_WH_cost_per);
        props.setRows(changedRows);
      }
      const keys = Object.keys(changes).concat(Object.keys(changed));
      const result = keys.reduce((acc, key) => {
        acc[key] = Object.assign({ ...changes[key] }, { ...changed[key] });
        return acc;
      }, {});
      setChanges(result);
    }
  };

  const findLastId = (obj) => {
    if (obj.items) {
      const arr = [];
      obj.items.forEach(element => {
        arr.push(findLastId(element))
      });
      return Math.max(...arr, obj.id);
    }
    return obj.id;
  }

  const addRow = async () => {
    const rows = props.rows;
    let startingId = findLastId(rows[rows.length - 1]);

    const newQuote = await props.getQuote(itemNumber, startingId);
    const _rows = [...rows];

    if (newQuote?.length) {
      _rows[0].items.push(...newQuote[0].items);

      _rows.push(...newQuote.slice(1));
    }
    function assignIDs() {
      let index = 0;

      const makeSequential = (obj) => {
        let id = index;
        if (obj.items) {
          index++;
          let its = [];
          obj.items.forEach(element => {
            const o = makeSequential(element);
            if (o.parentId) {
              its.push({ ...o, parentId: id });
            } else {
              its.push(o);
            }
            index++;
          });
          index--;
          return { ...obj, id, items: its }
        }
        return { ...obj, id };
      }

      let list = [];
      _rows.forEach((el) => {
        const rowData = makeSequential(el);
        index++;
        list.push(rowData);
      })
      return list;
    }
    const rowData = assignIDs();
    props.updateNewRows(rowData);
  }

  useEffect(() => {
    const { rows } = props;
    rows.forEach(row => {
      props.calculateAll(row);
    });
    props.updateBaseFields();
    props.setNewTotal(rows[0].item_WH_cost_per);
    props.setRows([...rows]);

  }, [props.shopRate]);

  return (
    <Paper>
      <Grid rows={props.rows} columns={columns} getRowId={getRowId}>
        <TreeDataState />
        <CustomTreeData getChildRows={getChildRows} />
        <VirtualTable columnExtensions={tableColumnExtensions} cellComponent={Cell} height="auto" />
        <TableColumnResizing defaultColumnWidths={defaultColumnWidths} />
        <TableHeaderRow cellComponent={Header} />
        <TableTreeColumn
          for="lvl_crush"
          expandButtonComponent={ExpandButtonComponent}
          cellComponent={TreeColumnCell}
        />
        <EditingState
          onCommitChanges={commitChanges}
          columnExtensions={editingStateColumnExtensions}
          startEditCells
        />
        <BatchDisplaying changes={changes} />
        <TableInlineCellEditing cellComponent={EditableCell} />

        <TableFixedColumns leftColumns={leftColumns} />
        <div style={{ backgroundColor: '#ccc', width: '100%', marginBottom: "10px" }}>
          <Button
            variant="contained"
            color="primary"
            style={{ margin: "12px 5px 12px 5px" }}
            onClick={() => setIsAddRow(prev => !prev)}
          >
            {isAddRow ? '-' : 'Add'}
          </Button>
          {isAddRow && <>
            <TextField
              id="standard-basic"
              label="Item Number"
              value={itemNumber}
              onChange={(e) => setItemNumber(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "15px", marginRight: "15px", marginTop: '5px' }}
              onClick={addRow}
            >
              Search
            </Button>
          </>
          }
        </div>
      </Grid>
    </Paper>
  );
}
