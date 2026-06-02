import React, { useState, useEffect } from 'react'
import './GlobalStyles.css'
import AddProduct from './AddProduct.jsx';
import EditProduct from './EditProduct.jsx';
import ReactDOM from 'react-dom/client'
import Sidebar from './Sidebar.jsx'
import DeliveryForm from './DeliveryDetails.jsx'
import ReceivedDetails from './RecievedDetails.jsx'
import AddCustomer from './AddCustomer.jsx'
import EditCustomer from './EditCustomer.jsx'
import GenerateBill from './GenerateBill.jsx'
import SearchCylinder from './SearchCylinder.jsx'
import ViewCustomer from './ViewCustomer.jsx'
import ViewDC from './ViewDC.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import { supabase, hasSupabaseConfig } from './supabaseClient.js'


function App() {
  const [currentPage, setCurrentPage] = useState('delivery');
  const [authPage, setAuthPage] = useState('login'); // 'login', 'signup', or 'forgot'
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [fatalError, setFatalError] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    if (!hasSupabaseConfig) {
      setFatalError(
        'Supabase configuration is missing. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild.'
      );
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          fetchUserProfile(session.user.id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Supabase session error:', error);
        setAuthError(error?.message || 'Failed to initialize authentication.');
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        setUserName(data.name);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserName('');
    setCurrentPage('delivery');
  };

  // Show fatal config or auth errors before any application content
  if (fatalError) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <h1>Configuration Error</h1>
          <p>{fatalError}</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <h1>Authentication Error</h1>
          <p>{authError}</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Show auth pages if not authenticated
  if (!session) {
    if (authPage === 'login') {
      return <Login onNavigate={setAuthPage} />;
    } else if (authPage === 'signup') {
      return <Signup onNavigate={setAuthPage} />;
    } else if (authPage === 'forgot') {
      return <ForgotPassword onNavigate={setAuthPage} />;
    }
  }

  const handleNav = (page) => setCurrentPage(page);

  const renderContent = () => {
    switch(currentPage) {
      case 'delivery':
        return <DeliveryForm onNavigate={setCurrentPage} />;
      case 'received':
        return <ReceivedDetails onNavigate={setCurrentPage} />;
      case 'searchCylinder':
        return <SearchCylinder onNavigate={setCurrentPage} />;
      case 'addCustomer':
        return <AddCustomer />;
      case 'editCustomer':
        return <EditCustomer />;
      case 'viewCustomer':
        return <ViewCustomer onNavigate={setCurrentPage} />;
      case 'generateBill':
        return <GenerateBill onNavigate={setCurrentPage} />;
      case 'viewDC':
        return <ViewDC onNavigate={setCurrentPage} />;
      case 'addProduct':
        return <AddProduct />;
      case 'editProduct':
        return <EditProduct />;
      default:
        return <DeliveryForm onNavigate={setCurrentPage} />;
    }
  }

  // Main app (authenticated)
  return (
    <React.StrictMode>
      <div className="app-container">
        <Sidebar 
          activeView={currentPage} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          userName={userName}
          userPhone={session?.user?.phone}
        />
        <div className="app-content">
          <div className="app-content-inner">
            {renderContent()}
          </div>
        </div>
      </div>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
