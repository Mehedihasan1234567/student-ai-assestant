import Link from "next/link";
import { Button } from "@/components/ui/button";
import StudymateLogo from "@/components/icons/studymate-logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto text-center">
        <StudymateLogo className="w-auto h-24 mx-auto" />
        <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
          Your Personal AI Study Assistant
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          Upload your notes, get instant summaries, and generate quizzes to
          master your subjects.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
