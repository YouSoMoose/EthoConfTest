import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'
import Loader from './components/Loader'

// Public pages
import DemoLanding  from './pages/DemoLanding'
import LoginPage    from './pages/LoginPage'

// Attendee layout + pages
import AttendeeLayout   from './pages/attendee/AttendeeLayout'
import HomePage         from './pages/attendee/HomePage'
import SchedulePage     from './pages/attendee/SchedulePage'
import ScheduleDetail   from './pages/attendee/ScheduleDetail'
import PitchesPage      from './pages/attendee/PitchesPage'
import PitchVotePage    from './pages/attendee/PitchVotePage'
import PassportPage     from './pages/attendee/PassportPage'
import MorePage         from './pages/attendee/MorePage'
import NotesPage        from './pages/attendee/NotesPage'
import NoteEditorPage   from './pages/attendee/NoteEditorPage'
import ChatPage         from './pages/attendee/ChatPage'
import MyCardPage       from './pages/attendee/MyCardPage'
import WalletPage       from './pages/attendee/WalletPage'
import ScanPage         from './pages/attendee/ScanPage'
import ProfilePage      from './pages/attendee/ProfilePage'

// Admin layout + pages
import AdminLayout      from './pages/admin/AdminLayout'
import AdminDash        from './pages/admin/AdminDash'
import AdminCheckin     from './pages/admin/AdminCheckin'
import AdminMessages    from './pages/admin/AdminMessages'
import AdminCompanies   from './pages/admin/AdminCompanies'
import AdminUsers       from './pages/admin/AdminUsers'
import AdminSchedule    from './pages/admin/AdminSchedule'
import AdminRaffle      from './pages/admin/AdminRaffle'

function AppRoutes() {
  const { session, profile, loading } = useAuth()

  if (loading) return <Loader fullPage />

  // Not logged in → public routes
  if (!session || !profile) {
    return (
      <Routes>
        <Route path="/"      element={<DemoLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  const level = profile.access_level ?? 0

  // Staff / Admin (L2+) → admin panel
  if (level >= 2) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                element={<AdminDash />} />
          <Route path="checkin"       element={<AdminCheckin />} />
          <Route path="messages"      element={<AdminMessages />} />
          <Route path="companies"     element={<AdminCompanies />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="schedule"      element={<AdminSchedule />} />
          <Route path="raffle"        element={<AdminRaffle />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    )
  }

  // Attendee / Presenter (L0–L1) → attendee app
  return (
    <Routes>
      <Route path="/app" element={<AttendeeLayout />}>
        <Route index                    element={<HomePage />} />
        <Route path="schedule"          element={<SchedulePage />} />
        <Route path="schedule/:id"      element={<ScheduleDetail />} />
        <Route path="pitches"           element={<PitchesPage />} />
        <Route path="pitches/:id"       element={<PitchVotePage />} />
        <Route path="passport"          element={<PassportPage />} />
        <Route path="more"              element={<MorePage />} />
        <Route path="notes"             element={<NotesPage />} />
        <Route path="notes/:id"         element={<NoteEditorPage />} />
        <Route path="notes/new"         element={<NoteEditorPage />} />
        <Route path="chat"              element={<ChatPage />} />
        <Route path="my-card"           element={<MyCardPage />} />
        <Route path="wallet"            element={<WalletPage />} />
        <Route path="scan"              element={<ScanPage />} />
        <Route path="profile"           element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
