import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context";
import Layout from "./Layout";
import {
  Centres,
  ContentPage,
  Documents,
  Help,
  Home,
  SchemeDetail,
  Schemes,
  SearchPage,
  Services,
  Sitemap,
} from "./PublicPages";
import { RequireAuth, SignIn } from "./AuthPages";
import {
  ApplicationDetail,
  Applications,
  Benefits,
  ChangeRequest,
  Dashboard,
  FamilyPage,
  FindId,
  Notifications,
  Permissions,
  Track,
} from "./ResidentPages";
import { ApplyStart, Enrollment } from "./Enrollment";
import { Payments, StaffPayments } from "./Payments";
import { Grievances, GrievanceDetail, Staff, StaffCase } from "./StaffPages";
import {
  Admin,
  ContentAdmin,
  Departments,
  DeveloperDocs,
  SchemeAdmin,
} from "./AdminPages";
import type { ReactNode } from "react";
function protectedPage(page: ReactNode, roles?: string[]) {
  return <RequireAuth roles={roles}>{page}</RequireAuth>;
}
export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="schemes/:slug" element={<SchemeDetail />} />
          <Route path="help" element={<Help />} />
          <Route path="help/faq" element={<Help />} />
          <Route path="help/centres" element={<Centres />} />
          <Route path="about" element={<ContentPage slug="about" />} />
          <Route path="contact" element={<ContentPage slug="contact" />} />
          <Route
            path="accessibility"
            element={<ContentPage slug="accessibility" />}
          />
          <Route path="policies/:slug" element={<ContentPage />} />
          <Route path="documents" element={<Documents />} />
          <Route path="sitemap" element={<Sitemap />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="find-id" element={<FindId />} />
          <Route path="track" element={<Track />} />
          <Route path="apply/start" element={<ApplyStart />} />
          <Route path="apply/:id" element={protectedPage(<Enrollment />)} />
          <Route path="my" element={protectedPage(<Dashboard />)} />
          <Route path="my/family" element={protectedPage(<FamilyPage />)} />
          <Route
            path="my/applications"
            element={protectedPage(<Applications />)}
          />
          <Route
            path="my/applications/:id"
            element={protectedPage(<ApplicationDetail />)}
          />
          <Route
            path="my/applications/:id/receipt"
            element={protectedPage(<ApplicationDetail receipt />)}
          />
          <Route
            path="my/changes/new"
            element={protectedPage(<ChangeRequest />)}
          />
          <Route
            path="my/changes/:id/edit"
            element={protectedPage(<ChangeRequest />)}
          />
          <Route path="my/benefits" element={protectedPage(<Benefits />)} />
          <Route path="my/payments" element={protectedPage(<Payments />)} />
          <Route
            path="staff/payments"
            element={protectedPage(<StaffPayments />, ["department", "admin"])}
          />
          <Route
            path="my/notifications"
            element={protectedPage(<Notifications />)}
          />
          <Route
            path="my/permissions"
            element={protectedPage(<Permissions />)}
          />
          <Route
            path="my/access-history"
            element={<Navigate to="/my/permissions" replace />}
          />
          <Route path="grievances" element={<Grievances />} />
          <Route
            path="grievances/:id"
            element={protectedPage(<GrievanceDetail />)}
          />
          <Route
            path="staff"
            element={protectedPage(<Staff />, [
              "operator",
              "verifier",
              "approver",
              "admin",
            ])}
          />
          <Route
            path="staff/applications/:id"
            element={protectedPage(<StaffCase />, [
              "operator",
              "verifier",
              "approver",
              "admin",
            ])}
          />
          <Route path="admin" element={protectedPage(<Admin />, ["admin"])} />
          <Route
            path="admin/content"
            element={protectedPage(<ContentAdmin />, ["admin"])}
          />
          <Route
            path="admin/schemes"
            element={protectedPage(<SchemeAdmin />, ["admin"])}
          />
          <Route path="departments" element={<Departments />} />
          <Route path="developers/docs" element={<DeveloperDocs />} />
          <Route
            path="*"
            element={
              <div className="container page">
                <h1>Page not found · પૃષ્ઠ મળ્યું નથી</h1>
                <p>
                  This address does not exist. Please use the navigation above
                  to return to a service.
                </p>
                <a className="button" href="/">
                  Return home · મુખ્ય પૃષ્ઠ
                </a>
              </div>
            }
          />
        </Route>
      </Routes>
    </AppProvider>
  );
}
