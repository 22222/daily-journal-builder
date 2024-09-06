/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from "react";

import { Modal } from "./Modal";

export interface ShowModalOptions {
  getContent: (onClose: () => void) => React.ReactElement;
  closeOnClickOutside?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function useModal(): [React.ReactElement | null, (options: ShowModalOptions) => void] {
  const [modalContent, setModalContent] = React.useState<null | {
    content: React.ReactElement;
    closeOnClickOutside: boolean;
    size: "sm" | "md" | "lg" | "xl" | undefined;
  }>(null);

  const onClose = React.useCallback(() => {
    setModalContent(null);
  }, []);

  const modal = React.useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const { content, closeOnClickOutside, size } = modalContent;

    return (
      <Modal onClose={onClose} closeOnClickOutside={closeOnClickOutside} size={size}>
        {content}
      </Modal>
    );
  }, [modalContent, onClose]);

  const showModal = React.useCallback(
    (options: ShowModalOptions) => {
      setModalContent({
        content: options.getContent(onClose),
        closeOnClickOutside: options.closeOnClickOutside ?? true,
        size: options.size,
      });
    },
    [onClose],
  );

  return [modal, showModal];
}
