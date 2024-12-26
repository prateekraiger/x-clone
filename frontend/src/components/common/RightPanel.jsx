import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
  const {
    data: suggestedUsers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const res = await fetch("/api/user/suggested", {
        credentials: "include", // Important for authentication
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch suggested users");
      }

      const data = await res.json();
      return data;
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { follow, isPending: isFollowPending } = useFollow();

  const handleFollow = async (userId, e) => {
    e.preventDefault(); // Prevent navigation when clicking follow
    try {
      await follow(userId);
      await refetch(); // Refetch the list after successful follow
    } catch (err) {
      console.error("Failed to follow user:", err);
    }
  };

  const renderContent = () => {
    if (isError) {
      return (
        <p className="text-center text-sm mt-4 text-red-500">
          {error?.message || "Failed to load suggestions"}
        </p>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <RightPanelSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (!suggestedUsers || !suggestedUsers.length) {
      return (
        <p className="text-center text-sm mt-4 text-slate-500">
          No suggestions available
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {suggestedUsers.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between gap-4 group hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
          >
            <Link
              to={`/profile/${user.username}`}
              className="flex gap-2 items-center flex-1"
            >
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img
                    src={user.profileImg || "/avatar-placeholder.png"}
                    alt={`${user.fullName}'s avatar`}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                {" "}
                {/* min-w-0 helps with truncation */}
                <span className="font-semibold tracking-tight truncate max-w-[150px]">
                  {user.fullName}
                </span>
                <span className="text-sm text-slate-500 truncate max-w-[150px]">
                  @{user.username}
                </span>
              </div>
            </Link>
            <button
              className="btn bg-white text-black hover:bg-white/90 rounded-full btn-sm disabled:opacity-50"
              onClick={(e) => handleFollow(user._id, e)}
              disabled={isFollowPending}
            >
              {isFollowPending ? <LoadingSpinner size="sm" /> : "Follow"}
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <h2 className="font-bold mb-4">Who to follow</h2>
        {renderContent()}
      </div>
    </aside>
  );
};

export default RightPanel;
