import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Column,
  Dropdown,
} from "@carbon/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendGetBucketContents, sendGetFileContent } from "../api-calls";

function ReportPage({ envData, setEnvData }) {
  const [cosFiles, setCosFiles] = useState([]);
  const [cosFile, setCosFile] = useState("");
  const [markdown, setMarkdown] = useState("");

  useEffect(function () {
    async function getCosFiles() {
      const data = await sendGetBucketContents();
      console.log(
        "INFO : ReportPage.js data from sendGetBucketContents : ",
        data
      );

      setCosFiles(data.bucket_list);
    }
    console.log("INFO : ReportPage.js - Getting the COS bucket file listing.");
    getCosFiles();
  }, []);

  useEffect(function () {}, []);

  const handleDropDownChange = (event) => {
    async function getCosContent(cosFileName) {
      const data = await sendGetFileContent(cosFileName);
      console.log("INFO : ReportPage.js data from sendGetFileContent : ", data);

      setMarkdown(data.file_body);
    }

    const fileName = event.selectedItem.Key;
    console.log("INFO: Clicking the Dropdown button ...");
    console.log("INFO: Selected filename : " + fileName);

    setCosFile(event.selectedItem.Key);
    getCosContent(fileName);
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
          <Dropdown
            id="default"
            titleText="Kies het gewenste dossier"
            label=""
            items={cosFiles}
            itemToString={(item) => (item ? item.Key : "")}
            onChange={handleDropDownChange}
          />
        </Column>
        <Column lg={16} md={8} sm={4} className="landing-page_nav">
          <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
        </Column>
      </Grid>
    </div>
  );
}

export default ReportPage;
