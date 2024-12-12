import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Column,
  Form,
  Button,
  ButtonSkeleton,
  Tile,
  Accordion,
  AccordionItem,
  CheckboxGroup,
  Checkbox,
} from "@carbon/react";
import { Search as SearchInput } from "@carbon/react";
import { Search as SearchIcon, Reset } from "@carbon/icons-react";

import { sendReportQuery2, getAllReportsFromDS } from "../api-calls";
import DocDetail from "../components/DocDetail";

function SearchPage({ envData, setEnvData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [continueSearch, setContinueSearch] = useState(false);
  const [reportDocs, setReportDocs] = useState([]);
  const [showState, setShowState] = useState({
    search_button: "",
    skeleton_button: "hide-me",
    data_table: "hide-me",
  });
  const [contaminantsList, setContaminantsList] = useState([
    { name: "hydrocarbons", active: false },
    { name: "PCB", active: false },
    { name: "dioxin", active: false },
    { name: "mercury", active: false },
    { name: "chlorine", active: false },
    { name: "BTEX", active: false },
    { name: "phenol", active: false },
    { name: "PAH", active: false },
  ]);
  const [fueltypeList, setFueltypeList] = useState([
    { name: "natural gas", active: false },
    { name: "propane", active: false },
    { name: "diesel", active: false },
  ]);
  const [treatmentList, setTreatmentList] = useState([
    { name: "ISTD", active: false },
    { name: "ESTD", active: false },
  ]);
  const [vaporTreatmentList, setVaporTreatmentList] = useState([
    { name: "VTU", active: false },
    { name: "reburn", active: false },
  ]);

  async function getAllReports() {
    console.log(
      "INFO : SearchPage getting all reports based on the filters..."
    );
    // Reset the full search until the Search button is pressed again.
    setContinueSearch(false);

    // Get the filtered data
    const data = await getAllReportsFromDS(
      contaminantsList,
      fueltypeList,
      treatmentList,
      vaporTreatmentList
    );

    setReportDocs(data);
    console.log(data);
  }

  useEffect(
    function () {
      setReportDocs([]);
      getAllReports();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contaminantsList, fueltypeList, treatmentList, vaporTreatmentList]
  );

  const handleSubmit = (event) => {
    async function sendReportSearch(reportSearchQuery) {
      const data = await sendReportQuery2(
        reportSearchQuery,
        contaminantsList,
        fueltypeList,
        treatmentList,
        vaporTreatmentList
      );
      console.log("INFO : Returned data from Report query : ", data);

      // Set the returned data to the state
      setReportDocs(data);

      // Show the correct buttons again
      let newState = { ...showState };
      newState.search_button = "";
      newState.skeleton_button = "hide-me";
      newState.data_table = "";
      setShowState(newState);
    }

    event.preventDefault();
    console.log("Clicking the Search button ...");

    // Hide/Show components
    let newState = { ...showState };
    newState.search_button = "hide-me";
    newState.skeleton_button = "";
    newState.data_table = "hide-me";
    setShowState(newState);

    // Reset the data
    setReportDocs([]);
    setContinueSearch(true);
    sendReportSearch(searchQuery);
  };

  const handleSearchInput = (event) => {
    console.log("Updating Search: ", event.target.value);

    setSearchQuery(event.target.value);
  };

  const onContaminantCheck = (event, { checked, id }) => {
    console.log("Clicking contaminant", id, checked);

    setContaminantsList(getCheckBoxItems(contaminantsList, checked, id));
  };

  const onFuelTypeCheck = (event, { checked, id }) => {
    console.log("Clicking fuel type", id, checked);

    setFueltypeList(getCheckBoxItems(fueltypeList, checked, id));
  };

  const onTreatmentCheck = (event, { checked, id }) => {
    console.log("Clicking treatment type", id, checked);

    setTreatmentList(getCheckBoxItems(treatmentList, checked, id));
  };

  const onVaporTreatmentCheck = (event, { checked, id }) => {
    console.log("Clicking vapor treatment type", id, checked);

    setVaporTreatmentList(getCheckBoxItems(vaporTreatmentList, checked, id));
  };

  const onReset = (event) => {
    console.log("Resetting ", event);

    setContaminantsList(resetCheckBoxItems(contaminantsList));
    setFueltypeList(resetCheckBoxItems(fueltypeList));
    setTreatmentList(resetCheckBoxItems(treatmentList));
    setVaporTreatmentList(resetCheckBoxItems(vaporTreatmentList));

    setContinueSearch(false);

    setSearchQuery("");
  };

  function getCheckBoxItems(checkBoxList, checked, id) {
    let newlist = [];
    for (const checkItem of checkBoxList) {
      let newItem = {
        name: checkItem.name,
        active: checkItem.active,
      };
      if (newItem.name === id) newItem.active = checked;
      newlist.push(newItem);
    }

    console.log("INFO: setting the checked array to ", newlist);
    return newlist;
  }
  function resetCheckBoxItems(checkBoxList) {
    let newlist = [];
    for (const checkItem of checkBoxList) {
      let newItem = {
        name: checkItem.name,
        active: false,
      };

      newlist.push(newItem);
    }

    return newlist;
  }

  return (
    <div className="my-infopane">
      <Grid className="landing-page" fullWidth>
        <Column lg={16} md={8} sm={4} className="landing-page__welcome">
          <Breadcrumb noTrailingSlash>
            <BreadcrumbItem>
              <a href="/">Home</a>
            </BreadcrumbItem>
            / Project Q&A
          </Breadcrumb>
          <h1 className="landing-page__heading">Project Q&A</h1>
        </Column>

        <Column lg={16} md={8} sm={4} className="landing-page_nav">
          <Form onSubmit={handleSubmit}>
            <Grid className="">
              <Column lg={12} md={8} sm={4} className="padding-top-16">
                <SearchInput
                  className="my-search-input"
                  size="lg"
                  placeholder="Search on reports"
                  labelText="Search"
                  closeButtonLabelText="Clear search input"
                  id="searchQueryTyped"
                  onChange={handleSearchInput}
                  value={searchQuery}
                />
              </Column>
              <Column lg={4} md={8} sm={4}></Column>
            </Grid>

            <Button
              className={showState.search_button}
              type="submit"
              renderIcon={SearchIcon}
            >
              Search
            </Button>
            <ButtonSkeleton className={showState.skeleton_button} size="sm" />

            <Button
              className="margin-left-10"
              renderIcon={Reset}
              onClick={onReset}
            >
              Reset
            </Button>

            <Accordion className="padding-top-16">
              <AccordionItem title="Filters" open={true}>
                <Grid className="">
                  <Column lg={4} md={4} sm={4}>
                    <CheckboxGroup legendText="Contaminants">
                      {contaminantsList.map((listItem) => (
                        <Checkbox
                          labelText={listItem.name}
                          id={listItem.name}
                          key={listItem.name}
                          checked={listItem.active}
                          onChange={onContaminantCheck}
                        />
                      ))}
                    </CheckboxGroup>
                  </Column>
                  <Column lg={4} md={4} sm={4}>
                    <CheckboxGroup legendText="Fuel Type">
                      {fueltypeList.map((listItem) => (
                        <Checkbox
                          labelText={listItem.name}
                          id={listItem.name}
                          key={listItem.name}
                          checked={listItem.active}
                          onChange={onFuelTypeCheck}
                        />
                      ))}
                    </CheckboxGroup>
                  </Column>
                  <Column lg={4} md={4} sm={4}>
                    <CheckboxGroup legendText="Treatment Type">
                      {treatmentList.map((listItem) => (
                        <Checkbox
                          labelText={listItem.name}
                          id={listItem.name}
                          key={listItem.name}
                          checked={listItem.active}
                          onChange={onTreatmentCheck}
                        />
                      ))}
                    </CheckboxGroup>
                  </Column>
                  <Column lg={4} md={4} sm={4}>
                    <CheckboxGroup legendText="Vapor Treatment Type">
                      {vaporTreatmentList.map((listItem) => (
                        <Checkbox
                          labelText={listItem.name}
                          id={listItem.name}
                          key={listItem.name}
                          checked={listItem.active}
                          onChange={onVaporTreatmentCheck}
                        />
                      ))}
                    </CheckboxGroup>
                  </Column>
                </Grid>
              </AccordionItem>
            </Accordion>
          </Form>
        </Column>
        <Column lg={16} md={8} sm={4} className="landing-page_nav">
          <Grid className="">
            <Column lg={16} md={8} sm={4} className="">
              {reportDocs.map((report) => (
                <div key={report.document_id} className="padding-bottom-10">
                  <Tile>
                    <DocDetail
                      key={report.document_id}
                      searchQuery={searchQuery}
                      reportData={report}
                      continueSearch={continueSearch}
                    />
                  </Tile>
                </div>
              ))}
            </Column>
          </Grid>
        </Column>
      </Grid>
    </div>
  );
}

export default SearchPage;
