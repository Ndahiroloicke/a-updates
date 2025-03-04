import type React from "react"
import { validateRequest } from "@/auth"
import Navbar from "./Navbar"
import MiniNav from "../../components/MiniNav"
import SessionProvider from "./SessionProvider"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github } from "lucide-react"
import { LinksSidebar, TrendingTopics } from "@/components/TrendsSidebar";
import { format } from "date-fns";
import Link from "next/link";
import RotatingAdBanner from "@/components/RotatingAdBanner"
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await validateRequest()

  const socialLinks = [
    {
      icon: <Facebook className="h-6 w-6" />,
      href: "https://facebook.com",
      color: "bg-[#1877F2] hover:bg-[#0e63d3] text-white",
    },
    {
      icon: <Twitter className="h-6 w-6" />,
      href: "https://twitter.com",
      color: "bg-black hover:bg-gray-800 text-white",
    },
    {
      icon: <Instagram className="h-6 w-6" />,
      href: "https://instagram.com",
      color: "bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] hover:opacity-90 text-white",
    },
    {
      icon: <Linkedin className="h-6 w-6" />,
      href: "https://linkedin.com",
      color: "bg-[#0A66C2] hover:bg-[#084e96] text-white",
    },
    {
      icon: <Youtube className="h-6 w-6" />,
      href: "https://youtube.com",
      color: "bg-[#FF0000] hover:bg-[#cc0000] text-white",
    },
    {
      icon: <Github className="h-6 w-6" />,
      href: "https://github.com",
      color: "bg-[#181717] hover:bg-[#2c2c2c] text-white dark:bg-[#6e5494] dark:hover:bg-[#5a4578]",
    },
  ]
  const today = format(new Date(), "MM/dd/yyyy")

  // Example ad list - you can replace with your own ads
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
  ]

  return (
    <SessionProvider value={{ user } as any}>
      <div className="flex min-h-screen flex-col">
        <Navbar showAdvert={true} />
        <MiniNav />
        <div className="w-full justify-between flex flex-col md:flex-row gap-8 items-start p-3">
          <div className="flex-1 w-full md:max-w-[70%]">
            <RotatingAdBanner
              ads={ads}
              rotationInterval={5000}
              width={1200}
              height={90}
            />
          </div>
          <div className="flex flex-col space-y-3 items-center w-full md:w-auto">
            <div className="text-center md:text-right space-y-2 w-full">
              {user ? (
                <div className="text-base font-semibold">
                  Username: <span className="text-emerald-500">{user.username}</span>
                </div>
              ) : (
                <Link href={"/login"} className="block w-full md:w-auto rounded-full bg-primary px-10 py-2 font-bold text-center">
                  Login
                </Link>
              )}
              <div className="text-base font-semibold">
                Date: <span className="text-emerald-500">{today}</span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className={`${link.color} p-2 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center shadow-md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${link.href.split("https://")[1].split(".com")[0]} page`}
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto flex w-full grow gap-5 p-5">{children}</div>
      </div>
      <Footer />
    </SessionProvider>
  )
}

