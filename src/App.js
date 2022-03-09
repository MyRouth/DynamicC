import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import ReportsIcon from '@material-ui/icons/Receipt';
import CartIcon from "@material-ui/icons/ShoppingCart";
import CartPlusIcon from "@material-ui/icons/AddShoppingCart";
import Badge from "@material-ui/core/Badge";

import "./App.css";
import { DataSheet } from "./components/data-sheet";
import FinalResults from './components/FinalResults';
import QuoteReports from "./components/QuoteReports";
import Cart from "./components/Cart";

export const ActionContext = React.createContext();

function App() {

  const [occurence, setOccurence] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [renderCompo, setRenderCompo] = useState('default');

  const [quoteName, setQuoteName] = useState();

  const [itemNumber, setItemNumber] = useState("");

  let [rows, setRows] = useState([]);

  const [shopRate, setShopRate] = useState(115);

  const [originalTotal, setOriginalTotal] = useState(0);

  const [newTotal, setNewTotal] = useState(0);

  const [cartsElement, setCartsElement] = useState([]);

  const updateRowsProps = (property, value) => {
    rows[0][property] = value;
    setRows([...rows]);
  }

  const removeRow = (row) => {
    const firstElement = { ...rows[0] };

    const index = firstElement.items.findIndex(item => item.occurence === row.occurence && JSON.stringify(item.sortArray) === JSON.stringify(row.sortArray));
    const removedElement = { ...firstElement.items[index] };
    firstElement.items.splice(index, 1);

    const tempRows = rows.filter(item => row.id !== item.id);
    firstElement.items = [...firstElement.items];
    tempRows[0] = { ...firstElement };
    updateBatchQuanity(removedElement, tempRows);
  }

  const generateReport = async () => {
    setIsLoading(true);
    const date = new Date();
    const time = date.getTime();
    const fileName = date.getFullYear().toString().substr(-2)
      + ("0" + (date.getMonth() + 1)).slice(-2)
      + ("0" + date.getDate()).slice(-2) + "_"
      + ("0" + date.getHours()).slice(-2) + "_"
      + ("0" + date.getMinutes()).slice(-2) + "_"
      + ("0" + date.getSeconds()).slice(-2) + "_"
      + quoteName;

    fetch(`${process.env.REACT_APP_API}/report/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "rows": rows,
        "originalTotal": originalTotal,
        "newTotal": newTotal,
        "fileName": fileName,
        "time": time
      })
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        alert(err.message)
      });
  }

  const setQuoteData = async () => {
    const finalMaterials = await getQuote(itemNumber);
    if (finalMaterials) {
      setRows([]);
      setRows([...finalMaterials]);
      setOriginalTotal(finalMaterials[0].item_WH_cost_per);
    }
  }

  const getQuote = async (itemNum, initialId = 0) => {
    itemNum = itemNum.toUpperCase();
    setIsLoading(true);
    const response = await fetch(
      `${process.env.REACT_APP_API}/mydata/${itemNum}`
    ).then((r) => r.json())
      .catch((err) => {
        setIsLoading(false);
        alert(err.message)
      });
    console.log(response);
    if ((!response || !response.length)) {
      setIsLoading(false);
      setRows([]);
      alert("NO QUOTE AVAILABLE");
      return;
    }

    const materials = response
      .filter(({ entry_type }) => entry_type === "Material")
      .sort((a, b) => (a.lvl_crush > b.lvl_crush ? 1 : -1));
    const operations = response.filter(
      ({ entry_type }) => entry_type === "Operation"
    );

    const topLevelMaterials = {};
    for (const material of materials) {
      material.sortArray = material.lvl_crush.split(".");
      material.occurence = occurence;
      material.qty = material[`qty_l${material.sortArray.length}`] || material[`qty_l${material.sortArray.length - 1}`];
      topLevelMaterials[material.sortArray[0] + ' ' + material.l1_item] = [
        ...(topLevelMaterials[material.sortArray[0] + ' ' + material.l1_item] || []),
        material,
      ];
    }

    function sortArray(material) {
      return material.sort((a, b) => {
        if (a[1] > b[1]) {
          return -1;
        } else if (a[1] === b[1]) {
          if ((a[2] || 0) > (b[2] || 0)) {
            return -1;
          } else if ((a[2] || 0) === (b[2] || 0)) {
            if ((a[3] || 0) > (b[3] || 0)) {
              return -1;
            }
          }
        }
        return 1;
      });
    }

    const sortedMaterial = Object.values(topLevelMaterials).map(
      (materialArray) => sortArray(materialArray)
    );

    function attachOperations(material, id, parentId) {
      const matchedItems = operations
        .filter(({ l1_item, lvl_crush }) => l1_item === material.l1_item && lvl_crush === material.lvl_crush)
        .sort((a, b) => (+a.op_sequence > +b.op_sequence ? 1 : -1));
      if (matchedItems.length) {
        matchedItems.forEach((operation) => {
          operation.parentId = parentId
          operation.id = id;
          id++;
          [
            "lvl_crush",
            "item_ref",
            "item_ref_desc",
            "item_ref_ebq",
            "uom",
            "qty",
            "item_WH_cost_per",
            "material",
          ].forEach((e) => delete operation[e]);
        });
        material.items = matchedItems;
      }
      return id;
    }

    let id = initialId;

    const baseMaterial = sortedMaterial.shift()[0];
    baseMaterial.nonEditable = true;
    baseMaterial.id = id;
    id++;
    id = attachOperations(baseMaterial, id, baseMaterial.id);
    const topLevelRows = [];
    sortedMaterial.forEach((rowArray) => {
      const rowArrayCopy = { ...rowArray[0], id };
      id++;
      rowArrayCopy.nonEditable = true;
      topLevelRows.push(rowArrayCopy);
    });

    if (Array.isArray(baseMaterial.items)) {
      baseMaterial.items.push(...topLevelRows);
    } else {
      baseMaterial.items = [...topLevelRows];
    }
    const finalMaterials = [baseMaterial];
    sortedMaterial.forEach((materialArray) => {
      let topLevelMaterial = materialArray.shift();
      topLevelMaterial.id = id;
      id++;
      topLevelMaterial.isTopLevelMaterial = true;
      id = attachOperations(topLevelMaterial, id, topLevelMaterial.id);
      let prevMaterial = topLevelMaterial;
      let prevParentMaterial = topLevelMaterial;
      const lengthDepthMap = {};
      let currentDepth = 0;
      while (materialArray.length) {

        let currentElement = materialArray.shift();
        currentElement.id = id;
        id++;
        id = attachOperations(currentElement, id, currentElement.id);

        if (prevMaterial.sortArray.length === currentElement.sortArray.length) {
          currentElement.parentId = prevParentMaterial.id
          prevParentMaterial.items = [...prevParentMaterial.items || [], currentElement];
        } else if (prevMaterial.sortArray.length > currentElement.sortArray.length) {
          currentDepth = lengthDepthMap[currentElement.sortArray.length];
          let currentItem = topLevelMaterial;
          let count = 6;
          while (count) {
            count--;
            if (
              currentItem.items[currentItem.items.length - 1].sortArray
                .length === currentElement.sortArray.length
            ) {
              currentElement.parentId = currentItem.id
              currentItem.items.push(currentElement);
              if (!prevMaterial.items) {
                prevMaterial.isLastMaterial = true
              }
              prevMaterial = currentElement;
              prevParentMaterial = currentItem;
              break;
            } else {
              currentItem = currentItem.items[currentItem.items.length - 1];
            }
          }
          currentDepth++;
        } else {
          currentElement.parentId = prevMaterial.id;
          if (Array.isArray(prevMaterial.items)) {
            prevMaterial.items = [...prevMaterial.items, currentElement];
          } else {
            prevMaterial.items = [currentElement];
          }
          prevParentMaterial = prevMaterial;
          currentDepth++;
          lengthDepthMap[currentElement.sortArray.length] = currentDepth;
        }

        if (!materialArray.length) {
          currentElement.isLastMaterial = true
        }
        prevMaterial = currentElement;
      }
      topLevelMaterial.internal_cost = "";
      finalMaterials.push(topLevelMaterial);
    });
    setIsLoading(false);
    setOccurence(prev => prev + 1);

    return finalMaterials;
  };

  const updateBaseFields = (removedElement) => {
    const basePart = rows[0]
    for (let index = 1; index < rows.length; index++) {
      const topLevelMaterial = rows[index];
      if (topLevelMaterial.isTopLevelMaterial) {
        let baseRowRef = basePart.items.find(({ l1_item, lvl_crush, occurence }) =>
          lvl_crush === topLevelMaterial.lvl_crush && l1_item === topLevelMaterial.l1_item && occurence === topLevelMaterial.occurence)
        if (!baseRowRef && removedElement) {
          baseRowRef = { ...removedElement };
        }
        Object.assign(baseRowRef, topLevelMaterial, { id: baseRowRef.id });
        delete baseRowRef.items;
      }
    }
    basePart.item_WH_cost_per = basePart.items.reduce((acc, curr) => (acc ? acc : 0) + Number(curr.total_cost ? curr.total_cost : 0), 0).toFixed(2);
    basePart.total_cost = basePart.item_WH_cost_per;
  }

  function getParent(arr = [], id) {
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i + 1]) {
        return arr[i];
      }
      if (arr[i].id <= id && id < arr[i + 1].id) {
        return arr[i];
      }
    }
    return arr[arr.length - 1];
  }

  function getById(arr = [], id = 0) {
    let expectedObj;
    let elmToSearchIn = getParent(arr, id);

    if (elmToSearchIn.id === +id) {
      expectedObj = elmToSearchIn;
    } else {
      expectedObj = getById(elmToSearchIn.items, id);
    }
    return expectedObj;
  }

  const updateParent = (rowId) => {
    const parentRow = getById(rows, rowId);
    calculateValues(parentRow);
    if (parentRow.parentId) {
      updateParent(parentRow.parentId);
    }
  }

  const calculateValues = (row, shouldUpdateParent) => {
    if (row.items) {
      row.item_WH_cost_per = row.items.reduce((acc, curr) => (acc ? acc : 0) + Number(curr.total_cost ? curr.total_cost : 0), 0).toFixed(2);
    }
    if (row.qty && row.item_WH_cost_per) {
      row.material = (row.qty * row.item_WH_cost_per).toFixed(3);
    }
    if ((row.parentId === 0 || row.parentId)) {
      const parentRow = getById(rows, row.parentId);
      const opSetupHours = +row.op_setup_hours || 0;
      const opRunHours = +row.op_run_hours || 0;
      const parentEBQ = +parentRow.item_ref_ebq || 0;
      if (parentEBQ) {
        const internalCost = ((opSetupHours / parentEBQ) + opRunHours);
        row.internal_op_costs = (internalCost * shopRate).toFixed(2);
      }
    }
    if (row.internal_op_costs || row.material || row.sub_costs) {
      const internal_op_costs = +row.internal_op_costs || 0;
      const material = +row.material || 0;
      const sub_costs = +row.sub_costs || 0;

      row.total_cost = (internal_op_costs + material + sub_costs).toFixed(2);
      if (row.parentId && shouldUpdateParent) {
        updateParent(row.parentId);
      }
    }

    if (row.items) {
      row.total_cost = row.material;
    }
  }

  function calculateAll(row) {
    if (row.items) {
      row.items.forEach(rowItem => {
        calculateAll(rowItem);
      });
    }
    calculateValues(row);
  };

  const updateNewRows = (updatedRows) => {
    rows = [...updatedRows];
    rows.forEach(row => {
      calculateAll(row);
    });

    setRows([...rows]);
    updateBaseFields();
    setNewTotal(rows[0].item_WH_cost_per);
  };

  const updateBatchQuanity = (removedElement, updatedRows) => {
    rows = [...updatedRows];
    rows.forEach(row => {
      calculateAll(row);
    });

    updateBaseFields(removedElement);

    setNewTotal(rows[0].item_WH_cost_per);
    setRows([...rows]);
  };

  const addToCart = () => {
    setRenderCompo('cart');
    const quotesData = {
      'key': new Date().getTime(),
      'shopRate': shopRate,
      'cost': newTotal,
      'itemNumber': itemNumber
    };
    const quotesInCart = [...cartsElement];
    quotesInCart.push(quotesData);
    setCartsElement(quotesInCart);
  }

  let comp;
  switch (renderCompo) {
    // case 'cart':
    //   comp = <Cart setRenderCompo={setRenderCompo} cartsElement={cartsElement} setCartsElement={setCartsElement} />;
    //   break;
    case 'quotesReports':
      comp = <QuoteReports setRenderCompo={setRenderCompo} />
      break;
    default:
      comp = (
        <ActionContext.Provider value={{ removeRow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: "20px" }}>
                <TextField
                  id="standard-basic"
                  label="Item Number"
                  value={itemNumber}
                  onChange={(e) => setItemNumber(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: "15px", marginRight: "15px", marginTop: "10px" }}
                  onClick={setQuoteData}
                >
                  Search
                </Button>
                {rows && rows[0] &&
                  <>
                    <TextField
                      id="quote-name"
                      label="Quote Name"
                      value={quoteName}
                      size='small'
                      onChange={(e) => setQuoteName(e.target.value)}
                    />

                    <Button
                      disabled={!quoteName}
                      variant="contained"
                      color="primary"
                      style={{ width: "110px", marginLeft: "15px", marginTop: "10px" }}
                      onClick={generateReport}
                    >
                      Save Quote
                    </Button>
                  </>
                }
              </div>
              <div style={{ marginBottom: "20px" }}>
                {rows && rows[0] ? (
                  <div className="table-style">
                    <Grid container spacing={1} style={{ fontSize: '11px' }}>
                      <Grid item xs={5}>
                        <TextField
                          id="standard-basic-table"
                          label="Quoted Part Number"
                          value={rows[0].item_ref}
                          fullWidth
                          onChange={(e) => updateRowsProps('item_ref', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={7}>
                        <TextField
                          id="standard-basic-table"
                          label="Quoted Part Description"
                          value={rows[0].item_ref_desc}
                          onChange={(e) => updateRowsProps('item_ref_desc', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          id="standard-basic-table"
                          label="Quoted Batch Quantity"
                          value={rows[0].item_ref_ebq}
                          onChange={(e) => updateRowsProps('item_ref_ebq', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={7}>
                        <TextField
                          id="standard-basic-table"
                          label="Base Part Description"
                          value={rows[0].master_long_desc}
                          onChange={(e) => updateRowsProps('master_long_desc', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </div>
                ) : null}
              </div>
            </div>
            {rows.length ? (
              <FinalResults
                shopRate={shopRate}
                originalTotal={originalTotal}
                newTotal={newTotal}
                setShopRate={setShopRate}
                unitCost={rows[0].wh_cost}
              />) : null
            }
          </div>
          {
            rows.length ? (
              <>
                {/* <Button
                  variant="contained"
                  color="primary"
                  style={{ height: '54px', marginTop: '42px', float: 'right' }}
                  onClick={addToCart}
                  disabled={cartsElement.find(ele => ele.cost === newTotal && ele.shopRate === shopRate && ele.itemNumber === itemNumber)}
                >
                  <CartPlusIcon />{" "} Add to Cart
                </Button> */}
                <DataSheet
                  calculateValues={calculateValues}
                  updateBaseFields={updateBaseFields}
                  getById={getById}
                  calculateAll={calculateAll}
                  shopRate={shopRate}
                  rows={rows} setRows={setRows}
                  setNewTotal={setNewTotal}
                  getQuote={getQuote}
                  updateNewRows={updateNewRows}
                />
              </>
            ) : null
          }
        </ActionContext.Provider>
      );
  }

  return (
    <>
      <div style={{ margin: '10px' }}>
        <Button
          style={{
            background: "none",
            border: "none",
            color: "#069",
            marginLeft: '-10px'
          }}
          onClick={() => { setRenderCompo('quotesReports') }}>
          <ReportsIcon />Quote History
        </Button>
        <div style={{ float: 'right' }}>
          <span style={{ paddingRight: '20px' }}> Running Version: 1.0.4</span>
          {/* <span className="cart-btn" onClick={() => setRenderCompo('cart')}>
            <Badge color="secondary" badgeContent={cartsElement.length} max={9}>
              <CartIcon style={{ transform: 'scale(1.85)' }} />{" "}
            </Badge>
            <span style={{ paddingLeft: '13px' }}>Cart</span>
          </span> */}
        </div>
      </div>
      {
        isLoading ? (
          <div style={{
            margin: 0,
            position: "absolute",
            top: "50%",
            left: "50%",
          }}>
            <CircularProgress color="inherit" size={36} />
          </div>
        )
          : <>{comp}</>
      }
    </>
  );
}

export default App;
