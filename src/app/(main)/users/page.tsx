
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateRequest } from "@/auth";
import UsersList from "./UsersList";
import PublishersList from "./PublishersList";
import PublishersRequests from "./PublishersRequest";

export default async function Users() {
    const session = await validateRequest();
    return (
        <main className=" w-full min-w-0 space-y-5">
            <PublishersRequests />
            <div className="w-full min-w-0 space-y-5">
                <Tabs defaultValue="users">
                    <TabsList>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="publishers">Publishers</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                        <UsersList />
                    </TabsContent>
                    <TabsContent value="publishers">
                        <PublishersList />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
