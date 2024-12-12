import React from "react";
import { Grid, Column, ClickableTile } from "@carbon/react";
import { Search } from "@carbon/icons-react";

function LandingPage({ envData, setEnvData }) {
  return (
    <div className="my-infopane">
      <Grid className="landing-page" fullWidth>
        <Column lg={16} md={8} sm={4} className="landing-page__welcome">
          <h1 className="landing-page__heading">RWS Hackaton</h1>
          <h4 className="landing-page__heading">IBM Technology demo</h4>
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
                <div className="landing-page_navtitle">
                  Vergunningsoverzicht
                </div>
                <div>
                  Het is op dit moment erg tijdrovend om een helder overzicht te
                  krijgen van welke vergunningen geldig zijn. Het aanmaken van
                  een historisch overzicht van alle wijzigingen tov de
                  oorspronkelijke vergunning zal hierbij van grote waarde zijn.
                </div>
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
