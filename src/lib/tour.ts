import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import imageOverview from "./images/tour-overview.webp";
import imageActions from "./images/tour-actions.webp";
//import type { Driver, DriverHook, Popover, DriveStep, Config, State } from "driver.js";

export function startTourHighlightIfNecessary() {
  const dismissed = localStorage.getItem("help_dismissed");
  if (dismissed) {
    return;
  }

  const driverObj = driver({
    onDestroyed: () => {
      localStorage.setItem("help_dismissed", "true");
    },
  });
  driverObj.highlight({
    element: '[data-tour="help"]',
    popover: { title: "Need help?", description: "Click this button to start a guided tour.", side: "left" },
  });
}

export function startTour() {
  // setTourMode({});
  // const events = {
  //   onStepActivating(activeIndex: number) {
  //     if (activeIndex === 1) {
  //       setTourMode({ layout: true });
  //     }
  //   },
  //   onStepDeactivating(activeIndex: number) {},
  //   onTourStopped() {
  //     setTourMode(undefined);
  //   },
  // };

  const driverObj = driver({
    showProgress: true,
    steps: [
        {
        element: undefined,
        popover: {
          title: "Overview",
          description: `<p><img src="${imageOverview}" alt="Sample document" width="400" height="211" style="width: 100%; height: 100%; object-fit: scale-down" /></p>

<p>This app generates a one-page journal of pictures and text with a fully automated layout.</p>

<p>This is a purely local app.  Nothing you enter is uploaded or sent anywhere.</p>`,
          side: "bottom",
        },
      },
      {
        element: '[data-tour="add-picture"]',
        popover: {
          title: "Add pictures",
          description:
            "<p>Start by adding photos from your device.</p>  <p>They will be arranged automatically into rows to fit onto one page.</p>",
          side: "bottom",
        },
      },
      {
        element: '[data-tour="add-text"]',
        popover: {
          title: "Add text",
          description:
            "<p>Add a text box for notes or comment.</p>  <p>They will be arranged in line with the pictures.</p>",
          side: "bottom",
        },
      },
      {
        element: undefined,
        popover: {
          title: "Item actions",
          description: `<p><img src="${imageActions}" alt="Action buttons" width="400" height="209" style="width: 100%; height: 100%; object-fit: scale-down" /></p>
<p>Click on a picture or text box to see actions you can take on it:</p>
<ul>
<li><b>Arrows:</b> reorder items</li>
<li><b>Star:</b> prefer to keep this item bigger</li>
<li><b>Pencil:</b> edit the text box</li>
<li><b>Trash:</b> remove the item</li>
</ul>`,
          side: "bottom",
        },
      },
      {
        element: '[data-tour="download"]',
        popover: {
          title: "Publish",
          description:
            "<p>Save your document as a PDF.</p>  <p>Or download it as a file that can be opened in Microsoft Publisher.</p>",
          side: "bottom",
        },
      },
      {
        element: '[data-tour="new"]',
        popover: {
          title: "New",
          description:
            `<p>When you're done, start a new document.</p>
<p>This removes all pictures and textboxes and resets the date to today.</p>
<p>You can also use the Trash icon to delete all stored data, including your undo/redo history.</p>`,
          side: "bottom",
        },
      },
      {
        element: '[data-tour="undo-redo"]',
        popover: {
          title: "Undo / redo",
          description:
            "<p>The undo and redo buttons let you revert a change.</p>  <p>The undo history will be saved even if you close this page and come back later.</p>",
          side: "bottom",
        },
      },
    ],
    // onPrevClick: function (element, step, options) {
    //   const activeIndex = driverObj.getActiveIndex() ?? 0;
    //   events.onStepDeactivating(activeIndex);
    //   if (!driverObj.isFirstStep()) {
    //     events.onStepActivating(activeIndex - 1);
    //   }
    //   driverObj.movePrevious();
    // },

    // onNextClick: function (element, step, options) {
    //   const activeIndex = driverObj.getActiveIndex() ?? 0;
    //   events.onStepDeactivating(activeIndex);
    //   if (!driverObj.isLastStep()) {
    //     events.onStepActivating(activeIndex + 1);
    //   }
    //   driverObj.moveNext();
    // },

    // onCloseClick: function (element, step, options) {
    //   events.onStepDeactivating(driverObj.getActiveIndex() ?? 0);
    //   driverObj.destroy();
    // },

    // onDestroyed: function (element, step, options) {
    //   events.onTourStopped();
    // },
  });
  driverObj.drive();
}
