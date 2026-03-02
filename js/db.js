'use strict';

/* ================================================================
   LEATHR — Database Layer (IndexedDB)
   ================================================================ */

    const DB_NAME    = 'LeathrDB';
    const DB_VERSION = 2;  // bumped to add settings store
    let db = null;

    function initDB() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('orders')) {
            const os = db.createObjectStore('orders', { keyPath: 'orderId' });
            os.createIndex('by_status',    'status',        { unique: false });
            os.createIndex('by_createdAt', 'createdAt',     { unique: false });
            os.createIndex('by_paymentId', 'paymentId',     { unique: false });
            os.createIndex('by_customer',  'customerEmail', { unique: false });
          }
          if (!db.objectStoreNames.contains('payments')) {
            const ps = db.createObjectStore('payments', { keyPath: 'paymentId' });
            ps.createIndex('by_orderId',  'orderId',   { unique: false });
            ps.createIndex('by_method',   'method',    { unique: false });
            ps.createIndex('by_status',   'status',    { unique: false });
            ps.createIndex('by_createdAt','createdAt', { unique: false });
          }
          /* ── settings store (key-value) ── */
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        };
        req.onsuccess = (e) => { db = e.target.result; resolve(db); };
        req.onerror   = (e) => reject(e.target.error);
      });
    }

    function dbPut(storeName, record) {
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).put(record);
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
      });
    }
    function dbGetAll(storeName) {
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
      });
    }
    function dbClear(storeName) {
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).clear();
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
      });
    }
    function dbGet(storeName, key) {
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
      });
    }
    async function saveOrderAndPayment(orderData, paymentData) {
      await dbPut('orders',   orderData);
      await dbPut('payments', paymentData);
    }
