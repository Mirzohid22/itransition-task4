import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tag, message } from "antd";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUsers, setUpdate, setSelectedUsers, setSelectedKeys } from "../app/features/users";

const Users = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { admin } = useSelector((state) => state.admin);
    const [loading, setLoading] = useState(false);
    const { users, update, selectedKeys } = useSelector((state) => state.users);
    const [messageApi, contextHolder] = message.useMessage()

    const tableColumns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "Email",
            dataIndex: "email",
        },
        {
            title: "Last login",
            dataIndex: "lastOnline",
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (status) => {
                let color = status === "active" ? "green" : "red";
                return (
                    <Tag color={color} key={status}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        }
    ];

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            dispatch(setSelectedUsers(selectedRows));
            dispatch(setSelectedKeys(selectedRowKeys));
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === "Disabled User",
            // Column configuration not to be checked
            name: record.name,
        }),
        selectedRowKeys: selectedKeys,
    };

    useEffect(() => {
        if (!admin) {
            navigate("/login");
        }
        if (admin && (users.length === 0 || update)) {
            const cancelToken = axios.CancelToken.source();
            setLoading(true);
            const fetchUsers = async () => {
                await axios
                    .get("https://itransitiont4bymirzohid.onrender.com/users", {
                        headers: {
                            'x-access-token': admin?.token,
                        },
                    })
                    .then((res) => {
                        const { status, users } = res.data;
                        if (status === "success") {
                            dispatch(setUsers(users));
                            dispatch(setUpdate(false))
                        }
                    })
                    .catch((err) => {
                        if (axios.isCancel(err)) {
                            messageApi.info("request canceled")
                        } else {
                            const { response: { status, message } } = err
                            if (status === 'error') {
                                messageApi.error(message)
                            }
                        }
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            };
            fetchUsers()
            return () => {
                cancelToken.cancel()
            }
        }
    }, [update, dispatch]);

    return (
        <>
            {contextHolder}
            <Table
                size="small"
                rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                }}
                columns={tableColumns}
                dataSource={[...users].reverse()}
                rowKey={(record) => record._id}
                loading={loading}
                bordered
                pagination={{ pageSize: 8 }}
                scroll={{ x: 240 }}
            />
        </>
    );
};
export default Users;
