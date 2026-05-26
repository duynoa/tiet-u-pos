"use client"

import { forwardRef } from "react"

interface BillItem {
  id: number
  name: string
  quantity: number
  price: number
  sku?: string
}

interface BranchInfo {
  label: string
  address: string
  phone: string
}

interface BillPrintProps {
  orderId?: string
  items: BillItem[]
  totalPrice: number
  customerName?: string
  customerPhone?: string
  storeName?: string
  branches?: BranchInfo[]
  hotlines?: string[]
  cashierName?: string
  orderDate?: string
  footerMessage?: string
  zaloOaImage?: string
}

const DEFAULT_STORE_NAME = "Tiệm Bánh Tiết Ú"
const DEFAULT_BRANCHES: BranchInfo[] = [
  { label: "CN1", address: "70 Tôn Đức Thắng, KP. Phước Hải, P. Long Thành", phone: "0902.092.052" },
  { label: "CN2", address: "391 Lý Thái Tổ, KP. Phước Hoà, P. Nhơn Trạch", phone: "0983.092.052" },
]
const DEFAULT_HOTLINES = ["0902.092.052", "0983.092.052"]

const BillPrint = forwardRef<HTMLDivElement, BillPrintProps>(({
  items,
  totalPrice,
  customerName,
  customerPhone,
  storeName = DEFAULT_STORE_NAME,
  branches = DEFAULT_BRANCHES,
  hotlines = DEFAULT_HOTLINES,
  orderDate,
  zaloOaImage,
}, ref) => {
  const now = orderDate ?? (() => {
    const d = new Date()
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    const ss = String(d.getSeconds()).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const mo = String(d.getMonth() + 1).padStart(2, "0")
    const yy = d.getFullYear()
    return `${hh}:${mm}:${ss} ${dd}/${mo}/${yy}`
  })()

  const qrDataUrl = zaloOaImage ?? ""

  return (
    <div ref={ref} style={styles.container}>
      {/* ===== LOGO ===== */}
      <div style={styles.logoArea}>
        <img src="/logo-2.webp" alt="Tiết Ú" width={100} height={68} style={{ objectFit: "contain" }} />
      </div>

      <div style={styles.storeRow}>
        <div style={styles.qrWrap}>
          <img src={qrDataUrl} alt="Zalo OA" width={56} height={56} style={{ objectFit: "contain" }} />
        </div>
        <div style={styles.storeInfo}>
          <p style={styles.storeName}>{storeName}</p>
          {branches.map((b) => (
            <p key={b.label} style={styles.branchLine}>
              <strong>{b.label}:</strong> {b.address} ({b.phone})
            </p>
          ))}
        </div>
      </div>

      <div style={styles.dividerSolid} />

      <p style={styles.title}>HÓA ĐƠN THANH TOÁN</p>

      {(customerName || customerPhone) && (
        <div style={styles.customerRow}>
          {customerName && <span>Tên KH: {customerName}</span>}
          {customerPhone && <span style={{ marginLeft: "16px" }}>SĐT: {customerPhone}</span>}
        </div>
      )}

      <div style={styles.dividerSolid} />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, ...styles.colStt }}>STT</th>
            <th style={{ ...styles.th, ...styles.colName }}>Mặt hàng</th>
            <th style={{ ...styles.th, ...styles.colQty }}>Số lượng</th>
            <th style={{ ...styles.th, ...styles.colPrice }}>Giá tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id}>
              <td style={{ ...styles.td, ...styles.colStt, paddingTop: idx === 0 ? "12px" : undefined }}>{idx + 1}</td>
              <td style={{ ...styles.td, ...styles.colName, paddingTop: idx === 0 ? "12px" : undefined }}>
                <div style={styles.itemNameText}>{item.name}</div>
                {item.sku && <div style={styles.itemSku}>{item.sku}</div>}
              </td>
              <td style={{ ...styles.td, ...styles.colQty, paddingTop: idx === 0 ? "12px" : undefined }}>{item.quantity}</td>
              <td style={{ ...styles.td, ...styles.colPrice, paddingTop: idx === 0 ? "12px" : undefined }}>
                {(item.price * item.quantity).toLocaleString("vi-VN")}đ
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.dividerDashed} />

      <div style={styles.totalBlock}>
        <div style={styles.totalRow}>
          <span>Thành tiền</span>
          <span style={styles.totalPrice}>{totalPrice.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      <div style={styles.dividerSolid} />

      <p style={styles.datetime}>{now}</p>

      <div style={styles.footer}>
        <p style={styles.footerGreeting}>Xin chào bạn!</p>
        <div style={styles.footerText}>
          {"Nếu bạn có bất kỳ thắc mắc nào về sản phẩm của "}
          <strong>Tiết Ú</strong>
          {". Vui lòng liên hệ trực tiếp với "}
          <strong>bộ phận Chăm sóc Khách hàng</strong>
          {" của "}
          <strong>Tiết Ú</strong>
          {" để được hỗ trợ nhanh chóng và tận tình. "}
          <strong>Tiết Ú luôn sẵn sàng lắng nghe và giải quyết vấn đề cho bạn.</strong>
          {"\n"}Cảm ơn bạn đã tin tưởng và ủng hộ Tiết Ú
        </div>
        <p style={styles.hotline}>Hotline: {hotlines.join(" - ")}</p>
      </div>
    </div>
  )
})

