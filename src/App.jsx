import './App.scss'

import { persistor, store } from './redux/store';

import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from "react-redux";
import { router } from "./routers/router";

function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
        </PersistGate>
      </Provider>
    </>
  )
}

export default App
