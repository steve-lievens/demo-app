import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Column,
  Form,
  Button,
  ButtonSkeleton,
  CheckboxGroup,
  Checkbox,
  Tile,
} from "@carbon/react";
import { Search as SearchInput } from "@carbon/react";

import { Search as SearchIcon } from "@carbon/icons-react";
import DocDetail from "../components/DocDetail";
import { sendReportQuery, sendGetCollections } from "../api-calls";

function ReportPage({ envData, setEnvData }) {
  const [showState, setShowState] = useState({
    confidenceSlider: "",
    search_button: "",
    skeleton_button: "hide-me",
    data_table: "hide-me",
    generateAnswer: "",
  });
  const [reportDocs, setReportDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveryCollections, setCollections] = useState([]);

  useEffect(function () {}, []);

  const handleSubmit = (event) => {
    async function sendReportSearch(
      reportSearchQuery,
      reportDiscoveryCollections
    ) {
      const data = await sendReportQuery(
        reportSearchQuery,
        reportDiscoveryCollections
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
    setReportDocs([]);

    sendReportSearch(searchQuery, discoveryCollections);
  };

  const handleSearchInput = (event) => {
    console.log("Updating Search: ", event.target.value);

    setSearchQuery(event.target.value);
  };

  const onCollectionCheck = (event, { checked, id }) => {
    console.log("Clicking collection ", id, checked);

    // set the collection array element to active or not depending on the checkbox state

    let collections = [];
    for (const collection of discoveryCollections) {
      let coll = {
        collection_id: collection.collection_id,
        name: collection.name,
        active: collection.active,
      };
      if (collection.collection_id === id) coll.active = checked;
      collections.push(coll);
    }

    console.log("INFO: setting the collection array to ", collections);
    setCollections(collections);
  };

  return (
    <div className="my-infopane">
      <Grid className="landing-page" fullWidth>
        <Column lg={16} md={8} sm={4} className="landing-page__welcome">
          <Breadcrumb noTrailingSlash>
            <BreadcrumbItem>
              <a href="/">Home</a>
            </BreadcrumbItem>
            / Rapport
          </Breadcrumb>
          <h1 className="landing-page__heading">Rapport</h1>
        </Column>

        <Column lg={16} md={8} sm={4} className="landing-page_nav">
          <Form onSubmit={handleSubmit}>
            <Grid className="">
              <Column lg={12} md={8} sm={4} className="padding-top-16">
                {/* comment here 
                <SearchInput
                  className="my-search-input"
                  size="lg"
                  placeholder="Search"
                  labelText="Search"
                  closeButtonLabelText="Clear search input"
                  id="searchQueryTyped"
                  onChange={handleSearchInput}
                />
                */}
              </Column>
            </Grid>

            <Button
              className={showState.search_button}
              type="submit"
              renderIcon={SearchIcon}
            >
              Search
            </Button>
            <ButtonSkeleton className={showState.skeleton_button} size="sm" />
          </Form>
        </Column>
        <Column lg={16} md={8} sm={4} className="landing-page_nav">
          <Grid className="">
            <Column lg={16} md={8} sm={4} className={showState.data_table}>
              {reportDocs.map((report) => (
                <div key={report.document_id} className="padding-bottom-10">
                  <Tile>
                    <DocDetail
                      key={report.document_id}
                      searchQuery={searchQuery}
                      reportData={report}
                      continueSearch={false}
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

export default ReportPage;
