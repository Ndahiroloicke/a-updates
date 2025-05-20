"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, User, UserCheck, Clock, AlertCircle, Loader2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { validateRequest } from "@/auth";

// Define the publisher request interface
interface PublisherRequest {
  id: string;
  userId: string;
  email: string;
  message: string;
  category: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    email?: string;
  };
}

export default function PublisherRequestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PublisherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PublisherRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [action, setAction] = useState<"APPROVED" | "REJECTED" | null>(null);

  // Fetch publisher requests
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/publisher-request");
      
      if (!response.ok) {
        throw new Error("Failed to fetch publisher requests");
      }
      
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching publisher requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load publisher requests. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the response dialog
  const handleOpenDialog = (request: PublisherRequest, actionType: "APPROVED" | "REJECTED") => {
    setSelectedRequest(request);
    setAction(actionType);
    setResponseMessage(
      actionType === "APPROVED"
        ? "Your publisher request has been approved! You can now create and publish content."
        : "Your publisher request has been rejected."
    );
    setShowDialog(true);
  };

  // Handle request approval/rejection
  const handleRequestAction = async () => {
    if (!selectedRequest || !action) return;

    try {
      setProcessingRequestId(selectedRequest.id);
      
      const response = await fetch(`/api/publisher-request/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action,
          message: responseMessage,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update publisher request");
      }
      
      const updatedRequest = await response.json();
      
      // Update the requests list
      setRequests(
        requests.map((req) =>
          req.id === updatedRequest.id ? updatedRequest : req
        )
      );
      
      // Show success message
      toast({
        title: "Success",
        description: `Publisher request ${action.toLowerCase()} successfully`,
        className: action === "APPROVED" ? "bg-green-50" : "bg-red-50",
      });
      
      // Close dialog
      setShowDialog(false);
      setSelectedRequest(null);
      setAction(null);
      setResponseMessage("");
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} publisher request:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action.toLowerCase()} publisher request. Please try again.`,
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Get status badge based on request status
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
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            Return to Dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Publisher Requests</h1>
        <p className="text-gray-500 mt-2">
          Manage publisher requests from users who want to contribute content.
        </p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">All Publisher Requests</CardTitle>
          <CardDescription className="text-gray-500">
            Review and respond to users requesting publisher status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No publisher requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full bg-white">
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50 border-b border-gray-200">
                    <TableHead className="text-gray-700 font-medium">User</TableHead>
                    <TableHead className="text-gray-700 font-medium">Request</TableHead>
                    <TableHead className="text-gray-700 font-medium">Date</TableHead>
                    <TableHead className="text-gray-700 font-medium">Status</TableHead>
                    <TableHead className="text-gray-700 font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell className="align-middle">
                        <div className="flex flex-row items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] text-gray-500 align-middle">
                        <div className="truncate">{request.message}</div>
                      </TableCell>
                      <TableCell className="text-gray-500 align-middle">
                        {format(new Date(request.requestedAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="align-middle">{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right align-middle">
                        {request.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                              onClick={() => handleOpenDialog(request, "APPROVED")}
                              disabled={!!processingRequestId}
                            >
                              {processingRequestId === request.id ? (
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
                              onClick={() => handleOpenDialog(request, "REJECTED")}
                              disabled={!!processingRequestId}
                            >
                              {processingRequestId === request.id ? (
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
              {action === "APPROVED" ? "Approve" : "Reject"} Publisher Request
            </DialogTitle>
            <DialogDescription>
              {action === "APPROVED"
                ? "Approve this request and grant publisher permissions to the user."
                : "Reject this request with a message explaining why."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="font-medium">Request from {selectedRequest.user?.displayName}</div>
                <div className="text-sm text-gray-500 mt-1">{selectedRequest.message}</div>
              </div>

              <div className="space-y-2">
                <label htmlFor="response-message" className="text-sm font-medium">
                  Response Message
                </label>
                <Textarea
                  id="response-message"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Enter your response message..."
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
              onClick={handleRequestAction}
              disabled={processingRequestId !== null}
              className={`w-full sm:w-auto ${
                action === "APPROVED" ? "bg-green-600 hover:bg-green-700" : ""
              }`}
            >
              {processingRequestId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : action === "APPROVED" ? (
                "Approve Request"
              ) : (
                "Reject Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 