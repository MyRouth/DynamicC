import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import './FinalResults.css';

const FinalResults = (props) => {
  const [shopRate, setShopRate] = useState(props.shopRate);

  return (
    <div>
      <div className="finalCalcResult">
        <span style={{ fontWeight: 'bold' }}>Calculated Costs</span>
        <Grid container spacing={1} style={{ marginTop: '12px' }}>
          <Grid item xs={3}> Original Cost </Grid>
          <Grid item xs={4}> $ {props.originalTotal} </Grid>
          <Grid item xs={2}> Unit Cost </Grid>
          <Grid item xs={3}> $ {Number.parseFloat(props.unitCost).toFixed(2)} </Grid>

          <Grid item xs={3}> New Cost </Grid>
          <Grid item xs={9}> $ {props.newTotal}</Grid>
          <Grid item xs={12}> <hr /></Grid>

          <Grid item xs={3}> Difference </Grid>
          <Grid item xs={9}>
            $ {(props.newTotal - props.originalTotal).toFixed(2)}
          </Grid>
        </Grid>
      </div>
      <div className="shop-rate">
        <TextField
          id="standard-basic"
          label="Shop Rate"
          value={shopRate}
          type="number"
          onChange={(e) => {
            setShopRate(e.target.valueAsNumber);
          }}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              props.setShopRate(e.target.valueAsNumber);
            }
          }}
          onBlur={(e) => {
            props.setShopRate(e.target.valueAsNumber);
          }}
        />
      </div>
    </div>
  );
};

export default FinalResults;