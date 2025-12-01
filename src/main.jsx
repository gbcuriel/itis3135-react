import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from './App.jsx';
import Introduction from './Introduction.jsx';
import Contract from './Contract.jsx';
import IntroPull from './IntroPull.jsx';
import Layout from './Layout.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/Contract" element={<Contract />} />
          <Route path="/Introduction" element={<Introduction />} />
          <Route path="/IntroPull" element={<IntroPull />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);