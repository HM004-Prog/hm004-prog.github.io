'use strict';
(() => {
  let database;
  function open() {
    if (!database) database = new Promise((resolve, reject) => {
      const request = indexedDB.open('magan-portfolio-editor', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('drafts');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Browser draft storage is unavailable. You can still download your changes.'));
    });
    return database;
  }
  async function operate(action, value, key = 'current') {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', action === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = action === 'set' ? store.put(value, key) : action === 'delete' ? store.delete(key) : store.get(key);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(new Error('Could not save this draft in your browser. Download changes to keep it.'));
      transaction.onabort = transaction.onerror;
    });
  }
  window.PORTFOLIO_DRAFTS = {get:() => operate('get'), set:value => operate('set',value), remove:() => operate('delete')};
  // Only encrypted ciphertext belongs in this record; never store a plain token.
  window.PORTFOLIO_VAULT = {get:() => operate('get',undefined,'publishing-connection'),set:value => operate('set',value,'publishing-connection'),remove:() => operate('delete',undefined,'publishing-connection')};
})();
