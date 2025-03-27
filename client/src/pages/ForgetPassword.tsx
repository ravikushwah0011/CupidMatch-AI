import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [ , navigate ] = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
        window.history.back();  // ✅ Works like navigate(-1)
      } else {
        navigate("/");  // ✅ If no history, go to home page
      }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('page_note_found.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <Card className="relative w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              Page Under Construction
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            This page is currently under construction. Please check back later.
          </p>

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