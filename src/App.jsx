import { BrowserRouter, Route, Routes } from "react-router-dom"
import Body from "./components/Body"
import Login from "./components/Login"
import Profile from "./components/Profile"
import { Provider } from "react-redux"
import appStore from "./utils/appStore"
import Feed from "./components/Feed"
import Connections from "./components/Connections"
import Requests from "./components/Requests"
import Premium from "./components/Premium"
import PrivacyPolicy from "./components/policy/PrivacyPolicy"
import TermsAndCondition from "./components/policy/TermsAndCondition"
import CancellationAndRefund from "./components/policy/CancellationAndRefund"
import ShippingAndDelivery from "./components/policy/ShippingAndDelivery"
import ContactUs from "./components/policy/ContactUs"

function App() {
  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Feed />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />}/>
              <Route path="/terms" element={<TermsAndCondition />} />
              <Route path="/cancellation" element={<CancellationAndRefund />} />
              <Route path="/shipping" element={<ShippingAndDelivery />} />
              <Route path="/contact" element={<ContactUs />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App
