import "bootstrap/dist/css/bootstrap.css";
import "./demo/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { DailyJournalBuilderApp } from "./demo/DailyJournalBuilderApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <section>
      <DailyJournalBuilderApp />
    </section>
  </React.StrictMode>,
);
