import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Spin,
  Button,
  Space,
  Layout,
  Menu,
  theme,
  Divider,
  message,
} from "antd";
import {
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { setAdmin } from "./app/features/admin";
import axios from "axios";
import "./App.css";
import Users from "./components/users";
import { setUpdate, setUsers, setSelectedKeys } from "./app/features/users";

const { Header, Content, Footer } = Layout;

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { admin } = useSelector((state) => state.admin);
  const [loading, setLoading] = useState(false);
  const { selectedUsers, selectedKeys, update } = useSelector(
    (state) => state.users
  );
  const [messageAPI, contextHolder] = message.useMessage();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    if (!admin) {
      navigate("/login");
    }
  }, [admin, navigate]);

  const blockUsers = async () => {
    setLoading(true);
    if (selectedUsers.length === 0 || selectedKeys.length === 0) {
      messageAPI.warning("Please select users");
      setLoading(false);
      return;
    }
    if (!selectedUsers.some((user) => user.status === "active")) {
      messageAPI.warning("Please select at least one active user");
      setLoading(false);
      return;
    }
    const isAdminBlockingItself = selectedKeys.includes(admin?._id);
    await axios
      .put(
        "https://itransitiont4bymirzohid.onrender.com/deactivate",
        {
          users: selectedKeys,
        },
        {
          headers: {
            "x-access-token": admin?.token,
          },
        }
      )
      .then((res) => {
        messageAPI.info(res?.data?.message);
        dispatch(setUsers(res?.data?.data));
      })
      .catch((err) => {
        messageAPI.error(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
        dispatch(setUpdate(!update));
        dispatch(setSelectedKeys([]));
        if (isAdminBlockingItself) {
          messageAPI.info(
            "You have blocked yourself, you will be redirected to the login page"
          );
          setTimeout(() => {
            navigate("/login");
            dispatch(setUsers([]));
            dispatch(setAdmin(null));
          }, 2000);
        }
      });
  };

  const activateUsers = async () => {
    setLoading(true);
    if (selectedUsers.length === 0 || selectedKeys.length === 0) {
      messageAPI.warning("Please select users");
      setLoading(false);
      return;
    }
    if (!selectedUsers.some((user) => user.status === "blocked")) {
      messageAPI.warning("Please select at least one blocked user");
      setLoading(false);
      return;
    }

    await axios
      .put(
        "https://itransitiont4bymirzohid.onrender.com/activate",
        {
          users: selectedKeys,
        },
        {
          headers: {
            "x-access-token": admin?.token,
          },
        }
      )
      .then((res) => {
        messageAPI.info(res?.data?.message);
        dispatch(setUsers(res?.data?.data));
      })
      .catch((err) => {
        messageAPI.error(err?.response?.data?.message);
      })
      .finally(() => {
        setLoading(false);
        dispatch(setSelectedKeys([]));
        dispatch(setUpdate(!update));
      });
  };

  const deleteUsers = async () => {
    setLoading(true);
    if (selectedUsers.length === 0 || selectedKeys.length === 0) {
      messageAPI.warning("Please select users");
      setLoading(false);
      return;
    }

    const isAdminDeletingItself = selectedKeys.includes(admin?._id);

    await axios
      .delete("https://itransitiont4bymirzohid.onrender.com/delete", {
        data: {
          users: selectedKeys,
        },
        headers: {
          "x-access-token": admin?.token,
        },
      })
      .then((res) => {
        messageAPI.info(res?.data?.message);
        // dispatch(setUsers(res?.data?.data));
      })
      .catch((err) => {
        messageAPI.error(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
        dispatch(setUpdate(!update));
        dispatch(setSelectedKeys([]));
        if (isAdminDeletingItself) {
          messageAPI.info(
            "You have deleted yourself, you will be redirected to the login page"
          );
          setTimeout(() => {
            navigate("/login");
            dispatch(setUsers([]));
            dispatch(setAdmin(null));
          }, 2000);
        }
      });
  };

  return (
    <Layout className="layout">
      <Spin spinning={loading}>
        {contextHolder}
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Menu
            theme="dark"
            mode="horizontal"
            selectable={false}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <Menu.Item key={"admin's name"}>
              Hello <b>{admin?.name || "Anonymous"}</b>
            </Menu.Item>
            <Menu.Item key={"sign out"}>
              <Button
                type="primary"
                onClick={() => {
                  dispatch(setAdmin(null));
                  dispatch(setUsers([]));
                  navigate("/login");
                }}
              >
                Sign Out
              </Button>
            </Menu.Item>
          </Menu>
        </Header>
        <Content
          style={{
            padding: "10px",
            minHeight: "82vh",
          }}
        >
          <div
            className="site-layout-content"
            style={{
              background: colorBgContainer,
              padding: "50px 50px 0",
            }}
          >
            <Space style={{ padding: 0 }}>
              <Button
                type="primary"
                danger
                icon={<LockOutlined />}
                onClick={blockUsers}
              >
                Block
              </Button>
              <Button
                icon={<UnlockOutlined />}
                onClick={activateUsers}
              ></Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={deleteUsers}
              />
            </Space>
            <Divider />
            <Users />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          Itransition training ©2023 Created by{" "}
          <a href="https://github.com/Mirzohid22" target="_blank" rel="noreferrer">
            Mirzohid Salimov
          </a>
        </Footer>
      </Spin>
    </Layout>
  );
};
export default App;
