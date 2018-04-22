import promise from "redux-promise-middleware"
import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import reducer from "./reducers"

const middleware = applyMiddleware(promise(),thunk);

export default createStore(reducer)
