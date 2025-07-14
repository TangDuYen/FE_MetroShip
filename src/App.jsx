import './App.scss'
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import { persistor, store } from './redux/store';

import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from "react-redux";
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { router } from "./routers/router";

function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={<div className="loading">Đang tải dữ liệu...</div>} persistor={persistor}>
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3000} />
        </PersistGate>
      </Provider>
    </>
  )
}

export default App
