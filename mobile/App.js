// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { AuthProvider } from './src/context/AuthContext';
// import AppNavigator from './src/navigation/AppNavigator';
// import Loader from './src/components/loaders/Loader';

// import { ToastProvider } from './src/context/ToastContext';

// export default function App() {

//   const [globalLoading, setGlobalLoading] = useState(true);

//   useEffect(() => {
//     setTimeout(() => {
//       setGlobalLoading(false);
//     }, 3000);
//   }, []);

//   if (globalLoading) return <Loader />;

//   return (
//     <SafeAreaProvider>
//       <ToastProvider>
//         <AuthProvider>
//           <NavigationContainer>
//             <AppNavigator />
//             <StatusBar style="dark" />
//           </NavigationContainer>
//         </AuthProvider>
//       </ToastProvider>
//     </SafeAreaProvider>
//   );
// }



import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import Loader from './src/components/loaders/Loader';

import { ToastProvider } from './src/context/ToastContext';

export default function App() {

  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setGlobalLoading(false);
    }, 3000);
  }, []);

  if (globalLoading) return <Loader />;

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="dark" />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
