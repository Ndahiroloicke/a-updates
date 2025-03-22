import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Search",
};

interface PageProps {
  searchParams: { q: string };
}

export default function Page({ searchParams }: PageProps) {
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <SearchResults query={searchParams.q} />
      </div>
      <div className="hidden w-80 lg:block">
        <TrendsSidebar />
      </div>
    </div>
  );
}
