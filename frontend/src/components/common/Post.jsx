import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  FaRegComment,
  FaRegHeart,
  FaHeart,
  FaRegBookmark,
  FaTrash,
} from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date"; // Import the function

const Post = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const isLiked = post.likes.includes(authUser?.id);
  const isMyPost = authUser?.id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt); // Use the function

  const { mutate: deletePost, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: likePost, isLoading: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/like/${post._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to like post");
      return data;
    },
    onSuccess: (updatedPost) => {
      setPost((prev) => ({
        ...prev,
        likes: isLiked
          ? prev.likes.filter((id) => id !== authUser?.id)
          : [...prev.likes, authUser?.id],
      }));
      toast.success(isLiked ? "Post unliked" : "Post liked successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: addComment, isLoading: isCommenting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/comment/${post._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");
      return data;
    },
    onSuccess: (updatedPost) => {
      setPost(updatedPost);
      setComment("");
      toast.success("Comment added successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteComment, isLoading: isDeletingComment } = useMutation({
    mutationFn: async (commentId) => {
      const res = await fetch(`/api/posts/comment/${post._id}/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete comment");
      return data;
    },
    onSuccess: (updatedPost) => {
      setPost(updatedPost);
      toast.success("Comment deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost();
    }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment();
  };

  const handleLikePost = () => {
    if (!authUser) {
      toast.error("Please login to like posts");
      return;
    }
    if (isLiking) return;
    likePost();
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteComment(commentId);
    }
  };

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <div className="avatar">
        <Link
          to={`/profile/${post.user.username}`}
          className="w-8 rounded-full overflow-hidden"
        >
          <img
            src={post.user.profileImg || "/avatar-placeholder.png"}
            alt={`${post.user.username}'s avatar`}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link
            to={`/profile/${post.user.username}`}
            className="font-bold hover:underline"
          >
            {post.user.fullName}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link
              to={`/profile/${post.user.username}`}
              className="hover:underline"
            >
              @{post.user.username}
            </Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {isDeleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FaTrash
                  className="cursor-pointer hover:text-red-500 transition-colors"
                  onClick={handleDeletePost}
                />
              )}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 overflow-hidden my-2">
          <span className="whitespace-pre-wrap">{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt="Post attachment"
            />
          )}
        </div>

        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <button
              className="flex gap-1 items-center group"
              onClick={() =>
                document.getElementById(`comments_modal${post._id}`).showModal()
              }
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400 transition-colors">
                {post.comments.length}
              </span>
            </button>

            <button className="flex gap-1 items-center group">
              <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500 transition-colors" />
              <span className="text-sm text-slate-500 group-hover:text-green-500 transition-colors">
                0
              </span>
            </button>

            <button
              className="flex gap-1 items-center group"
              onClick={handleLikePost}
              disabled={isLiking}
            >
              {isLiking ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {isLiked ? (
                    <FaHeart className="w-4 h-4 text-pink-500" />
                  ) : (
                    <FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500 transition-colors" />
                  )}
                  <span
                    className={`text-sm transition-colors ${
                      isLiked
                        ? "text-pink-500"
                        : "text-slate-500 group-hover:text-pink-500"
                    }`}
                  >
                    {post.likes.length}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="flex w-1/3 justify-end">
            <button className="group">
              <FaRegBookmark className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <dialog
        id={`comments_modal${post._id}`}
        className="modal border-none outline-none"
      >
        <div className="modal-box rounded border border-gray-600">
          <h3 className="font-bold text-lg mb-4">Comments</h3>
          <div className="flex flex-col gap-3 max-h-60 overflow-auto">
            {post.comments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No comments yet 🤔 Be the first one 😉
              </p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-2 items-start">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          comment.user.profileImg || "/avatar-placeholder.png"
                        }
                        alt={`${comment.user.username}'s avatar`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{comment.user.fullName}</span>
                      <span className="text-gray-700 text-sm">
                        @{comment.user.username}
                      </span>
                    </div>
                    <div className="text-sm">{comment.text}</div>
                  </div>
                  {authUser?.id === comment.user._id && (
                    <button
                      className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={isDeletingComment}
                    >
                      {isDeletingComment ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <form
            className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
            onSubmit={handlePostComment}
          >
            <textarea
              className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isCommenting}
            />
            <button
              type="submit"
              className="btn btn-primary rounded-full btn-sm text-white px-4"
              disabled={!comment.trim() || isCommenting}
            >
              {isCommenting ? <LoadingSpinner size="sm" /> : "Post"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </div>
  );
};

export default Post;
