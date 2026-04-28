import { lazy } from "react";
import { Switch, Route } from "wouter";
import Home from "@/pages/Home";

const Shop = lazy(() => import("@/pages/Shop"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const PaymentGateway = lazy(() => import("@/pages/PaymentGateway"));
const PaymentResult = lazy(() => import("@/pages/PaymentResult"));

export function BrowserRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/categoria/:slug" component={CategoryPage} />
      <Route path="/producto/:slug" component={ProductDetails} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-gateway" component={PaymentGateway} />
      <Route path="/payment-result" component={PaymentResult} />
      <Route component={NotFound} />
    </Switch>
  );
}
