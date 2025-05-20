import './Page404.scss'

import { Button, ConfigProvider } from 'antd';

import { selectUser } from '../../redux/features/counterSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Page404() {
  const user = useSelector(selectUser);
  const nav =useNavigate();

  let homeLink = "/";
  if (user?.Role === "Admin") {
    homeLink = "/dashboard";
  } else if (user?.Role === "Staff") {
    homeLink = "/dashboard/staff";
  } else if (user?.Role === "Customer") {
    homeLink = "/";
  }

  return (
    <div className="page404">
      <h1>404</h1>
      <h3>Oops, This Page Not Found!</h3>
      <h4>The link might be corrupted.</h4>
      <p>or the page have been removed.</p>
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
        <Button onClick={() => nav(homeLink)} className="page404__button">Go back</Button>
      </ConfigProvider>
    </div>
  );
}

export default Page404
