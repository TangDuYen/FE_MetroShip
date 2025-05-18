import './App.scss'

import { persistor, store } from './redux/store';

import Login from './pages/login/Login';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from "react-redux";
import { RouterProvider } from 'react-router-dom';
import { router } from "./routers/router";

function App() {
  return (
    <>
    <Login />
      {/* <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
        </PersistGate>
      </Provider> */}
    </>
  )
}

export default App
