import { Route, Routes } from "react-router-dom";

import { RoutePaths } from "./RoutePaths.jsx";
import { Home } from "../home/Home.jsx";
import { NotFound } from "./NotFound.jsx";
import { Layout } from "./Layout.jsx";
import ParkingLotPage from "../components/Parking/ParkingLotPage";
import VehicleInfo from "../components/Vehicle/VehicleInfo.jsx";
import ConfirmPayment from "../components/Payment/ConfirmPayment.jsx";
import WalkinParkingView from "../components/Parking/WalkinParkingView.jsx";

export const Router = () => (
  <Routes>
    <Route path={RoutePaths.HOME} element={<Layout> <Home /> </Layout>} />
    <Route path={RoutePaths.RESULTS} element={<Layout> <ParkingLotPage /> </Layout>} />
    <Route path={RoutePaths.VEHICLE} element={<Layout> <VehicleInfo /> </Layout>} />
    <Route path={RoutePaths.PAYMENT} element={<Layout> <ConfirmPayment /> </Layout>} />
    <Route path={RoutePaths.WALKIN} element={<Layout> <WalkinParkingView /> </Layout>} />
    <Route
      path="*"
      element={
        <Layout>
          <NotFound />
        </Layout>
      }
    />
  </Routes>
);
