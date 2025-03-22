"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

const PaymentSuccess = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  return (
    <div className="flex flex-col w-full h-screen p-4 text-white">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Payment details</h1>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <p className="text-[#00FF00]">Payment Status</p>
              <p className="text-zinc-50">paid</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <p className="text-[#00FF00]">Subscription End date</p>
              <p className="text-zinc-50">15/03/2023</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <p className="text-[#00FF00]">Date of subscription</p>
              <p className="text-zinc-50">15/02/2023</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <p className="text-[#00FF00]">Fee</p>
              <p className="text-zinc-50">50$</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentSuccess

