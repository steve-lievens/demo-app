import React, { useEffect, useState } from "react";
import { getRowData } from "../api-calls";
import { Grid, Column, Tile, Dropdown, TextArea, Button } from "@carbon/react";

function RowDetail({ detailData }) {
  const [rowData, setRowData] = useState({
    foundNorm: { norm: "", found: [{ mentions: [{ extract: "" }] }] },
    normList: [{ score: "" }],
    matchedNorm: { item: { _id: "" } },
    matchedNormListPub: [],
    matchedNormListAll: [],
  });

  useEffect(
    function () {
      async function getRow() {
        const data = await getRowData(detailData.id);
        console.log("INFO : RowDetails get row data : ", data);
        setRowData(data);

        // Set the title in the browser bar
        //document.title = data.client_title;
      }
      console.log("INFO : App.js - Getting the row details");
      getRow();
    },
    [detailData.id]
  );

  const items2 = rowData.matchedNormListAll.map((a) => {
    let confidence = ((1 - parseFloat(a.score)) * 100).toFixed(2);
    return a.item._id + " (confidence : " + confidence + "%)";
  });

  const items = rowData.matchedNormListPub.map((a) => {
    let confidence = ((1 - parseFloat(a.score)) * 100).toFixed(2);
    return a.item._id + " (confidence : " + confidence + "%)";
  });

  // Build the extract
  const foundNorms = rowData.foundNorm.found;

  return (
    <Grid fullWidth>
      <Column lg={16} md={8} sm={4} className="my-rowdetail-area">
        <Grid className="my-rowdetail-grid">
          <Column md={4} lg={6} sm={4}>
            <div className="my-rowdetail-title">Details and Context</div>

            {foundNorms.map((foundNorm) => {
              //console.log(cell);

              return (
                <Tile className="my-rowdetail-tile">
                  ... {foundNorm.mentions[0].extract} ...
                </Tile>
              );
            })}

            <Button className="my-rowdetail-savebutton">Save Changes</Button>
            <Button className="my-rowdetail-cancelbutton" kind="secondary">
              Cancel
            </Button>
          </Column>
          <Column md={2} lg={5} sm={4}>
            <Dropdown
              className="my-rowdetail-dropdown"
              id="alterntive-norms-published"
              items={items}
              label="Choose another norm ..."
              titleText="Alternative published norms"
              initialSelectedItem={rowData.matchedNorm.item._id}
            />
          </Column>
          <Column md={2} lg={5} sm={4}>
            <Dropdown
              className="my-rowdetail-dropdown"
              id="alterntive-norms-all"
              items={items2}
              label="Choose another norm ..."
              titleText="Alternative from all norms"
              initialSelectedItem={items2[0]}
            />
            <TextArea
              className="my-rowdetail-commentarea"
              cols={50}
              id="comments"
              invalidText="A valid value is required"
              labelText="Comments"
              placeholder="..."
              rows={3}
              disabled
            />
            <TextArea
              className="my-rowdetail-commentadd"
              cols={50}
              id="addcomment"
              invalidText="A valid value is required"
              labelText="Add a comment"
              rows={1}
            />
          </Column>
        </Grid>
      </Column>
    </Grid>
  );
}

export default RowDetail;
