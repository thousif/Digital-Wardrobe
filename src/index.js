import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import 'antd/dist/antd.css';
import App from './app'

ReactDOM.render(<App />,document.getElementById('app'));

module.hot.accept();