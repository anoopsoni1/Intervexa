import React from "react";
import { useUserData } from "../hooks/useUserData.js";

export default function UserDataExample() {
  const { user, isLoading, isFetching, isError, error, refetchUser } = useUserData();

  if (isLoading && !user) {
    return <p>Loading user...</p>;
  }

  if (isError && !user) {
    return <p>Error: {error?.message || "Failed to load user"}</p>;
  }

  return (
    <section>
      <h2>User Data</h2>
      <p>Name: {user?.FirstName || "Unknown"} {user?.LastName || ""}</p>
      <p>Email: {user?.email || "N/A"}</p>
      <button type="button" onClick={() => refetchUser()} disabled={isFetching}>
        {isFetching ? "Refreshing..." : "Refetch User"}
      </button>
    </section>
  );
}

