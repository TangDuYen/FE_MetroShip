import './Page404.scss'

import { Button, ConfigProvider } from 'antd';

import { selectUser } from '../../redux/features/counterSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Page404() {
  const user = useSelector(selectUser);
  const nav =useNavigate();

  let homeLink = "/";
  if (user?.role === "Admin") {
    homeLink = "/dashboard/admin";
  } else if (user?.role === "Staff") {
    homeLink = "/dashboard/staff";
  } else if (user?.role === "Customer") {
    homeLink = "/";
  }

  return (
    <div className="page404">
      <h1>404</h1>
      <h3>Không thể tìm thấy trang này!</h3>
      <h4>Liên kết có thể bị hỏng.</h4>
      <p>hoặc trang này đã bị xóa.</p>
      <ConfigProvider
        theme={{
          components: {
            Button: {
              defaultColor: "white",
              defaultBg: "#0066CC",
              defaultBorderColor: "#0066CC",
              defaultHoverBorderColor: "#FFC107",
              defaultHoverColor: "black",
              defaultHoverBg: "#FFC107",
              defaultActiveBg: "#0066CC",
              defaultActiveBorderColor: "#0066CC",
              defaultActiveColor: "white",
            },
          },
        }}
      >
        <Button onClick={() => nav(homeLink)} className="page404__button">Quay về</Button>
      </ConfigProvider>
    </div>
  );
}

export default Page404
