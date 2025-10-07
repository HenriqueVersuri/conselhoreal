
import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Role } from './types';
import { Header, Footer, ProtectedRoute } from './components';
import { HomePage, AgendaPage, PedidosPage, DoacoesPage, SobrePage, LoginPage, DashboardPage, AdminDashboardPage, GalleryPage } from './pages';

const AppLayout = () => (
  <div className="flex flex-col min-h-screen bg-[#0B0B0B] text-[#FFF8E1]">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/doacoes" element={<DoacoesPage />} />
          <Route path="/sobre" element={<SobrePage />} />
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route 
            path="/membros/dashboard"
            element={
              <ProtectedRoute allowedRoles={[Role.MEMBRO, Role.ADM]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/adm/dashboard"
            element={
              <ProtectedRoute allowedRoles={[Role.ADM]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
