import { Routes, Route } from "react-router-dom";
import { ShopProvider } from "@/lib/store";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductPage from "@/pages/ProductPage";
import Checkout from "@/pages/Checkout";
import { Account, Favorites } from "@/pages/AccountPages";
import { About, Contact, NotFound } from "@/pages/InfoPages";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <ShopProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Catalog />} />
          <Route path="/produto/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/conta" element={<Account />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ShopProvider>
  );
}
