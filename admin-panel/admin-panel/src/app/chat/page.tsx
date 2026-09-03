import AIChatDashboard from "../../components/ai-chat-dashboard/AIChatDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ChatPage() {
  return <ProtectedRoute><AIChatDashboard /></ProtectedRoute>;
}