import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { IntroScreen } from "@/components/IntroScreen";
import Home from "@/pages/Home";
import HomeV2 from "@/pages/v2/HomeV2";
import Shop from "@/pages/Shop";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import ProductDetails from "@/pages/ProductDetails";
import Checkout from "@/pages/Checkout";
import PaymentResult from "@/pages/PaymentResult";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "@/context/CartContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/v2" component={HomeV2} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-result" component={PaymentResult} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const [showIntro, setShowIntro] = useState(location === "/");
  const isV2 = location.startsWith("/v2");

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="relative min-h-screen text-foreground selection:bg-[#5A3F73] selection:text-white">
          <AnimatePresence>
            {showIntro ? (
              <IntroScreen key="intro" onEnter={() => setShowIntro(false)} />
            ) : (
              <div key="content" className="relative z-10 transition-opacity duration-1000">
                {!isV2 && location !== "/checkout" && location !== "/payment-result" && <Navbar />}
                <Router />
              </div>
            )}
          </AnimatePresence>
          
          <Toaster />
        </div>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
