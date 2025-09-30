import { createFileRoute } from "@tanstack/react-router";
import { MyProfile } from "@/components/my-profile";

export const Route = createFileRoute("/admin/myprofile")({
  component: MyProfile,
});
