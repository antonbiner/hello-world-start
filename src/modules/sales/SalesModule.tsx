import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { SalesList } from "./components/SalesList";
import { SaleDetail } from "./components/SaleDetail";
import { AddSale } from "./pages/AddSale";
import { EditSale } from "./pages/EditSale";
const SaleReportPage = lazy(() => import("./pages/SaleReportPage"));

export function SalesModule() {
  return (
    <Routes>
      <Route index element={<SalesList />} />
      <Route path="add" element={<AddSale />} />
      <Route path=":id" element={<SaleDetail />} />
      <Route path=":id/edit" element={<EditSale />} />
      <Route path=":id/report" element={<Suspense fallback={null}><SaleReportPage /></Suspense>} />
    </Routes>
  );
}