import { LoadingText } from "@/components/shared/loading-skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingText text="Loading..." />
    </div>
  );
}
