"use client"

import { useState } from "react"
import { Check, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type PollOption = {
  id: string
  text: string
  votes: number
}

interface PollProps {
  question: string
  options: PollOption[]
  userVoted: string | null
  onVote?: (optionId: string) => void
  className?: string
}

export default function Poll({ question, options, userVoted, onVote, className }: PollProps) {
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)

  const handleVote = (optionId: string) => {
    if (userVoted || !onVote) return
    onVote(optionId)
  }

  return (
    <div className={cn("w-full bg-white rounded-lg p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{question}</h3>
      <div className="space-y-4">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          const isSelected = option.id === userVoted

          return (
            <button
              key={option.id}
              className={cn(
                "w-full p-4 rounded-lg border border-gray-200 transition-colors",
                "hover:bg-emerald-50",
                "bg-white",
                isSelected && "border-emerald-500",
                !onVote && "cursor-default"
              )}
              onClick={() => handleVote(option.id)}
              disabled={!!userVoted}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">{option.text}</span>
                {isSelected && (
                  <Check className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span>{option.votes} votes</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-sm text-gray-600 mt-4">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{totalVotes} total votes</span>
        </div>
      </div>
    </div>
  )
}