BillPrint.displayName = "BillPrint"

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "76mm",
    padding: "8px 8px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    color: "#000",
    backgroundColor: "#fff",
    boxSizing: "border-box" as const,
  },

  /* Logo */
  logoArea: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "8px",
  },

  /* Store row */
  storeRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    // marginBottom: "12px",
  },
  qrWrap: {
    flexShrink: 0,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    margin: "0 0 2px 0",
    fontSize: "12px",
    fontWeight: "600",
  },
  branchLine: {
    margin: "4px 0",
    fontSize: "10px",
    lineHeight: "1.3",
  },

  /* Dividers */
  dividerSolid: {
    borderTop: "1px solid #000",
    margin: "12px 0",
  },
  dividerDashed: {
    borderTop: "1px dashed #000",
    margin: "12px 0",
  },

  /* Title */
  title: {
    textAlign: "center" as const,
    fontWeight: "600",
    fontSize: "14px",
    margin: "4px 0",
    letterSpacing: "0.5px",
  },

  /* Customer */
  customerRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center" as const,
    fontSize: "10px",
    margin: "3px 0",
  },

  /* Table */
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "10px",
  },
  th: {
    fontWeight: "600",
    padding: "0 0 12px",
    borderBottom: "1px solid #555",
    textAlign: "left" as const,
    verticalAlign: "bottom" as const,
  },
  td: {
    padding: "3px 2px",
    verticalAlign: "top" as const,
  },
  colStt: {
    width: "10%",
    textAlign: "center" as const,
  },
  colName: {
    width: "48%",
  },
  colQty: {
    width: "16%",
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
  },
  colPrice: {
    width: "26%",
    textAlign: "right" as const,
  },
  itemNameText: {
    fontWeight: "500",
    fontSize: "10px",
    lineHeight: "1.3",
  },
  itemSku: {
    fontSize: "8px",
    color: "#000",
    fontStyle: "italic" as const,
  },

  /* Totals */
  totalBlock: {
    marginBottom: "4px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    fontWeight: "500",
    margin: "12px 0",
  },
  totalPrice: {
    fontSize: "12px",
    fontWeight: "700",
  },
  grandTotalRow: {
    fontWeight: "500",
    fontSize: "10px",
    marginTop: "4px",
  },

  /* Date */
  datetime: {
    textAlign: "center" as const,
    fontSize: "12px",
    margin: "4px 0",
  },
  cashierRow: {
    textAlign: "center" as const,
    fontSize: "10px",
    margin: "2px 0",
  },

  /* Footer */
  footer: {
    marginTop: "4px",
    textAlign: "center" as const,
  },
  footerGreeting: {
    fontWeight: "bold",
    fontSize: "12px",
    fontStyle: "italic" as const,
    margin: "4px 0",
  },
  footerText: {
    fontSize: "12px",
    lineHeight: "1.4",
    margin: "2px 0",
    textAlign: "center" as const,
    whiteSpace: "pre-line" as const,
    fontFamily: "'Inter', sans-serif",
  },
  hotline: {
    fontWeight: "bold",
    fontSize: "12px",
    fontStyle: "italic" as const,
    margin: "4px 0 2px",
  },
}

export default BillPrint
