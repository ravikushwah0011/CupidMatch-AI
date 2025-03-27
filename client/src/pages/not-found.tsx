import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back(); // ✅ Works like navigate(-1)
    } else {
      navigate("/"); // ✅ If no history, go to home page
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 Page Not Found
            </h1>
          </div>
          <p className="text-lg text-gray-700">
            Oops! 😅 The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-600 mt-2">
            This might have happened because:
          </p>
          <ul className="list-disc list-inside text-gray-500 mt-2">
            <li>The link you followed is incorrect or outdated.</li>
            <li>The page was moved or deleted.</li>
            <li>There was a typo in the URL.</li>
          </ul>
          {/* <p className="mt-4 text-sm text-gray-600">
            Developer forget to add the page to the router 😅!
          </p> */}
          <Button
            onClick={handleGoBack}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
