"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, FileText, Clock, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Placeholder for content submission interface 
// This would be replaced with your actual submission model
interface ContentSubmission {
  id: string;
  title: string;
  excerpt: string;
  publisher: {
    id: string;
    displayName: string;
    username: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  category: string;
}

// Placeholder data until real endpoint is created
const MOCK_CONTENT_SUBMISSIONS: ContentSubmission[] = [
  {
    id: "1",
    title: "Recent Developments in AI Technology",
    excerpt: "A look at the latest advancements in artificial intelligence...",
    publisher: {
      id: "user1",
      displayName: "John Writer",
      username: "johnwriter",
    },
    status: "PENDING",
    createdAt: new Date().toISOString(),
    category: "Technology",
  },
  {
    id: "2",
    title: "Economic Trends in East Africa",
    excerpt: "Analysis of economic growth patterns across East African nations...",
    publisher: {
      id: "user2",
      displayName: "Amara Journalist",
      username: "amaraj",
    },
    status: "PENDING",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    category: "Economics",
  },
];

export default function ContentApprovalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [action, setAction] = useState<"APPROVED" | "REJECTED" | null>(null);

  // Fetch content submissions
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    setLoading(true);
    setTimeout(() => {
      setSubmissions(MOCK_CONTENT_SUBMISSIONS);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle opening the response dialog
  const handleOpenDialog = (submission: ContentSubmission, actionType: "APPROVED" | "REJECTED") => {
    setSelectedSubmission(submission);
    setAction(actionType);
    setResponseMessage(
      actionType === "APPROVED"
        ? "Your content has been approved and is now published."
        : "Your content submission has been rejected."
    );
    setShowDialog(true);
  };

  // Handle content approval/rejection
  const handleContentAction = async () => {
    if (!selectedSubmission || !action) return;

    try {
      setProcessingId(selectedSubmission.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the submissions list in state
      setSubmissions(
        submissions.map((sub) =>
          sub.id === selectedSubmission.id 
            ? { ...sub, status: action } 
            : sub
        )
      );
      
      // Show success message
      toast({
        title: "Success",
        description: `Content ${action.toLowerCase()} successfully`,
        className: action === "APPROVED" ? "bg-green-50" : "bg-red-50",
      });
      
      // Close dialog
      setShowDialog(false);
      setSelectedSubmission(null);
      setAction(null);
      setResponseMessage("");
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} content:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action.toLowerCase()} content. Please try again.`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Get status badge based on content status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
            <Check className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">
            <X className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="mr-1 h-3 w-3" /> Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-white">
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="gap-2 pl-0 text-green-600 hover:bg-transparent hover:text-green-700"
        >
          <Link href="/user-dashboard">
            <ArrowLeft className="h-5 w-5" />
            Return to Dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Approval</h1>
        <p className="text-gray-500 mt-2">
          Review and approve content submitted by publishers before it goes live.
        </p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Content Submissions</CardTitle>
          <CardDescription className="text-gray-500">
            Review publisher content submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No pending content submissions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full bg-white">
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50 border-b border-gray-200">
                    <TableHead className="text-gray-700 font-medium">Content</TableHead>
                    <TableHead className="text-gray-700 font-medium">Publisher</TableHead>
                    <TableHead className="text-gray-700 font-medium">Category</TableHead>
                    <TableHead className="text-gray-700 font-medium">Submitted</TableHead>
                    <TableHead className="text-gray-700 font-medium">Status</TableHead>
                    <TableHead className="text-gray-700 font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell className="align-middle">
                        <div>
                          <div className="font-medium">{submission.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[300px]">
                            {submission.excerpt}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 align-middle">{submission.publisher.displayName}</TableCell>
                      <TableCell className="text-gray-500 align-middle">{submission.category}</TableCell>
                      <TableCell className="text-gray-500 align-middle">
                        {format(new Date(submission.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="align-middle">{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="text-right align-middle">
                        {submission.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                              onClick={() => router.push(`/content/${submission.id}/preview`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                              onClick={() => handleOpenDialog(submission, "APPROVED")}
                              disabled={!!processingId}
                            >
                              {processingId === submission.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              onClick={() => handleOpenDialog(submission, "REJECTED")}
                              disabled={!!processingId}
                            >
                              {processingId === submission.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 mr-1" />
                              )}
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {action === "APPROVED" ? "Approve" : "Reject"} Content
            </DialogTitle>
            <DialogDescription>
              {action === "APPROVED"
                ? "Approve this content to publish it on the platform."
                : "Reject this content with feedback for the publisher."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="py-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="font-medium">{selectedSubmission.title}</div>
                <div className="text-sm text-gray-500 mt-1">
                  By {selectedSubmission.publisher.displayName}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="response-message" className="text-sm font-medium">
                  Feedback Message
                </label>
                <Textarea
                  id="response-message"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Enter your feedback message..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant={action === "APPROVED" ? "default" : "destructive"}
              onClick={handleContentAction}
              disabled={processingId !== null}
              className={`w-full sm:w-auto ${
                action === "APPROVED" ? "bg-green-600 hover:bg-green-700" : ""
              }`}
            >
              {processingId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : action === "APPROVED" ? (
                "Approve Content"
              ) : (
                "Reject Content"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 