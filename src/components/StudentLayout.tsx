import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';

const StudentLayout: React.FC = () => (
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
);

export default StudentLayout; 