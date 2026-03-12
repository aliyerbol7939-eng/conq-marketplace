export default function PrivacyPage() {
  return (
    <div className="page-shell grid-bg">
      <section className="conq-section">
        <div className="container-conq" style={{ maxWidth: 900 }}>
          <div className="glow-card p-8 md:p-10">
            <div className="conq-badge">Legal</div>
            <h1 className="conq-heading-lg mt-5">Privacy Policy</h1>

            <div
              className="conq-text-muted"
              style={{ marginTop: 24, lineHeight: 1.9, fontSize: 16 }}
            >
              <p>
                Conq collects account data such as email, display name, listings,
                purchases, and moderation activity to operate the marketplace.
              </p>

              <p>
                Uploaded files and listing metadata are stored to provide product
                pages, downloads, seller tools, and administration features.
              </p>

              <p>
                Conq does not sell personal data to third parties.
              </p>

              <p>
                Security measures are used to protect files, sessions, and account
                data, including protected download flows and account authentication.
              </p>

              <p>
                Users may update profile information, change passwords, or disable
                their account through Settings.
              </p>

              <p>
                By continuing to use Conq, you agree to this privacy policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}