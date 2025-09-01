import Shepherd from "shepherd.js";
import type { Tour, StepOptions, StepOptionsButton } from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import imageOverview from "./images/tour-overview.webp";
import imageActions from "./images/tour-actions.webp";

export function startTourHighlightIfNecessary() {
  if (Shepherd.activeTour?.isActive && Shepherd.activeTour.isActive()) return;

  const dismissed = localStorage.getItem("help_dismissed");
  if (dismissed) return;

  const highlightTour: Tour = new Shepherd.Tour({
    useModalOverlay: true,
    exitOnEsc: true,
    defaultStepOptions: {
      classes: "shepherd-theme-arrows",
      scrollTo: true,
      cancelIcon: { enabled: true },
    },
  });

  highlightTour.addStep({
    id: "help-highlight",
    attachTo: { element: '[data-tour="help"]', on: "left" },
    title: "Need help?",
    text: "Click this button to start a guided tour.",
    buttons: [
      {
        text: "Start tour",
        action: () => {
          highlightTour.complete();
          setTimeout(() => {
            startTour();
          });
        },
        classes: "shepherd-button-primary",
      },
      {
        text: "Dismiss",
        action: () => {
          highlightTour.cancel();
        },
        classes: "shepherd-button-secondary",
      },
    ],
  });

  highlightTour.on("complete", () => {
    localStorage.setItem("help_dismissed", "true");
  });
  highlightTour.on("cancel", () => {
    localStorage.setItem("help_dismissed", "true");
  });
  applyExitOnOverlayClick(highlightTour);

  highlightTour.start();
}

export function startTour() {
  if (Shepherd.activeTour?.isActive && Shepherd.activeTour.isActive()) return;

  const steps: StepOptions[] = [
    {
      id: "overview",
      title: "Overview",
      text: `
        <p><img src="${imageOverview}" alt="Sample document" width="400" height="211" style="width: 100%; height: 100%; object-fit: scale-down" /></p>

        <p>This app generates a one-page journal of pictures and text with a fully automated layout.</p>

        <p>This is a purely local app.  Nothing you enter is uploaded or sent anywhere.</p>
      `,
      attachTo: undefined,
    },
    {
      id: "add-picture",
      title: "Add pictures",
      text: "<p>Start by adding photos from your device.</p>  <p>They will be arranged automatically into rows to fit onto one page.</p>",
      attachTo: { element: '[data-tour="add-picture"]', on: "bottom" },
    },
    {
      id: "add-text",
      title: "Add text",
      text: "<p>Add a text box for notes or comment.</p>  <p>They will be arranged in line with the pictures.</p>",
      attachTo: { element: '[data-tour="add-text"]', on: "bottom" },
    },
    {
      id: "item-actions",
      title: "Item actions",
      text: `
        <p><img src="${imageActions}" alt="Action buttons" width="400" height="209" style="width: 100%; height: 100%; object-fit: scale-down" /></p>
        <p>Click on a picture or text box to see actions you can take on it:</p>
        <ul>
          <li><b>Arrows:</b> reorder items</li>
          <li><b>Star:</b> prefer to keep this item bigger</li>
          <li><b>Pencil:</b> edit the text box</li>
          <li><b>Trash:</b> remove the item</li>
        </ul>
      `,
      attachTo: undefined,
    },
    {
      id: "download",
      title: "Publish",
      text: "<p>Save your document as a PDF.</p>  <p>Or download it as a file that can be opened in Microsoft Publisher.</p>",
      attachTo: { element: '[data-tour="download"]', on: "bottom" },
    },
    {
      id: "new",
      title: "New",
      text: `<p>When you're done, start a new document.</p>
        <p>This removes all pictures and textboxes and resets the date to today.</p>
        <p>You can also use the Trash icon to delete all stored data, including your undo/redo history.</p>`,
      attachTo: { element: '[data-tour="new"]', on: "bottom" },
    },
    {
      id: "undo-redo",
      title: "Undo / redo",
      text: "<p>The undo and redo buttons let you revert a change.</p>  <p>The undo history will be saved even if you close this page and come back later.</p>",
      attachTo: { element: '[data-tour="undo-redo"]', on: "bottom" },
    },
  ];

  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    exitOnEsc: true,
    defaultStepOptions: {
      classes: "shepherd-theme-arrows",
      scrollTo: true,
      cancelIcon: { enabled: true },
    },
  });

  steps.forEach((s, idx) => {
    const lastIdx = steps.length - 1;
    const buttons: StepOptionsButton[] = [];
    if (idx > 0) {
      buttons.push({ text: "← Previous", action: () => tour.back(), classes: "shepherd-button-secondary" });
    }
    if (idx < lastIdx) {
      buttons.push({ text: "Next →", action: () => tour.next(), classes: "shepherd-button-primary" });
    } else {
      buttons.push({ text: "Done", action: () => tour.complete(), classes: "shepherd-button-primary" });
    }

    tour.addStep({
      id: s.id,
      title: s.title,
      text: s.text,
      attachTo: s.attachTo,
      when: {},
      buttons: buttons,
    });
  });

  applyExitOnOverlayClick(tour);
  tour.start();
}

function applyExitOnOverlayClick(tour: Tour) {
  const handler = (ev: MouseEvent) => {
    const target = ev.target as Element | null;
    if (target?.closest(".shepherd-modal-overlay-container")) {
      tour.cancel();
      document.removeEventListener("click", handler as EventListener);
    }
  };
  document.addEventListener("click", handler as EventListener);
  const cleanup = () => document.removeEventListener("click", handler as EventListener);
  tour.on("complete", cleanup);
  tour.on("cancel", cleanup);
}
