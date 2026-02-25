import { openDB, IDBPDatabase } from "idb";
import { HistoryState } from "./history-equality-checker";

const DB_NAME = "rpa-flow-history-db";
const STORE_NAME = "history-snapshots";

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Handles all asynchronous read and write operations to IndexedDB.
 * Partitions data using a sessionId to isolate history between different flows and versions.
 */
export const HistoryDB = {
  /**
   * Initializes the IndexedDB database and object store.
   * @returns {Promise<IDBPDatabase>} The initialized database instance
   */
  init: (): Promise<IDBPDatabase> => {
    if (!dbPromise) {
      dbPromise = openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      });
    }
    return dbPromise;
  },

  /**
   * Saves a new state snapshot to the database specific to the current session.
   * @param {string} sessionId - The unique identifier for the current flow and version
   * @param {number} step - The index of the history step
   * @param {HistoryState} state - The flow state to save
   */
  async saveSnapshot(
    sessionId: string,
    step: number,
    state: HistoryState,
  ): Promise<void> {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Clear out any "future" states for THIS specific session
    const keys = await store.getAllKeys();
    for (const key of keys) {
      const keyStr = key as string;
      if (keyStr.startsWith(`${sessionId}___`)) {
        const keyStep = parseInt(keyStr.split("___")[1], 10);
        if (keyStep >= step) {
          store.delete(key);
        }
      }
    }

    // Cap history at 100 steps per session to save disk space
    if (step >= 100) {
      const oldKey = `${sessionId}___${step - 100}`;
      store.delete(oldKey);
    }

    // Save with the composite key
    await store.put(state, `${sessionId}___${step}`);
    await tx.done;
  },

  /**
   * Retrieves a specific state snapshot from the database for the current session.
   * @param {string} sessionId - The unique identifier for the current flow and version
   * @param {number} step - The index of the history step to retrieve
   * @returns {Promise<HistoryState | undefined>} The requested state snapshot
   */
  async getSnapshot(
    sessionId: string,
    step: number,
  ): Promise<HistoryState | undefined> {
    const db = await this.init();
    return db.get(STORE_NAME, `${sessionId}___${step}`);
  },

  /**
   * Clears all history snapshots for a specific session.
   * @param {string} sessionId - The unique identifier for the current flow and version
   */
  async clearSession(sessionId: string): Promise<void> {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const keys = await store.getAllKeys();

    for (const key of keys) {
      if ((key as string).startsWith(`${sessionId}___`)) {
        store.delete(key);
      }
    }
    await tx.done;
  },
};
