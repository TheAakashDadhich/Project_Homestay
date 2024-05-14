import "../styles/Footer.scss"
import { LocationOn, LocalPhone, Email } from "@mui/icons-material"
const Footer = () => {
  return (
    <div className="footer">
      <div className="footer_left">
        <a href="/"><img src="/assets/logo.png" alt="logo" /></a>
      </div>

      <div className="footer_center">
        <h3>Useful Links</h3>
        <ul>
          <li>About Us</li>
          <li>Terms and Conditions</li>
          <li>Return and Refund Policy</li>
        </ul>
      </div>

      <div className="footer_right">
        <h3>By Team AG1002</h3>
        <div className="footer_right_info">
          <LocalPhone />
          <p>01482222166</p>
        </div>
        <div className="footer_right_info">
          <Email />
          <p>Drmnstsupprt@gmail.com</p>
        </div>
        <div className="footer_right_info">
          <LocationOn />
          <p>India</p>
        </div>
        <img src="/assets/payment.png" alt="payment" />
      </div>
    </div>
  )
}

export default Footer