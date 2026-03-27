import { Routes, Route } from "react-router-dom";
import SuppliersPage from "./pages/SuppliersPage";
import ContactDetailPage from "./pages/ContactDetailPage";
import AddSupplierPage from "./pages/AddSupplierPage";

export function SuppliersModule() {
  return (
    <Routes>
      <Route index element={<SuppliersPage />} />
      <Route path="add" element={<AddSupplierPage />} />
      <Route path=":id" element={<ContactDetailPage />} />
    </Routes>
  );
}
