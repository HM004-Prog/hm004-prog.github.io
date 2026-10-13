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
  async function operate(action, value) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', action === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = action === 'set' ? store.put(value, 'current') : action === 'delete' ? store.delete('current') : store.get('current');
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(new Error('Could not save this draft in your browser. Download changes to keep it.'));
      transaction.onabort = transaction.onerror;
    });
  }
  window.PORTFOLIO_DRAFTS = {get:() => operate('get'), set:value => operate('set',value), remove:() => operate('delete')};
})();
