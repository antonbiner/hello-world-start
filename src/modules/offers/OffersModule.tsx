import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { OffersList } from "./components/OffersList";
import { OfferDetail } from "./components/OfferDetail";
import { AddOffer } from "./pages/AddOffer";
import { EditOffer } from "./pages/EditOffer";
const OfferReportPage = lazy(() => import("./pages/OfferReportPage"));

export function OffersModule() {
  return (
    <Routes>
      <Route index element={<OffersList />} />
      <Route path="add" element={<AddOffer />} />
      <Route path=":id" element={<OfferDetail />} />
      <Route path=":id/edit" element={<EditOffer />} />
      <Route path=":id/report" element={<Suspense fallback={null}><OfferReportPage /></Suspense>} />
    </Routes>
  );
}