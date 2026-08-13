import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="hero">
      <div className="hero-inner">
        <p className="eyebrow-light">Thư viện icebreaker</p>
        <Link to="/" className="brand-title">
          Game Warm-up
        </Link>
        <p className="tagline">Thư viện trò chơi làm quen và khởi động cho nhóm</p>
      </div>
    </header>
  );
}
