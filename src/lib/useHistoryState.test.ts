import { describe, it, expect } from "vitest";

import type { HistoryEntry } from "./useHistoryState";

describe("useHistoryState", () => {
  type HistoryStateInternal<T> = {
    past: KeyValuePair<number, T>[];
    present: KeyValuePair<number, T>;
    future: KeyValuePair<number, T>[];
  };

  interface KeyValuePair<TKey, TValue> {
    key: TKey;
    value: TValue;
  }

  // We are using a rollover system, where the keys automatically reset so they won't keep increasing forever.
  // So that makes the comparison a little complicated, where small values can actually be sorted above larger values
  // (small values after a rollover come before values that are after a rollover).
  // This works assuming that old entries will be purged before the rollover threshold is reached.
  const KEY_ROLLOVER = 1000;
  const KEY_ROLLOVER_THRESHOLD = KEY_ROLLOVER / 2;
  function compareEntries(a: HistoryEntry<any>, b: HistoryEntry<any>): number {
    const diff = (a.key - b.key + KEY_ROLLOVER) % KEY_ROLLOVER;
    if (diff === 0) return 0;
    return diff < KEY_ROLLOVER_THRESHOLD ? 1 : -1;
  }

  function getNextKey(history: HistoryStateInternal<any>): number {
    let lastEntry = history.present;
    for (const entry of history.past) {
      if (compareEntries(entry, lastEntry) > 0) {
        lastEntry = entry;
      }
    }
    for (const entry of history.future) {
      if (compareEntries(entry, lastEntry) > 0) {
        lastEntry = entry;
      }
    }
    return (lastEntry.key % KEY_ROLLOVER) + 1;
  }

  describe("getNextKey", () => {
    it("returns next key when no rollover is needed", () => {
      const history: HistoryStateInternal<string> = {
        past: [],
        present: { key: 5, value: "a" },
        future: [],
      };
      expect(getNextKey(history)).toBe(6);
    });

    it("returns next key after highest key in past/future", () => {
      const history: HistoryStateInternal<string> = {
        past: [
          { key: 10, value: "b" },
          { key: 8, value: "c" },
        ],
        present: { key: 5, value: "a" },
        future: [{ key: 7, value: "d" }],
      };
      expect(getNextKey(history)).toBe(11);
    });

    it("handles when the previous key is one less than rollover", () => {
      const history: HistoryStateInternal<string> = {
        past: [],
        present: { key: 99, value: "a" },
        future: [],
      };
      expect(getNextKey(history)).toBe(100);
    });

    it("handles when previous key is rollover", () => {
      const history: HistoryStateInternal<string> = {
        past: [],
        present: { key: 100, value: "a" },
        future: [],
      };
      expect(getNextKey(history)).toBe(1);
    });

    it("handles mixed keys near rollover", () => {
      const history: HistoryStateInternal<string> = {
        past: [
          { key: 98, value: "b" },
          { key: 99, value: "b2" },
        ],
        present: { key: 100, value: "a" },
        future: [{ key: 97, value: "c" }],
      };
      expect(getNextKey(history)).toBe(1);
    });

    it("returns 1 when highest key is 0", () => {
      const history: HistoryStateInternal<string> = {
        past: [],
        present: { key: 0, value: "a" },
        future: [],
      };
      expect(getNextKey(history)).toBe(1);
    });

    it("returns correct key when past/future keys are lower than present", () => {
      const history: HistoryStateInternal<string> = {
        past: [{ key: 2, value: "b" }],
        present: { key: 5, value: "a" },
        future: [{ key: 3, value: "c" }],
      };
      expect(getNextKey(history)).toBe(6);
    });

    it("handles mixed keys before and after rollover", () => {
      const history: HistoryStateInternal<string> = {
        past: [
          { key: 98, value: "b" },
          { key: 99, value: "b2" },
        ],
        present: { key: 100, value: "a" },
        future: [
          { key: 97, value: "c" },
          { key: 1, value: "c2" },
          { key: 2, value: "c2" },
        ],
      };
      expect(getNextKey(history)).toBe(3);
    });

    it("handles all keys being the same value", () => {
      const history: HistoryStateInternal<string> = {
        past: [{ key: 5, value: "b" }],
        present: { key: 5, value: "a" },
        future: [{ key: 5, value: "c" }],
      };
      expect(getNextKey(history)).toBe(6);
    });

    it("handles negative keys", () => {
      const history: HistoryStateInternal<string> = {
        past: [{ key: -1, value: "b" }],
        present: { key: 0, value: "a" },
        future: [{ key: -2, value: "c" }],
      };
      expect(getNextKey(history)).toBe(1);
    });

    it("handles large gaps between keys", () => {
      const history: HistoryStateInternal<string> = {
        past: [{ key: 1, value: "b" }],
        present: { key: 50, value: "a" },
        future: [{ key: 99, value: "c" }],
      };
      expect(getNextKey(history)).toBe(100);
    });

    it("handles non-sequential keys", () => {
      const history: HistoryStateInternal<string> = {
        past: [
          { key: 1, value: "b" },
          { key: 10, value: "c" },
        ],
        present: { key: 50, value: "a" },
        future: [{ key: 70, value: "d" }],
      };
      expect(getNextKey(history)).toBe(71);
    });

    it("handles empty history (no past or future)", () => {
      const history: HistoryStateInternal<string> = {
        past: [],
        present: { key: 0, value: "a" },
        future: [],
      };
      expect(getNextKey(history)).toBe(1);
    });
  });
});
