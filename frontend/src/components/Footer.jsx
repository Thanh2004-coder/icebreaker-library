import { QRCodeSVG } from "qrcode.react";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/1oQAkvbTh_DTeJFcvziep0xceAdd1iftBxF8_oY67evs/viewform";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-contact">
          <p className="footer-kicker">Liên hệ</p>
          <ul>
            <li>
              <span>Nhóm thực hiện</span>
              <strong>Thành phố bất ổn</strong>
            </li>
            <li>
              <span>Đại diện nhóm</span>
              <strong>Nguyễn Đăng Nam</strong>
            </li>
            <li>
              <span>Email</span>
              <a href="mailto:ICEBREAKER@gmail.com">ICEBREAKER@gmail.com</a>
            </li>
            <li>
              <span>Kênh liên hệ</span>
              <a href="tel:0862778706">0862778706</a>
            </li>
            <li>
              <span>Giảng viên hướng dẫn</span>
              <strong>Trương Thu Thủy</strong>
            </li>
          </ul>
        </div>

        <div className="footer-qr">
          <p className="footer-kicker">Đánh giá trải nghiệm</p>
          <p className="footer-hint">Quét mã QR để đánh giá trải nghiệm dịch vụ</p>
          <div className="qr-frame">
            <QRCodeSVG
              value={GOOGLE_FORM_URL}
              size={132}
              bgColor="#fffdf8"
              fgColor="#1b4d4a"
              level="M"
              includeMargin
            />
          </div>
          <a className="footer-form-link" href={GOOGLE_FORM_URL} target="_blank" rel="noreferrer">
            Mở form đánh giá
          </a>
        </div>
      </div>
    </footer>
  );
}
