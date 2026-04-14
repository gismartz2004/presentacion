import ProtectRoutes from "@/core/guards/protect-routes";
import FiltersPage from "@/features/filters/pages/filters-page";
import Loading from "@/shared/components/loading";
import { useUserStore } from "@/store/use-user-store";
import { lazy, Suspense } from "react";
import { useRoutes } from "react-router";
import { featureComponentMap } from "./feature-component-map";

const AuthPage = lazy(() => import("@/features/auth/pages/auth-page"));
const AdminDashboard = lazy(
  () => import("@/features/dashboard/pages/dashboard-page")
);
const OrdersPage = lazy(() => import("@/features/orders/pages/order-page"));
const ProductsPage = lazy(
  () => import("@/features/products/pages/product-page")
);
const Home = lazy(() => import("@/features/home/pages/home"));
const SideBar = lazy(() => import("@/shared/components/layout"));

// Promotions pages
const PromotionsList = lazy(() => import("@/features/promotions/pages/PromotionsList"));
const PromotionForm = lazy(() => import("@/features/promotions/pages/PromotionForm"));

// CMS pages
const CmsHomeDashboard = lazy(() => import("@/features/modules/cms/pages/CmsHomeDashboard"));
const CmsStoreDashboard = lazy(() => import("@/features/modules/cms/pages/CmsStoreDashboard"));
const CmsAboutDashboard = lazy(() => import("@/features/modules/cms/pages/CmsAboutDashboard"));
const CmsContactDashboard = lazy(() => import("@/features/modules/cms/pages/CmsContactDashboard"));

// Loyalty pages
const LoyaltyDashboard = lazy(() => import("@/features/modules/loyalty/dashboard/LoyaltyDashboard"));
const SegmentsList = lazy(() => import("@/features/modules/loyalty/segments/pages/SegmentsList"));
const SegmentForm = lazy(() => import("@/features/modules/loyalty/segments/pages/SegmentForm"));
const SegmentDetail = lazy(() => import("@/features/modules/loyalty/segments/pages/SegmentDetail"));
const CouponsList = lazy(() => import("@/features/modules/loyalty/coupons/pages/CouponsList"));
const CouponForm = lazy(() => import("@/features/modules/loyalty/coupons/pages/CouponForm"));
const CouponDetail = lazy(() => import("@/features/modules/loyalty/coupons/pages/CouponDetail"));
const CampaignsList = lazy(() => import("@/features/modules/loyalty/campaigns/pages/CampaignsList"));
const CampaignForm = lazy(() => import("@/features/modules/loyalty/campaigns/pages/CampaignForm"));
const CampaignDetail = lazy(() => import("@/features/modules/loyalty/campaigns/pages/CampaignDetail"));
const TemplatesList = lazy(() => import("@/features/modules/loyalty/templates/pages/TemplatesList"));
const TemplateForm = lazy(() => import("@/features/modules/loyalty/templates/pages/TemplateForm"));
const TemplateDetail = lazy(() => import("@/features/modules/loyalty/templates/pages/TemplateDetail"));
const AutomationsList = lazy(() => import("@/features/modules/loyalty/automations/pages/AutomationsList"));
const AutomationForm = lazy(() => import("@/features/modules/loyalty/automations/pages/AutomationForm"));
const AutomationDetail = lazy(() => import("@/features/modules/loyalty/automations/pages/AutomationDetail"));

function buildFeatureRoutes() {
  const { features } = useUserStore.getState();

  return features.flatMap(f => {
    const Component = featureComponentMap[f.name];
    if (!Component) return []; // ← no null, sino array vacío -

    return [{
      path: f.name,
      element: (
        <Suspense fallback={<Loading />}>
          <Component />
        </Suspense>
      )
    }];
  });
}

export default function Routes() {
  return useRoutes([
    {
      path: "/",
      element: (
        <Suspense fallback={<Loading />}>
          <Home />
        </Suspense>
      ),
    },
    {
      path: "/auth",
      element: (
        <Suspense fallback={<Loading />}>
          <AuthPage />
        </Suspense>
      ),
    },
    {
      path: "/app",
      element: (
        <ProtectRoutes>
          <Suspense fallback={<Loading />}>
            <SideBar />
          </Suspense>
        </ProtectRoutes>
      ),
      children: [
        {
          path: "dashboard",
          element: (
            <Suspense fallback={<Loading />}>
              <AdminDashboard />
            </Suspense>
          ),
        },
        {
          path: "filters",
          element: (
            <Suspense fallback={<Loading />}>
              <FiltersPage />
            </Suspense>
          ),
        },
        {
          path: "products",
          element: (
            <Suspense fallback={<Loading />}>
              <ProductsPage />
            </Suspense>
          ),
        },
        {
          path: "orders",
          element: (
            <Suspense fallback={<Loading />}>
              <OrdersPage />
            </Suspense>
          ),
        },
        ...buildFeatureRoutes(),
        {
          path: "coupons",
          children: [
            {
              path: "",
              element: (
                <Suspense fallback={<Loading />}>
                  <CouponsList />
                </Suspense>
              ),
            },
            {
              path: "new",
              element: (
                <Suspense fallback={<Loading />}>
                  <CouponForm />
                </Suspense>
              ),
            },
            {
              path: ":id",
              element: (
                <Suspense fallback={<Loading />}>
                  <CouponDetail />
                </Suspense>
              ),
            },
            {
              path: ":id/edit",
              element: (
                <Suspense fallback={<Loading />}>
                  <CouponForm />
                </Suspense>
              ),
            },
          ],
        },
        {
          path: "promotions",
          children: [
            {
              path: "",
              element: (
                <Suspense fallback={<Loading />}>
                  <PromotionsList />
                </Suspense>
              ),
            },
            {
              path: "new",
              element: (
                <Suspense fallback={<Loading />}>
                  <PromotionForm />
                </Suspense>
              ),
            },
            {
              path: ":id",
              element: (
                <Suspense fallback={<Loading />}>
                  <PromotionForm />
                </Suspense>
              ),
            },
          ],
        },
        {
          path: "cms",
          children: [
            {
              path: "home",
              element: (
                <Suspense fallback={<Loading />}>
                  <CmsHomeDashboard />
                </Suspense>
              ),
            },
            {
              path: "store",
              element: (
                <Suspense fallback={<Loading />}>
                  <CmsStoreDashboard />
                </Suspense>
              ),
            },
            {
              path: "about",
              element: (
                <Suspense fallback={<Loading />}>
                  <CmsAboutDashboard />
                </Suspense>
              ),
            },
            {
              path: "contact",
              element: (
                <Suspense fallback={<Loading />}>
                  <CmsContactDashboard />
                </Suspense>
              ),
            },
          ],
        }
      ],
    },
  ]);
}
