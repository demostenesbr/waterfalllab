import type { Metadata } from "next";
import { ValidationPage } from "@/modules/validation/validation-page";

export const metadata: Metadata = { title: "Validação e Conformidade" };

export default function Page() {
  return <ValidationPage />;
}
