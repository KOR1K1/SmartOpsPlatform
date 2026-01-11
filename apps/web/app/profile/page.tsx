import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "User profile and settings",
};

export default function ProfilePage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Profile & Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      {/* Profile components will be implemented later */}
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Profile settings will be displayed here</p>
      </div>
    </div>
  );
}
