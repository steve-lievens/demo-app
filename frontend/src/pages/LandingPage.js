import React from "react";
import { Grid, Column, ClickableTile } from "@carbon/react";
import { Search } from "@carbon/icons-react";

function LandingPage({ envData, setEnvData }) {
  return (
    <div className="my-infopane">
      <Grid className="landing-page" fullWidth>
        <Column lg={16} md={8} sm={4} className="landing-page__welcome">
          <h1 className="landing-page__heading">Welkom bij RWS !</h1>
        </Column>
        <Column lg={16} md={8} sm={4} className="landing-page_nav">
          <Grid>
            <Column md={4} lg={4} sm={4}>
              <ClickableTile
                id="tile-reports"
                href="/report"
                renderIcon={Search}
                className="landing-page_navtile"
              >
                <div className="landing-page_navtitle">Rapport</div>
                <div>Korte uitleg ... TODO</div>
              </ClickableTile>
            </Column>

            <Column md={4} lg={4} sm={4}></Column>
          </Grid>
        </Column>
        <Column lg={16} md={8} sm={4} className="landing-page_illustration">
          <Grid className="tabs-group-content">
            <Column md={4} lg={8} sm={4}></Column>
            <Column md={4} lg={7} sm={4}>
              <img
                className="landing-page_image"
                src={`${process.env.PUBLIC_URL}/img/welcome-img.png`}
                alt="Carbon illustration"
              />
            </Column>
          </Grid>
        </Column>
      </Grid>
    </div>
  );
}

export default LandingPage;
