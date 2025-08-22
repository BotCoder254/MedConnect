import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
};

export default MainLayout;
