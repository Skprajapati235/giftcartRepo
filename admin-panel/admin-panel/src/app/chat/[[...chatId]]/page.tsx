import AIChatDashboard from "../../../components/ai-chat-dashboard/AIChatDashboard";
import ProtectedRoute from "../../components/ProtectedRoute";

// Handles both:  /chat  (new chat)   and   /chat/<chatId>  (saved chat)
export default function ChatPage() {
  return <ProtectedRoute><AIChatDashboard /></ProtectedRoute>;
}