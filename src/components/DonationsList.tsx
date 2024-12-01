
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DonationsListProps {
  donations: Array<{
    amount: number;
    createdAt: Date;
    user: {
      id: string | null;
      name: string | null;
      image: string | null;
    } | null;
  }>;
}

export const DonationsList = ({ donations }: DonationsListProps) => {
  const router = useRouter();

  if (!donations.length) {
    return (
      <div className="text-center text-gray-500">
        No donations yet. Be the first to donate!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xl font-semibold sm:text-2xl">Donations</h4>
      <div className="space-y-3">
        {donations.map((donation, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              {donation.user ? (
                <Image
                  src={donation.user.image ?? "/defaultAvatar.jpg"}
                  alt="Donor avatar"
                  width={32}
                  height={32}
                  className="h-8 w-8 cursor-pointer rounded-full"
                  onClick={() => router.push(`/profile/${donation.user?.id}`)}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200" />
              )}
              <span className="font-medium">
                {donation.user?.name ?? "Anonymous"}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-600">
                ${(donation.amount / 100).toFixed(2)}
              </span>
              <div className="text-sm text-gray-500">
                {new Date(donation.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};