import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaLink } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import useFollow from "../../hooks/useFollow";
import { formatMemberSinceDate } from "../../utils/date";

const FEED_TYPES = {
  POSTS: "posts",
  LIKES: "likes",
};

const DEFAULT_COVER = "/cover.png";
const DEFAULT_AVATAR = "/avatar-placeholder.png";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState(FEED_TYPES.POSTS);

  const queryClient = useQueryClient();
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);
  const { username } = useParams();
  const { follow, isPending: isFollowPending } = useFollow();

  // Auth user query
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    staleTime: 300000, // 5 minutes
  });

  // Profile user query
  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`/api/user/profile/${username}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch user profile");
      }

      return data;
    },
    retry: 2,
    staleTime: 300000,
  });

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/user/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverImg,
          profileImg,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      // Invalidate both queries to refresh the data
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
      // Reset image states
      setCoverImg(null);
      setProfileImg(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isMyProfile = authUser?._id === user?._id;
  const memberSinceDate = user?.createdAt
    ? formatMemberSinceDate(user.createdAt)
    : "";
  const amIFollowing = authUser?.following?.includes(user?._id) || false;

  const handleImgChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === "coverImg") setCoverImg(reader.result);
      if (type === "profileImg") setProfileImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!coverImg && !profileImg) return;
    await updateProfile();
  };

  useEffect(() => {
    if (username) {
      refetch();
    }
  }, [username, refetch]);

  if (error) {
    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        <p className="text-center text-lg mt-4 text-red-500">
          {error.message || "Failed to load profile"}
        </p>
      </div>
    );
  }

  if (isLoading || isRefetching) {
    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        <ProfileHeaderSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        <p className="text-center text-lg mt-4">User not found</p>
      </div>
    );
  }

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex gap-10 px-4 py-2 items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <p className="font-bold text-lg">{user.fullName}</p>
            <span className="text-sm text-slate-500">
              {user.posts?.length || 0} posts
            </span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative group/cover">
          <img
            src={coverImg || user.coverImg || DEFAULT_COVER}
            className="h-52 w-full object-cover"
            alt={`${user.fullName}'s cover`}
          />
          {isMyProfile && (
            <button
              className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
              onClick={() => coverImgRef.current?.click()}
              aria-label="Change cover image"
            >
              <MdEdit className="w-5 h-5 text-white" />
            </button>
          )}

          <input
            type="file"
            hidden
            accept="image/*"
            ref={coverImgRef}
            onChange={(e) => handleImgChange(e, "coverImg")}
          />
          <input
            type="file"
            hidden
            accept="image/*"
            ref={profileImgRef}
            onChange={(e) => handleImgChange(e, "profileImg")}
          />

          {/* Profile Avatar */}
          <div className="avatar absolute -bottom-16 left-4">
            <div className="w-32 rounded-full relative group/avatar">
              <img
                src={profileImg || user.profileImg || DEFAULT_AVATAR}
                alt={`${user.fullName}'s avatar`}
                className="w-full h-full object-cover"
              />
              {isMyProfile && (
                <button
                  className="absolute top-5 right-3 p-1 bg-primary rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => profileImgRef.current?.click()}
                  aria-label="Change profile image"
                >
                  <MdEdit className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end px-4 mt-5">
          {isMyProfile ? (
            <EditProfileModal authUser={authUser} />
          ) : (
            <button
              className="btn btn-outline rounded-full btn-sm disabled:opacity-50"
              onClick={() => follow(user._id)}
              disabled={isFollowPending}
            >
              {isFollowPending
                ? "Loading..."
                : amIFollowing
                ? "Unfollow"
                : "Follow"}
            </button>
          )}

          {(coverImg || profileImg) && (
            <button
              className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2 disabled:opacity-50"
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Updating..." : "Update"}
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col gap-4 mt-14 px-4">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{user.fullName}</span>
            <span className="text-sm text-slate-500">@{user.username}</span>
            {user.bio && <span className="text-sm my-1">{user.bio}</span>}
          </div>

          <div className="flex gap-2 flex-wrap">
            {user.link && (
              <div className="flex gap-1 items-center">
                <FaLink className="w-3 h-3 text-slate-500" />
                <a
                  href={user.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {user.link}
                </a>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <IoCalendarOutline className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">{memberSinceDate}</span>
            </div>
          </div>

          {/* Following/Followers Count */}
          <div className="flex gap-2">
            <div className="flex gap-1 items-center">
              <span className="font-bold text-xs">
                {user.following?.length || 0}
              </span>
              <span className="text-slate-500 text-xs">Following</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="font-bold text-xs">
                {user.followers?.length || 0}
              </span>
              <span className="text-slate-500 text-xs">Followers</span>
            </div>
          </div>
        </div>

        {/* Feed Type Selector */}
        <div className="flex w-full border-b border-gray-700 mt-4">
          {Object.values(FEED_TYPES).map((type) => (
            <button
              key={type}
              className={`flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer ${
                feedType !== type && "text-slate-500"
              }`}
              onClick={() => setFeedType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {feedType === type && (
                <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        <Posts feedType={feedType} username={username} userId={user._id} />
      </div>
    </div>
  );
};

export default ProfilePage;
