import { Button, EmptyState } from "../components/ui";
import { usePageMeta } from "../lib/utils";

export default function NotFound() {
  usePageMeta("Page not found | CarePoint");
  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-display text-[64px] font-semibold leading-none text-pine-4">404</p>
        <EmptyState
          icon="heartPulse"
          title="We couldn't find that page"
          body="The page may have moved, or the link is out of date. The care you're looking for is still close by — try one of these instead."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button to="/search" icon="search">
                Search for care
              </Button>
              <Button to="/specialties" variant="outline">
                Browse specialties
              </Button>
              <Button to="/" variant="ghost">
                Return home
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
