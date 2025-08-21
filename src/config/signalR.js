import * as signalR from "@microsoft/signalr";

const getToken = () => localStorage.getItem("token");

const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://localhost:7085/notificationHub", {
    withCredentials: true,
    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
    accessTokenFactory: getToken,
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

// let isStarted = false;

export const startConnection = async () => {
  if (connection.state === signalR.HubConnectionState.Disconnected) {
    try {
      await connection.start();
      console.log("✅ SignalR Connected");
    } catch (err) {
      console.error("SignalR Connection failed:", err);
      setTimeout(startConnection, 5000); // thử lại sau 5s nếu fail
    }
  } else {
    console.log("SignalR already connected or connecting:", connection.state);
  }
};


export default connection;
