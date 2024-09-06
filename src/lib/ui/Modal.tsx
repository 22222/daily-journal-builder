/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnClickOutside?: boolean;
}

export function Modal({ children, closeOnClickOutside = false, onClose, size }: ModalProps): React.ReactElement {
  return createPortal(
    <ModalPortal onClose={onClose} size={size} closeOnClickOutside={closeOnClickOutside}>
      {children}
    </ModalPortal>,
    document.body,
  );
}

interface ModalPortalProps {
  onClose: () => void;
  children: React.ReactNode;
  size: "sm" | "md" | "lg" | "xl" | undefined;
  closeOnClickOutside: boolean;
}

function ModalPortal({ children, closeOnClickOutside, onClose, size }: ModalPortalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (modalRef.current !== null) {
      modalRef.current.focus();
    }
  }, []);

  React.useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (modalRef.current !== null && !modalRef.current.contains(target as Node) && closeOnClickOutside) {
        onClose();
      }
    };
    const modelElement = modalRef.current;
    if (modelElement !== null) {
      modalOverlayElement = modelElement.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement.addEventListener("click", clickOutsideHandler);
      }
    }

    window.addEventListener("keydown", handler);
    document.body.classList.add("modal-open");

    return () => {
      window.removeEventListener("keydown", handler);
      document.body.classList.remove("modal-open");
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onClose]);

  return (
    <React.Fragment>
      <div className={"modal fade show d-block"} tabIndex={-1} aria-modal={true} role="dialog">
        <div className={"modal-dialog" + (size ? ` modal-${size}` : "")} tabIndex={-1} ref={modalRef}>
          {children}
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </React.Fragment>
  );
}
