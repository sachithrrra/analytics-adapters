"use client";
import { useAnalytics } from "analytics-adapters/next";

export default function About() {
  const a = useAnalytics();
  return <button onClick={() => a.track("clicked", { where: "about" })}>track</button>;
}
