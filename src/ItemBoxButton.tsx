import React from "react";

import {
  FloatingFocusManager,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from "@floating-ui/react";

import { IconArrowLeft, IconArrowRight, IconPencilSquare, IconTrash, IconX, IconStar, IconStarFill } from "./icons";
import type { DailyJournalDocumentItemBox } from "./DailyJournalDocument";

export interface ItemBoxButtonProps {
  itemBox: DailyJournalDocumentItemBox;
  onClickEdit?: () => void;
  onClickDelete?: () => void;
  onClickMoveLeft?: () => void;
  onClickMoveRight?: () => void;
  onClickToggleFeatured?: () => void;
  children: React.ReactNode;
}

export function ItemBoxButton(props: ItemBoxButtonProps) {
  const { itemBox, onClickEdit, onClickDelete, onClickMoveLeft, onClickMoveRight, onClickToggleFeatured, children } =
    props;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: menuOpen,
    onOpenChange: setMenuOpen,
    middleware: [offset(2), flip({ fallbackAxisSideDirection: "end" }), shift()],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const headingId = useId();

  return (
    <React.Fragment>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="layout-item"
        style={{
          width: itemBox.style.width,
          height: itemBox.style.height,

          // Try to make this button not look like a button
          background: "none",
          color: "inherit",
          border: "none",
          padding: 0,
          margin: 0,
          font: "inherit",
          userSelect: "text",
        }}
      >
        {children}
      </button>
      {menuOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            className="popover"
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              minWidth: itemBox.style.width,
            }}
            aria-labelledby={headingId}
            {...getFloatingProps()}
          >
            <div className="popover-body">
              <div className="btn-toolbar gap-1">
                <div className="btn-group">
                  <button
                    className="btn btn-secondary"
                    onClick={onClickMoveLeft}
                    disabled={!onClickMoveLeft}
                    title="Move left"
                    aria-label="Move Left"
                  >
                    <IconArrowLeft />
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={onClickMoveRight}
                    disabled={!onClickMoveRight}
                    title="Move right"
                    aria-label="Move Right"
                  >
                    <IconArrowRight />
                  </button>
                </div>
                <div className="btn-group">
                  <button
                    className={"btn btn-secondary" + (itemBox.item.featured ? " active" : "")}
                    onClick={onClickToggleFeatured}
                    disabled={!onClickToggleFeatured}
                    title={itemBox.item.featured ? "Cancel featured" : "Mark as featured"}
                    aria-label={itemBox.item.featured ? "Cancel featured" : "Mark as featured"}
                  >
                    {itemBox.item.featured ? <IconStarFill /> : <IconStar />}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={onClickEdit}
                    disabled={!onClickEdit}
                    title="Edit"
                    aria-label="Edit"
                  >
                    <IconPencilSquare />
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={onClickDelete}
                    disabled={!onClickDelete}
                    title="Delete"
                    aria-label="Delete"
                  >
                    <IconTrash />
                  </button>
                </div>
                {/* <div className="btn-group">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                    title="Close"
                    aria-label="Close"
                  >
                    <IconX />
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </React.Fragment>
  );
}
