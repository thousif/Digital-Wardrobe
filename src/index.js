import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import moment from 'moment';
import 'antd/dist/antd.css';
import Wardrobe from './scenes/wardrobe';
import store from "./store";
import Day from './scenes/day';
import { Router, Route, Link,IndexRoute, browserHistory, hashHistory } from "react-router";

ReactDOM.render(
		<Provider store={store}>
			<Router history={hashHistory}>
				<Route path='/' component={Wardrobe}></Route>
				<Route path='/week/:day' component={Day}></Route>
			</Router>
		</Provider>
	,document.getElementById('app'));

module.hot.accept();