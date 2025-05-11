export interface IMessage {
  _id: string;
  sender: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface IChat {
  _id: string;
  student: IUser;
  admin: IAdmin;
  messages: IMessage[];
  lastUpdated: string;
  unreadCount?: number;
}

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImg: string;
}

export interface IAdmin {
  _id: string;
  email: string;
  name: string;
  profileImg: string;
}
export interface ICreateChatParams {
  studentId: string;
  adminId: string;
}

export interface ICreateOrGetChatInputs {
  params: ICreateChatParams;
  role: string;
}

export interface ISendMessageParams {
  chatId: string;
  content: string;
}

export interface ISendMessageInputs {
  params: ISendMessageParams;
  role: string;
}

export interface IGetChatByIdInputs {
  chatId: string;
  role: string;
}

export interface IGetAdminIdResponse {
  adminId: string;
}

export interface IChatState {
  chats: IChat[];
  currentChat: IChat | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  messages: IMessage[];
  unreadCount: number;
  isTyping: boolean;
  typingUser: ITypingUser | null;
  adminId: string;
  userStatuses: { [userId: string]: "online" | "offline" };
}

export interface ITypingUser {
  id: string;
  type: string;
}
