"use client"

import { useState } from "react"
import Poll from "@/components/poll-component"

export default function PollDemo() {
  const [polls, setPolls] = useState([
    {
      id: "1",
      question: "What's your favorite weekend activity?",
      options: [
        { id: "1a", text: "Outdoor adventures", votes: 24 },
        { id: "1b", text: "Relaxing at home", votes: 18 },
        { id: "1c", text: "Catching up with friends", votes: 32 },
        { id: "1d", text: "Learning something new", votes: 12 },
      ],
      userVoted: null,
    },
    {
      id: "2",
      question: "Which feature would you like to see next?",
      options: [
        { id: "2a", text: "Dark mode", votes: 45 },
        { id: "2b", text: "Voice messages", votes: 28 },
        { id: "2c", text: "Group polls", votes: 37 },
      ],
      userVoted: null,
    },
  ])

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(polls.map((poll) => (poll.id === pollId ? { ...poll, userVoted: optionId } : poll)))
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      {polls.map((poll) => (
        <Poll
          key={poll.id}
          question={poll.question}
          options={poll.options}
          userVoted={poll.userVoted}
          onVote={(optionId) => handleVote(poll.id, optionId)}
          className="bg-gray-50"
        />
      ))}
    </div>
  )
}
