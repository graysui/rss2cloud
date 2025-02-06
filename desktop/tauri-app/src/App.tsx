import React, { useState } from "react";
import { Layout, Menu, theme } from "antd";
import {
  LoginOutlined,
  SettingOutlined,
  CloudServerOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import "./styles.css";
import Login from "./components/Login";
import RssManager from "./components/RssManager";
import Settings from "./components/Settings";
import TaskList from "./components/TaskList";

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <Login />;
      case "2":
        return <RssManager />;
      case "3":
        return <TaskList />;
      case "4":
        return <Settings />;
      default:
        return <Login />;
    }
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="logo" />
        <Menu
          theme="dark"
          selectedKeys={[selectedKey]}
          mode="inline"
          onClick={({ key }) => setSelectedKey(key)}
          items={[
            {
              key: "1",
              icon: <LoginOutlined />,
              label: "登录",
            },
            {
              key: "2",
              icon: <CloudServerOutlined />,
              label: "RSS管理",
            },
            {
              key: "3",
              icon: <UnorderedListOutlined />,
              label: "任务列表",
            },
            {
              key: "4",
              icon: <SettingOutlined />,
              label: "设置",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
