/**
 * Soft status banner when showing cached/fallback data while reconnecting.
 */
export default function SoftStatusBanner({ show, children }) {
  if (!show) return null;
  return (
    <p className="soft-status-banner" role="status">
      {children || "Đang hiển thị dữ liệu tạm thời — đang kết nối lại máy chủ."}
    </p>
  );
}
