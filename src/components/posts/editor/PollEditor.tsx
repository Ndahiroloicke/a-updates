"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Calendar } from "lucide-react";
import { useState } from "react";
import { useCreatePollMutation } from "./mutations";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface PollOption {
  id: string;
  text: string;
}

export default function PollEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);

  const { mutate: createPoll, isLoading } = useCreatePollMutation();

  const addOption = () => {
    if (options.length >= 6) return;
    const newOption = {
      id: String(options.length + 1),
      text: "",
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(option => option.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(option =>
      option.id === id ? { ...option, text } : option
    ));
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || options.some(opt => !opt.text.trim())) {
      return;
    }

    createPoll(
      {
        title,
        description,
        options: options.map(opt => opt.text),
        endDate: endDate?.toISOString(),
        isAnonymous
      },
      {
        onSuccess: () => {
          router.push("/forum-poll");
        }
      }
    );
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <Input
        placeholder="Poll Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-semibold"
      />
      
      <Textarea
        placeholder="Poll Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[100px]"
      />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Poll Options</h3>
        {options.length < 6 && (
          <Button
            onClick={addOption}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Option
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Input
              placeholder={`Option ${option.id}`}
              value={option.text}
              onChange={(e) => updateOption(option.id, e.target.value)}
              className="flex-1"
              maxLength={100}
            />
            {options.length > 2 && (
              <Button
                onClick={() => removeOption(option.id)}
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">End Date (Optional)</label>
          <DateTimePicker
            value={endDate}
            onChange={setEndDate}
            className="w-[240px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="anonymous" className="text-sm font-medium">
            Anonymous Voting
          </label>
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={isLoading || !title.trim() || !description.trim() || options.some(opt => !opt.text.trim())}
        className="w-full mt-4"
      >
        {isLoading ? "Creating Poll..." : "Create Poll"}
      </Button>
    </div>
  );
}

