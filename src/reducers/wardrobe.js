import { FETCH_ALL_FILES,   
         FETCH_ALL_FILES_FULFILLED,   
         FETCH_ALL_FILES_REJECTED,
        } from "../actions/wardrobe"
export default function reducer(state={
    allFiles : []
  }, action) {
    switch (action.type) {
      case FETCH_ALL_FILES_FULFILLED : {
        console.log(action.payload);
        return {
          ...state,
          allFiles : action.payload
        }
      }
      case FETCH_ALL_FILES_REJECTED : {
        console.log(action.payload);
        return state
      }
    }
    return state
}
