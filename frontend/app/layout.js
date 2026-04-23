import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import './globals.css';

export const metadata = {
  title: 'GrocerEase - Premium Organic Goods',
  description: 'Your one stop shop for grocery delivery, managed by powerful backend Node architecture.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* We instantly wrap the entire React App in our AuthProvider. 
            Now, every single file has instantaneous access to whether we are an Admin or a Customer! */}
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main className="page-container">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
