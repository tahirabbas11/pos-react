import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // Assuming App handles routing and main layout
import { Provider } from 'react-redux';
import store from './redux/store';
import CalculatorWidget from './components/Calculator/CalculatorWidget'; // Adjusted path as needed

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
    <CalculatorWidget /> {/* Moved outside of App */}
  </Provider>
);
