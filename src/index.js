import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import 'antd/dist/antd.css';
import Wardrobe from './scenes/wardrobe';
import Day from './scenes/day';
import { Router, Route, Link,IndexRoute, browserHistory, hashHistory } from "react-router";

ReactDOM.render(
		<Router history={hashHistory}>
			<Route path='/' component={Wardrobe}></Route>
			<Route path='/week/:day' component={Day}></Route>
		</Router>
	,document.getElementById('app'));

module.hot.accept();