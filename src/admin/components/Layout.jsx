import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';


const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-grey">
      <Navbar />
      <main className="container pt-[60px] pl-0 sm:pl-[232px] mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;