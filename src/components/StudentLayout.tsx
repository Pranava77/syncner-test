import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';
import { Outlet } from 'react-router-dom';
import { KeepAlive } from 'react-activation';

const StudentLayout: React.FC = () => (
  <ProtectedRoute>
    <Layout>
      <KeepAlive id="student-pages">
        <Outlet />
      </KeepAlive>
    </Layout>
  </ProtectedRoute>
);

export default StudentLayout; 