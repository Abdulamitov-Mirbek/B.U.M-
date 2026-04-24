import { Mail, Phone, MapPin, Send } from "lucide-react";
import type { Language } from "../context/LanguageContext";

interface FooterProps {
  language: Language;
}

const footerContent = {
  en: {
    title: "B.U.M - Credit Scoring Hub",
    description: "Modern digital lending platform for urban financial needs",
    contact: "Contact",
    followUs: "Follow Us",
    quickLinks: "Quick Links",
    phone: "+996 555 123 456",
    email: "info@bum-credit.com",
    address: "Bishkek, Kyrgyzstan",
    telegram: "Join our Telegram Bot",
    links: {
      about: "About Us",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      faq: "FAQ",
      support: "Support",
    },
    copyright: "© 2026 B.U.M Credit Scoring. All rights reserved.",
  },
  ru: {
    title: "B.U.M - Хаб кредитного скоринга",
    description:
      "Современная цифровая платформа кредитования для городских финансовых нужд",
    contact: "Контакты",
    followUs: "Следите за нами",
    quickLinks: "Быстрые ссылки",
    phone: "+996 555 123 456",
    email: "info@bum-credit.com",
    address: "Бишкек, Кыргызстан",
    telegram: "Присоединитесь к нашему Telegram боту",
    links: {
      about: "О нас",
      privacy: "Политика конфиденциальности",
      terms: "Условия обслуживания",
      faq: "Часто задаваемые вопросы",
      support: "Поддержка",
    },
    copyright: "© 2026 B.U.M Credit Scoring. Все права защищены.",
  },
};

export function Footer({ language }: FooterProps) {
  const t = footerContent[language];

  return (
    <footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur-sm">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-xl font-bold text-transparent">
                {t.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{t.description}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white">{t.quickLinks}</h4>
            <ul className="mt-4 space-y-2">
              {Object.values(t.links).map((link, idx) => (
                <li key={idx}>
                  <button className="text-sm text-slate-400 transition hover:text-cyan-300">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white">{t.contact}</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4 text-cyan-400" />
                {t.phone}
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 text-cyan-400" />
                {t.email}
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-cyan-400" />
                {t.address}
              </li>
            </ul>
          </div>

          {/* Telegram Section */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white">{t.followUs}</h4>
              <p className="mt-2 text-sm text-slate-400">{t.telegram}</p>
            </div>
            <a
              href="https://t.me/hakatonBUMbot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
            >
              <Send className="h-5 w-5" />
              Telegram
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10"></div>

      {/* Bottom Section */}
      <div className="mx-auto max-w-7xl px-4 py-6 text-center md:px-8">
        <p className="text-sm text-slate-500">{t.copyright}</p>
      </div>
    </footer>
  );
}
