import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './general/Router.jsx';
import { Loading } from './components/Loading.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';

export const PageWithHeader = ({ children }) => (
  <div className="flex h-full flex-col">{children}</div>
);

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Suspense
        fallback={
          <PageWithHeader>
            <Loading name="suspense" />
          </PageWithHeader>
        }
      >
        <div className="h-full bg-indigo-50">
          <Router />
        </div>
      </Suspense>
    </AuthProvider>
  </BrowserRouter>
);
