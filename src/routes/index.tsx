import { createFileRoute } from "@tanstack/react-router";
import MahdiSite from "@/components/MahdiSite";
import { catalogQuery, servicesQuery } from '@/lib/services-query';

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    // لا نُسقط الصفحة كاملة إذا تعذّر الاتصال بقاعدة البيانات؛ المكوّن يعيد الجلب لاحقًا.
    await Promise.allSettled([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "مهدي خدماتي | الحسابات والتحويلات" },
      { name: "description", content: "مهدي خدماتي — حسابات وتحويلات مالية إلكترونية عبر الدول، تواصل مباشر عبر واتساب." },
      { property: "og:title", content: "مهدي خدماتي | الحسابات والتحويلات" },
      { property: "og:description", content: "حسابات وتحويلات مالية إلكترونية عبر الدول." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MahdiSite,
});
