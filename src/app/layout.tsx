import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}

        <footer
          style={{
            borderTop: "1px solid rgba(127,255,212,0.08)",
            background:
              "linear-gradient(to top, rgba(4,10,9,0.96), rgba(5,13,11,0.92))",
            marginTop: 48,
          }}
        >
          <div className="container-conq">
            <div
              style={{
                minHeight: 96,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 9999,
                    background:
                      "linear-gradient(135deg, var(--brand), var(--accent))",
                    boxShadow: "0 0 18px rgba(127,255,212,0.38)",
                  }}
                />
                <span className="conq-text-muted">
                  © {new Date().getFullYear()} Conq
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  flexWrap: "wrap",
                }}
              >
                <a href="/terms" className="conq-text-muted">
                  Terms
                </a>
                <a href="/privacy" className="conq-text-muted">
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}