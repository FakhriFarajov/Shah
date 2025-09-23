import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Buyer {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    confirmed: boolean;
}

export default function BuyerDetailsCard({ buyer, id }: { buyer?: Buyer; id?: string }) {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Buyer Details</CardTitle>
            </CardHeader>
            <CardContent>
                {buyer ? (
                    <div className="space-y-2">
                        <div><strong>Name:</strong> {buyer.name} {buyer.surname}</div>
                        <div><strong>Email:</strong> {buyer.email}</div>
                        <div><strong>Phone:</strong> {buyer.phone}</div>
                        <div><strong>Confirmed:</strong> {buyer.confirmed ? "Yes" : "No"}</div>
                    </div>
                ) : (
                    <div className="text-gray-400">No buyer found with ID: {id}</div>
                )}
            </CardContent>
        </Card>
    );
}