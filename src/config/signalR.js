import * as signalR from "@microsoft/signalr";


const getToken = () => localStorage.getItem("token");
const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://localhost:7085/notificationHub", {
    withCredentials: true,
    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
    accessTokenFactory: getToken,
    
  })
  .configureLogging(signalR.LogLevel.Debug)
  .withAutomaticReconnect()
  .build();

  async function startConnection() {
  try {
    await connection.start();
    console.log("SignalR Connected.");
  } catch (err) {
    console.error("SignalR Connection failed: ", err);
    setTimeout(startConnection, 5000); // Thử lại sau 5s
  }
}

startConnection();

export default connection;
