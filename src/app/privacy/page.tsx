export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>

        <div className="mt-4 space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>
            Conq collects account information such as email and display name
            to provide marketplace services.
          </p>

          <p>
            Purchase and listing data are stored to enable downloads,
            sales tracking, and platform functionality.
          </p>

          <p>
            Conq does not sell personal data to third parties.
          </p>

          <p>
            Users may delete their account at any time via Settings.
          </p>

          <p>
            Security measures are used to protect user data and files.
          </p>

          <p>
            By using Conq, you consent to this privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}