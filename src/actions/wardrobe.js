export const FETCH_ALL_FILES = "FETCH_ALL_FILES";
export const FETCH_ALL_FILES_FULFILLED = "FETCH_ALL_FILES_FULFILLED";
export const FETCH_ALL_FILES_REJECTED = "FETCH_ALL_FILES_REJECTED";

export function fetchAllFiles() {
  return function(dispatch) {
    // dispatch({type:"FETCH_ALL_FILES"})
    
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      let err = {
        message : 'Your browser does not support this feature. please update to access.'
      }
      dispatch({type: FETCH_ALL_FILES_REJECTED });
      return;
    }
    
    console.log('here');

    const open = indexedDB.open('myDatabase', 5);

    open.onupgradeneeded = function() {
        var db = open.result;
        var store = db.createObjectStore("wardrobe5", {keyPath: "id"});
        store.createIndex("days" , "days" , {unique : false,multiEntry : true});
        store.createIndex("id","id",{ unique : true });
    };

    open.onerror = (err) => {
      // dispatch({type: FETCH_ALL_FILES_REJECTED, payload : err });
    }

    open.onsuccess = () => {
      var db = open.result;
      var tx = db.transaction("wardrobe5", "readwrite");
      var store = tx.objectStore("wardrobe5");
      var index = store.index("id");
      
      var getAll = index.getAll();
     
      getAll.onsuccess = function() {
        // dispatch({type : FETCH_ALL_FILES_FULFILLED, payload : getAll.result });
      }

      getAll.onerror = function() {
        // dispatch({type: FETCH_ALL_FILES_REJECTED, payload : getAll.error });
      }

      // closing db connection
      tx.oncomplete = function() {
          db.close();
      };
    }
  }
}
