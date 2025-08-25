import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import tourImageActions from "./images/tour-image-actions.webp";
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
          title: "Take action",
          description: `<p><img src="${tourImageActions}" style="width: 100%; height: 100%"; object-fit: scale-down" /></p>
<p>Click on a picture or text box to show some action buttons.</p>
<p>Reorder pictures or text boxes with the arrow buttons.</p>
<p>Mark items you want to highlight with the star button and we'll try to choose layouts that keep it as big as possible.</p>`,
          side: "bottom",
        },
      },
      {
        element: '[data-tour="download"]',
        popover: {
          title: "Publish",
          description:
            "<p>You can save your document as a PDF.</p>  <p>Or if you want to make more changes, download it as a file that can be opened in Microsoft Publisher.</p>",
          side: "bottom",
        },
      },
      {
        element: '[data-tour="new"]',
        popover: {
          title: "New",
          description:
            "<p>When you're done, start a new document.</p>  <p>This removes all pictures and textboxes and resets the date to today.</p>",
          side: "bottom",
        },
      },
      {
        element: '[data-tour="undo-redo"]',
        popover: {
          title: "Undo",
          description:
            "<p>Use the undo and redo buttons if you want to revert a change.</p>  <p>The undo history will be saved even if you reload the page.</p>",
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
