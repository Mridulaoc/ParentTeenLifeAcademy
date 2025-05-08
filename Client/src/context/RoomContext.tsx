// import { createContext, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import socketIOClient from "socket.io-client";

// const WS = import.meta.env.VITE_API_BASE_URL;
// type RoomProviderProps = {
//   children: React.ReactNode;
// };
// export const RoomContext = createContext<null | any>(null);
// const ws = socketIOClient(WS);

// export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
//   const enterRoom = ({ roomId }: { roomId: "String" }) => {
//     console.log({ roomId });
//     window.location.href = `/room/${roomId}`;
//   };
//   useEffect(() => {
//     ws.on("room-created", enterRoom);
//   }, []);
//   return <RoomContext.Provider value={{ ws }}>{children}</RoomContext.Provider>;
// };
