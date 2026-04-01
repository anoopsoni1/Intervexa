import { Skeleton } from "./Skeleton.jsx";

/**
 * Shown while lazy route chunks load (Suspense) or as a generic page placeholder.
 */
export default function RoutePageSkeleton() {
  return (
    <div className="min-h-[60vh] w-full px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48 sm:w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <div className="grid gap-4 pt-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
