import "./app.scss";
import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { getEnvironment } from "./api-calls";
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Theme,
} from "@carbon/react";
import { Search, Notification, Switcher } from "@carbon/icons-react";
import LandingPage from "./pages/LandingPage";
import ReportPage from "./pages/ReportPage";

const App = () => {
  const [envData, setEnvData] = useState({});

  useEffect(function () {
    async function getEnv() {
      const data = await getEnvironment();
      console.log("INFO : App.js data from get Environment : ", data);
      setEnvData(data);

      // Set the title in the browser bar
      //document.title = data.client_title;
    }
    console.log("INFO : App.js - Getting the environment variables.");
    getEnv();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route
          path="/home"
          element={<LandingPage envData={envData} setEnvData={setEnvData} />}
        />
        <Route
          path="/report"
          element={<ReportPage envData={envData} setEnvData={setEnvData} />}
        />
        <Route
          path="*"
          element={<div id="errorpage">There's nothing here: 404!</div>}
        />
      </Route>
    </Routes>
  );
};

const Layout = () => {
  return (
    <Theme theme="white">
      <Header aria-label="IBM Platform Name">
        <HeaderName href="/home" prefix="RWS">
          Hackaton App
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Search" onClick={() => {}}>
            <Search />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Notifications" onClick={() => {}}>
            <Notification />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="App Switcher" onClick={() => {}}>
            <Switcher />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <Outlet />
    </Theme>
  );
};

export default App;
