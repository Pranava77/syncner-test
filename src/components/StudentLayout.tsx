import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';
import { Outlet } from 'react-router-dom';

const StudentLayout: React.FC = () => (
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
);

export default StudentLayout; 