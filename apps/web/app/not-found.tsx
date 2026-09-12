import type { Metadata } from "next";
import { NotFoundContentTerminal } from "@/components/site/NotFoundContentTerminal";

export const metadata: Metadata = {
  title: "Path Not Found",
};

export default function NotFound() {
  return <NotFoundContentTerminal />;
}
