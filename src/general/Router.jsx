import { Route, Routes } from "react-router-dom";

import { RoutePaths } from "./RoutePaths.jsx";
import { Home } from "../home/Home.jsx";
import { NotFound } from "./NotFound.jsx";
import { Layout } from "./Layout.jsx";
import ParkingLotPage from "../components/Parking/ParkingLotPage";
import VehicleInfo from "../components/Vehicle/VehicleInfo.jsx";
import ConfirmPayment from "../components/Payment/ConfirmPayment.jsx";
import WalkinParkingView from "../components/Parking/WalkinParkingView.jsx";
import CreateParkingLot from "../components/admin/CreateParkingLot.jsx";
import LoginPage from "../pages/Login/Login.jsx";
import RegistrationPage from "../pages/Register/Register.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import ViewBookings from "../components/Bookings/ViewBookings.jsx";
import AdminParkingPage from "../components/admin/AdminParkingPage.jsx";

export const Router = () => (
  <Routes>

    <Route
      path={RoutePaths.HOME}
      element={
        <PrivateRoute>
          <Layout><Home /></Layout>
        </PrivateRoute>
      }
    />
    <Route
      path={RoutePaths.ADMIN}
      element={
        <PrivateRoute>
          <Layout><AdminParkingPage /></Layout>
        </PrivateRoute>
      }
    />

    {/* <Route path={RoutePaths.HOME} element={<Layout> <Home /> </Layout>} /> */}
    <Route path={RoutePaths.RESULTS} element={<Layout> <ParkingLotPage /> </Layout>} />
    <Route path={RoutePaths.VEHICLE} element={<Layout> <VehicleInfo /> </Layout>} />
    <Route path={RoutePaths.PAYMENT} element={<Layout> <ConfirmPayment /> </Layout>} />
    <Route path={RoutePaths.WALKIN} element={<Layout> <WalkinParkingView /> </Layout>} />
    <Route path={RoutePaths.CREATEPARKINGLOT} element={<Layout> <CreateParkingLot /> </Layout>} />
    <Route path={RoutePaths.LOGIN} element={<Layout><LoginPage /></Layout>} />
    <Route path={RoutePaths.REGISTER} element={<Layout><RegistrationPage /></Layout>} />
    <Route path={RoutePaths.BOOKINGS} element={<Layout><ViewBookings /></Layout>} />
    {/* <Route path={RoutePaths.ADMIN} element={<Layout><AdminParkingPage /></Layout>} /> */}
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
