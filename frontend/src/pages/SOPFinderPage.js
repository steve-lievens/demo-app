import React, { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Column,
  Form,
  Tile,
  Checkbox,
  Button,
  ButtonSkeleton,
} from "@carbon/react";
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@carbon/react";
import { sendSOPQuery } from "../api-calls";
import { Search } from "@carbon/icons-react";

function SOPFinderPage({ envData, setEnvData }) {
  const [showState, setShowState] = useState({
    search_button: "",
    skeleton_button: "hide-me",
    data_table: "hide-me",
  });
  const [sopDocs, setSopDocs] = useState([]);
  const [sopData, setSopData] = useState({
    TAG_TYPE_GROUNDWATER: false,
    TAG_TYPE_SOIL: false,
    TAG_TREAT_ISTD: false,
    TAG_TREAT_ESTD: false,
    TAG_FUEL_GAS: false,
    TAG_FUEL_LIQUID: false,
    TAG_VAPOR_VTU: false,
    TAG_VAPOR_REBURN: false,
    TAG_BURNER_STANDARD: false,
    TAG_BURNER_REMOTE: false,
    TAG_CONTAMINANT_GENERAL: false,
    TAG_CONTAMINANT_MERCURY: false,
    TAG_CONTAMINANT_VOC: false,
  });

  const handleSubmit = (event) => {
    async function sendSOPData(sopData) {
      const data = await sendSOPQuery(sopData);
      console.log("INFO : Returned data from SOP query : ", data);

      // Set the returned data to the state
      setSopDocs(data);

      // Show the correct buttons again
      setShowState({
        search_button: "",
        skeleton_button: "hide-me",
        data_table: "",
      });
    }

    event.preventDefault();
    console.log("Clicking the Search button ...");

    // Hide/Show components
    setShowState({
      search_button: "hide-me",
      skeleton_button: "",
      data_table: "hide-me",
    });
    console.log(sopData);
    sendSOPData(sopData);
  };

  const handleCheckBox = (event, checkBoxState) => {
    console.log("Clicking checkbox", checkBoxState.id);
    sopData[checkBoxState.id] = checkBoxState.checked;

    setSopData(sopData);
  };

  const headers = [
    {
      key: "author",
      header: "Author",
    },
    {
      key: "filename",
      header: "Filename",
    },
    {
      key: "filetype",
      header: "Filetype",
    },
    {
      key: "numpages",
      header: "# Pages",
    },
    {
      key: "publicationdate",
      header: "Pub Date",
    },
  ];

  return (
    <div className="my-infopane">
      <Grid className="landing-page" fullWidth>
        <Column lg={16} md={8} sm={4} className="landing-page__welcome">
          <Breadcrumb noTrailingSlash>
            <BreadcrumbItem>
              <a href="/">Home</a>
            </BreadcrumbItem>
            / SOP Finder
          </Breadcrumb>
          <h1 className="landing-page__heading">SOP Finder</h1>
        </Column>
        <Column lg={16} md={8} sm={4} className="landing-page_nav">
          <Form onSubmit={handleSubmit}>
            <Grid className="sop-finder-form">
              <Column lg={3} md={4} sm={4}>
                <Tile>
                  Treatment Type
                  <br />
                  <br />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`ESTD`}
                    id="TAG_TREAT_ESTD"
                  />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`ISTD`}
                    id="TAG_TREAT_ISTD"
                  />
                </Tile>
              </Column>
              <Column lg={3} md={4} sm={4}>
                <Tile>
                  Fuel Type
                  <br />
                  <br />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`Gas`}
                    id="TAG_FUEL_GAS"
                  />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`Liquid`}
                    id="TAG_FUEL_LIQUID"
                  />
                </Tile>
              </Column>
              <Column lg={3} md={4} sm={4}>
                <Tile>
                  Vapor Treatment Type
                  <br />
                  <br />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`VTU`}
                    id="TAG_VAPOR_VTU"
                  />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`Reburn`}
                    id="TAG_VAPOR_REBURN"
                  />
                </Tile>
              </Column>
              <Column lg={3} md={4} sm={4}>
                <Tile>
                  Burner Type
                  <br />
                  <br />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`Standard`}
                    id="TAG_BURNER_STANDARD"
                  />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`Remote`}
                    id="TAG_BURNER_REMOTE"
                  />
                </Tile>
              </Column>
              <Column lg={3} md={4} sm={4}>
                <Tile>
                  Containment Type
                  <br />
                  <br />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`Mercury`}
                    id="TAG_CONTAMINANT_MERCURY"
                  />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`VOC`}
                    id="TAG_CONTAMINANT_VOC"
                  />
                  <Checkbox
                    onChange={handleCheckBox}
                    labelText={`General`}
                    id="TAG_CONTAMINANT_GENERAL"
                  />
                </Tile>
              </Column>
            </Grid>
            <Button
              className={showState.search_button}
              type="submit"
              renderIcon={Search}
            >
              Search
            </Button>
            <ButtonSkeleton className={showState.skeleton_button} size="sm" />
          </Form>
        </Column>
        <Column
          lg={16}
          md={8}
          sm={4}
          className={showState.data_table + " landing-page_nav"}
        >
          <DataTable rows={sopDocs} headers={headers} isSortable>
            {({
              rows,
              headers,
              getTableProps,
              getHeaderProps,
              getRowProps,
            }) => (
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </Column>
      </Grid>
    </div>
  );
}

export default SOPFinderPage;
