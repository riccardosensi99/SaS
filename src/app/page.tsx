import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">IT Ops Automation</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
        Automate your IT operations with visual workflows. Onboarding, provisioning,
        maintenance, and more — all in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/workflows"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          View Workflows
        </Link>
      </div>
    </div>
  );
}
