import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

export function StripeSettings() {
  const { toast } = useToast();
  const { data: stripeStatus, isLoading } =
    api.post.getStripeAccountStatus.useQuery();
  const { mutateAsync: connectStripeAccount } =
    api.post.connectStripeAccount.useMutation();

  const handleConnectStripe = async () => {
    try {
      const { url } = await connectStripeAccount();
      window.location.href = url;
    } catch {
      toast({
        title: "Error",
        description: "Failed to connect Stripe account",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="h-20 animate-pulse rounded-lg bg-gray-200" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Stripe Integration</h2>
      <p className="text-gray-600">
        Connect your Stripe account to receive donations for your events.
      </p>

      {stripeStatus?.connected ? (
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-green-700">
            ✓ Your Stripe account is connected and ready to receive donations
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-yellow-700">!</p>
          </div>
          <Button onClick={handleConnectStripe}>Connect Stripe Account</Button>
        </div>
      )}
    </div>
  );
}
