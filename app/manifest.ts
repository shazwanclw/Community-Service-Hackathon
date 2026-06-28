import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CleanMerit",
    short_name: "CleanMerit",
    description: "Report hazards, submit fixes, and earn points for Desa Mentari.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f1e7",
    theme_color: "#123524",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
