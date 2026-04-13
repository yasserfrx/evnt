/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Scanner from './pages/Scanner';
import CheckGuest from './pages/CheckGuest';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/staff/scanner" element={<Scanner />} />
        <Route path="/staff/check-guest/:id" element={<CheckGuest />} />
        <Route path="/" element={<Navigate to="/staff/scanner" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
