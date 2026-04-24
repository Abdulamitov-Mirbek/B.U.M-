import { ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Footer } from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { language } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-grow">{children}</div>
      <Footer language={language} />
    </div>
  );
}
