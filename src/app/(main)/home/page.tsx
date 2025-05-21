import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import AuthenticatedNewsFeed from "@/components/AuthenticatedNewsFeed";
import NewsSidebar from "@/components/NewsSidebar";
import PaymentNotification from "@/components/PaymentNotification";

const ads = [
  {
    id: "1",
    imageSrc: "/myad.webp",
    link: "https://example.com/ad1",
    alt: "Advertisement 1",
  },
  {
    id: "2",
    imageSrc: "/luka.jpg",
    link: "",
    alt: "Special Offer Advertisement",
  },
  {
    id: "3",
    imageSrc: "/ad2.jpg",
    link: "",
    alt: "Limited Time Deal Advertisement",
  },
];

export default async function HomePage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <PaymentNotification />
      <div className="w-full min-w-0 space-y-5">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 order-1">
            <AuthenticatedNewsFeed />
          </div>
          <div className="w-full lg:w-1/3 order-2">
            <NewsSidebar ads={ads} />
          </div>
        </div>
      </div>
    </main>
  );
}
