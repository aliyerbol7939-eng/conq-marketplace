export default function TermsPage() {
  return (
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq" style={{ maxWidth: 900 }}>
          <div className="glow-card p-8 md:p-10">
            <div className="conq-badge">Legal</div>
            <h1 className="conq-heading-lg mt-5">Terms of Service</h1>

            <div
              className="conq-text-muted"
              style={{ marginTop: 24, lineHeight: 1.9, fontSize: 16 }}
            >
              <p>
                Conq is a digital marketplace where creators upload and sell digital
                files. By using Conq, you agree to these terms.
              </p>

              <p>
                Sellers are responsible for the files they upload and must own the
                rights required to distribute and sell their content.
              </p>

              <p>
                Buyers receive access to digital products under the license or usage
                terms defined by the seller and platform rules.
              </p>

              <p>
                Conq may remove listings, disable accounts, or restrict access where
                content is unsafe, misleading, infringing, illegal, or violates
                platform policies.
              </p>

              <p>
                Payments, disputes, refunds, moderation, and download access are
                governed by platform rules and any future payment provider terms.
              </p>

              <p>
                Continued use of Conq means you accept these terms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}