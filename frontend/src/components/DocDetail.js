import React, { useEffect, useState } from "react";
import { sendWatsonXQuery } from "../api-calls";
import {
  Grid,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Loading,
  Tile,
  InlineNotification,
} from "@carbon/react";

function DocDetail({ searchQuery, reportData, continueSearch }) {
  const [docAnswer, setDocAnswer] = useState("");
  const [docTableInfo, setDocTableInfo] = useState([]);
  const [loadingClass, setLoadingClass] = useState("hide-me");
  const [answerClass, setAnswerClass] = useState("hide-me");

  useEffect(
    function () {
      async function getAnswer(searchQueryAnswer, searchReport) {
        const data = await sendWatsonXQuery(searchQueryAnswer, searchReport);
        console.log("INFO : DocDetails get answer from watsonx : ", data);

        setLoadingClass("hide-me");
        setDocAnswer(data.answer);
        if (data.table_nltext) {
          setDocTableInfo(data.table_nltext);
        }
        setAnswerClass("");
      }

      // Only search when needed
      if (continueSearch) {
        setDocAnswer("");
        setAnswerClass("hide-me");
        setDocTableInfo([]);
        setLoadingClass("");
        getAnswer(searchQuery, reportData);
      } else {
        console.log("INFO: Not executing search in DocDetail");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportData.passage_text, continueSearch]
  );

  // Make a string out of the contaminant list
  let contaminants = "";
  if (reportData.contaminant_count) {
    for (const el in reportData.contaminant_count) {
      contaminants += el + " (" + reportData.contaminant_count[el] + ") ,";
    }
  }
  // Make a string out of the fuel type list
  let fueltypes = "";
  if (reportData.fuel_type_count) {
    for (const el in reportData.fuel_type_count) {
      fueltypes += el + " (" + reportData.fuel_type_count[el] + ") ,";
    }
  }
  // Make a string out of the project location
  let project_location = "";
  if (reportData.project_location) {
    for (const el in reportData.project_location) {
      project_location += reportData.project_location[el] + ",";
    }
  }
  // Make a string out of the project period
  let project_period = "";
  if (reportData.project_period) {
    for (const el in reportData.project_period) {
      project_period += reportData.project_period[el] + ",";
    }
  }

  return (
    <Grid fullWidth>
      <Column lg={5} md={8} sm={4} className="my-rowdetail-area">
        <Tabs>
          <TabList aria-label="List of tabs">
            <Tab>Document Info</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="my-rowdetail-grid">
                <Column lg={16} md={8} sm={4}>
                  <div>
                    <strong>Filename</strong> : {reportData.filename}
                  </div>
                  <div>
                    <strong>Number of pages</strong> : {reportData.numPages}
                  </div>
                  <div>
                    <strong>Author</strong> : {reportData.author}
                  </div>
                  <div>
                    <strong>Document id</strong> : {reportData.document_id}
                  </div>
                  <div>
                    <strong>Project id</strong> : {reportData.project_id}
                  </div>
                  <div>
                    <strong>Project Location</strong> : {project_location}
                  </div>
                  <div>
                    <strong>Project Period</strong> : {project_period}
                  </div>
                  <div>
                    <strong>Contaminant(s)</strong> :
                  </div>
                  <div>{contaminants}</div>
                  <div>
                    <strong>Fuel Type(s)</strong> :
                  </div>
                  <div>{fueltypes}</div>
                </Column>

                <Column lg={16} md={8} sm={4}>
                  <div className="padding-top-32">
                    <Loading className={loadingClass} withOverlay={false} />
                    <InlineNotification
                      className={answerClass}
                      aria-label="closes notification"
                      kind="success"
                      hideCloseButton={true}
                      lowContrast={true}
                      statusIconDescription="Answer"
                      subtitle={docAnswer}
                      title="Answer : "
                    />
                  </div>
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
      <Column lg={11} md={8} sm={4} className="my-rowdetail-area">
        <Tabs>
          <TabList aria-label="List of tabs">
            <Tab>Passages Found</Tab>
            <Tab>Extracted Table Info</Tab>
            <Tab>Tables Found</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {reportData.passage_text.map((passage, index) => (
                <div key={"passage" + index} className="padding-bottom-10">
                  {passage}
                </div>
              ))}
            </TabPanel>
            <TabPanel>
              {docTableInfo.map((passage, index) => (
                <div key={"tableinfo" + index} className="padding-bottom-10">
                  {passage}
                </div>
              ))}
            </TabPanel>
            <TabPanel>
              {reportData.table_html_clean.map((tablehtml, index) => (
                <Tile key={"table" + index}>
                  <div dangerouslySetInnerHTML={{ __html: tablehtml }} />
                </Tile>
              ))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
    </Grid>
  );
}

export default DocDetail;
